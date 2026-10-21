const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const { build } = require('esbuild');

async function verifyWindowFocus() {
  let imageRequests = 0;
  let notifications = 0;
  let countdowns = 0;
  const vscode = {
    window: {
      state: { focused: false },
      createStatusBarItem: () => ({ show() {}, dispose() {} }),
      withProgress: () => { notifications++; return Promise.resolve(); },
    },
    workspace: {
      getConfiguration: () => ({ get: (key, fallback) => key === 'showWebview' ? false : fallback }),
    },
    StatusBarAlignment: { Right: 1 },
    ProgressLocation: { Notification: 15 },
    ThemeColor: class {},
    env: { language: 'en' },
  };
  const bundle = await build({
    entryPoints: ['src/reminderService.ts'], bundle: true, write: false,
    platform: 'node', format: 'cjs', external: ['vscode', 'node-cron'],
  });
  const bundledModule = { exports: {} };
  vm.runInNewContext(bundle.outputFiles[0].text, {
    module: bundledModule, exports: bundledModule.exports,
    require: name => name === 'vscode' ? vscode : require(name),
    setInterval: () => { countdowns++; return 1; }, clearInterval() {},
    setTimeout, clearTimeout, console,
  });
  const service = new bundledModule.exports.ReminderService({}, {
    getNextImage: () => { imageRequests++; },
  });
  service.trigger();
  assert.deepEqual([imageRequests, notifications, countdowns], [0, 0, 0]);
  vscode.window.state.focused = true;
  service.trigger();
  assert.deepEqual([imageRequests, notifications, countdowns], [1, 1, 1]);
  vscode.window.state.focused = false;
  service.trigger();
  assert.deepEqual([imageRequests, notifications, countdowns], [1, 1, 1]);
  service.dispose();
}

async function verifyJxl() {
  const { default: encode, init } = await import('@jsquash/jxl/encode.js');
  await init(await WebAssembly.compile(await fs.readFile(require.resolve('@jsquash/jxl/codec/enc/jxl_enc.wasm'))));
  const source = { width: 2, height: 2, data: new Uint8ClampedArray([
    255, 0, 0, 255, 0, 255, 0, 255,
    0, 0, 255, 255, 255, 255, 255, 255,
  ]) };
  const encoded = await encode(source, { lossless: true });
  const wasm = await fs.readFile(path.join(__dirname, '../out/jxl_dec.wasm'));
  const wasmBuffer = wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength);
  const script = await fs.readFile(path.join(__dirname, '../out/jxlPreview.js'), 'utf8');
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('JPEG XL rendering timed out')), 10000);
    const canvas = {
      dataset: { wasmSrc: 'codec.wasm', jxlSrc: 'image.JXL' },
      getContext: () => ({ putImageData(image) {
        try {
          assert.equal(image.width, source.width);
          assert.equal(image.height, source.height);
          assert.deepEqual(Array.from(image.data), Array.from(source.data));
          clearTimeout(timeout);
          resolve();
        } catch (error) { clearTimeout(timeout); reject(error); }
      } }),
      replaceWith() { clearTimeout(timeout); reject(new Error('JPEG XL fell back to emoji')); },
    };
    vm.runInNewContext(script, {
      document: { querySelector: () => canvas, createElement: () => ({}) },
      fetch: async url => ({ ok: true, arrayBuffer: async () => url === 'codec.wasm' ? wasmBuffer : encoded }),
      WebAssembly, ArrayBuffer, Uint8Array, Uint8ClampedArray, TextDecoder, TextEncoder, URL, console,
      ImageData: class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } },
    });
  });
}

async function main() {
  await verifyWindowFocus();
  await verifyJxl();
  console.log('Passed: focused-window reminders and lossless JPEG XL rendering.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
