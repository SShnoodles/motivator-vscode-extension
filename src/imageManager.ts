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

  /** 返回图片目录：优先使用用户自定义路径，否则回退到插件内置 `images/`。 */
  private getImagesDir(): string {
    const config = vscode.workspace.getConfiguration('motivator');
    const customPath = config.get<string>('imagesPath', '');

    if (customPath && customPath.trim() !== '' && fs.existsSync(customPath)) {
      return customPath.trim();
    }

    return path.join(this.extensionPath, 'images');
  }

  /** 扫描图片目录，刷新内部图片列表。 */
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

  /** 按配置的顺序（随机或顺序）返回下一张图片路径，无图片时返回 `undefined`。 */
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

  /** 返回图片目录路径。 */
  getImagesPath(): string {
    return this.getImagesDir();
  }
}
