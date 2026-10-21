import decode, { init } from '@jsquash/jxl/decode';

/** Decode locally so JPEG XL also works in webviews without native support. */
async function renderJxl(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-jxl-src]');
  if (!canvas) {
    return;
  }

  try {
    const [wasmResponse, imageResponse] = await Promise.all([
      fetch(canvas.dataset.wasmSrc!),
      fetch(canvas.dataset.jxlSrc!),
    ]);
    if (!wasmResponse.ok || !imageResponse.ok) {
      throw new Error('Unable to load JPEG XL resources');
    }
    const codecOptions = {
      locateFile: () => canvas.dataset.wasmSrc!,
      wasmBinary: new Uint8Array(await wasmResponse.arrayBuffer()),
    };
    await init(codecOptions);
    const image = await decode(await imageResponse.arrayBuffer());
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas is unavailable');
    }
    canvas.width = image.width;
    canvas.height = image.height;
    context.putImageData(image, 0, 0);
  } catch (error) {
    console.error('Motivator: JPEG XL decoding failed', error);
    const fallback = document.createElement('div');
    fallback.className = 'emoji-fallback';
    fallback.textContent = '🌸';
    canvas.replaceWith(fallback);
  }
}

void renderJxl();
