import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];

export class ImageManager {
  private images: string[] = [];
  private currentIndex: number = 0;
  private readonly extensionPath: string;

  constructor(extensionPath: string) {
    this.extensionPath = extensionPath;
  }

  /** Returns the images directory: custom path takes priority, falls back to the built-in `images/` folder. */
  private getImagesDir(): string {
    const config = vscode.workspace.getConfiguration('motivator');
    const customPath = config.get<string>('imagesPath', '');

    if (customPath && customPath.trim() !== '' && fs.existsSync(customPath)) {
      return customPath.trim();
    }

    return path.join(this.extensionPath, 'images');
  }

  /** Scans the images directory and refreshes the internal image list. */
  refresh(): void {
    const imagesDir = this.getImagesDir();

    if (!fs.existsSync(imagesDir)) {
      this.images = [];
      return;
    }

    try {
      const files = fs.readdirSync(imagesDir);
      this.images = files
        .filter(file => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()))
        .map(file => path.join(imagesDir, file))
        .sort();
    } catch {
      this.images = [];
    }
  }

  /** Returns the next image path in the configured order (random or sequential). Returns `undefined` when no images are available. */
  getNextImage(): string | undefined {
    if (this.images.length === 0) {
      this.refresh();
    }
    if (this.images.length === 0) {
      return undefined;
    }

    const config = vscode.workspace.getConfiguration('motivator');
    const imageOrder = config.get<string>('imageOrder', 'random');

    if (imageOrder === 'random') {
      return this.images[Math.floor(Math.random() * this.images.length)];
    } else {
      const image = this.images[this.currentIndex % this.images.length];
      this.currentIndex++;
      return image;
    }
  }

  /** Returns the resolved images directory path. */
  getImagesPath(): string {
    return this.getImagesDir();
  }
}
