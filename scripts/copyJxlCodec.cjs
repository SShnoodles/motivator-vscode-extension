const fs = require('node:fs');
const path = require('node:path');

const source = require.resolve('@jsquash/jxl/codec/dec/jxl_dec.wasm');
fs.mkdirSync(path.join(__dirname, '../out'), { recursive: true });
fs.copyFileSync(source, path.join(__dirname, '../out/jxl_dec.wasm'));
fs.copyFileSync(require.resolve('@jsquash/jxl/LICENSE'), path.join(__dirname, '../out/jxl-LICENSE'));
