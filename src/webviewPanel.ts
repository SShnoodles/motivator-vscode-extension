import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { t } from './i18n';

/** Escapes HTML special characters to prevent XSS. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class MotivatorPanel {
  private static currentPanel: MotivatorPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  /** Creates (or recreates) the Webview panel and renders the reminder content. */
  static show(
    extensionUri: vscode.Uri,
    message: string,
    imagePath: string | undefined
  ): void {
    // Always recreate to show the latest locale and content.
    if (MotivatorPanel.currentPanel) {
      MotivatorPanel.currentPanel.dispose();
    }

    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : vscode.ViewColumn.One;

    const localResourceRoots: vscode.Uri[] = [extensionUri];
    if (imagePath) {
      localResourceRoots.push(vscode.Uri.file(path.dirname(imagePath)));
    }

    const panel = vscode.window.createWebviewPanel(
      'motivatorReminder',
      t().panelTitle,
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots,
        retainContextWhenHidden: false,
      }
    );

    const instance = new MotivatorPanel(panel, extensionUri);
    MotivatorPanel.currentPanel = instance;
    instance.render(message, imagePath);
  }

  /** Populates the panel HTML with the message and image; shows an emoji placeholder when no image is available. */
  private render(message: string, imagePath: string | undefined): void {
    let imageHtml = '';

    if (imagePath && fs.existsSync(imagePath)) {
      const imageUri = this.panel.webview.asWebviewUri(vscode.Uri.file(imagePath));
      if (path.extname(imagePath).toLowerCase() === '.mp4') {
        imageHtml = `<video src="${imageUri}" class="reminder-image" autoplay loop muted playsinline></video>`;
      } else {
        imageHtml = `<img src="${imageUri}" alt="${t().htmlImgAlt}" class="reminder-image" />`;
      }
    } else {
      imageHtml = `<div class="emoji-fallback">🌸</div>`;
    }

    this.panel.webview.html = this.buildHtml(escapeHtml(message), imageHtml);
  }

  /** Builds and returns the full reminder page HTML. */
  private buildHtml(message: string, imageHtml: string): string {
    return /* html */ `<!DOCTYPE html>
<html lang="${t().htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource} data:; media-src ${this.panel.webview.cspSource}; style-src 'unsafe-inline';">
  <title>${t().htmlTitle}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
                   'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%);
      animation: bgShift 12s ease-in-out infinite alternate;
      overflow: hidden;
    }

    @keyframes bgShift {
      0%   { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%); }
      33%  { background: linear-gradient(135deg, #c2e9fb 0%, #a1c4fd 50%, #d4fc79 100%); }
      66%  { background: linear-gradient(135deg, #fbc2eb 0%, #a18cd1 50%, #84fab0 100%); }
      100% { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%); }
    }

    .container {
      text-align: center;
      padding: 48px 44px;
      background: rgba(255, 255, 255, 0.88);
      border-radius: 32px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.18);
      backdrop-filter: blur(12px);
      animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-40px) scale(0.9); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      color: #e8637a;
      margin-bottom: 28px;
      letter-spacing: 3px;
    }

    .reminder-image {
      max-width: 100%;
      max-height: 360px;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      margin-bottom: 28px;
      object-fit: contain;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    .reminder-image:hover {
      transform: scale(1.03);
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
    }

    video.reminder-image {
      max-width: 100%;
      max-height: 360px;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      margin-bottom: 28px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    .emoji-fallback {
      font-size: 96px;
      margin-bottom: 20px;
      animation: bounce 2.5s ease-in-out infinite;
      line-height: 1;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      50%       { transform: translateY(-18px) rotate(3deg); }
    }

    .message {
      font-size: 20px;
      color: #5a3d5c;
      margin: 20px 0 36px;
      line-height: 1.8;
      font-weight: 500;
    }

    .footer {
      margin-top: 28px;
      font-size: 12px;
      color: #b09ab8;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">${t().htmlBreakTime}</div>

    ${imageHtml}

    <p class="message">${message}</p>

    <p class="footer">${t().htmlFooter}</p>
  </div>

</body>
</html>`;
  }

  /** Disposes the current panel if one exists. */
  static disposeAll(): void {
    MotivatorPanel.currentPanel?.dispose();
  }

  /** Disposes the panel and cleans up all Disposables. */
  dispose(): void {
    MotivatorPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }
}
