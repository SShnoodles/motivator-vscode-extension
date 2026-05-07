import * as vscode from 'vscode';
import cron from 'node-cron';
import { ImageManager } from './imageManager';
import { MotivatorPanel } from './webviewPanel';
import { getRandomMessage } from './messages';

export class ReminderService implements vscode.Disposable {
  private cronTask: ReturnType<typeof cron.schedule> | null = null;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private flashTimer: ReturnType<typeof setInterval> | null = null;
  private countdownSeconds: number = 0;

  private readonly imageManager: ImageManager;
  private readonly extensionUri: vscode.Uri;
  private readonly statusBarItem: vscode.StatusBarItem;

  constructor(extensionUri: vscode.Uri, imageManager: ImageManager) {
    this.extensionUri = extensionUri;
    this.imageManager = imageManager;

    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'motivator.showNow';
    this.statusBarItem.show();
  }

  /** 读取配置并启动 cron 或固定间隔提醒计划。 */
  start(): void {
    this.clearSchedule();

    const config = vscode.workspace.getConfiguration('motivator');
    const enabled = config.get<boolean>('enabled', true);

    if (!enabled) {
      this.setStatusBar(false);
      return;
    }

    const scheduleType = config.get<string>('scheduleType', 'interval');

    if (scheduleType === 'cron') {
      const cronExpr = config.get<string>('cronExpression', '0 * * * *');

      if (!cron.validate(cronExpr)) {
        vscode.window.showErrorMessage(
          `Motivator: Cron 表达式无效: "${cronExpr}"，请检查设置。`
        );
        this.setStatusBar(false);
        return;
      }

      this.cronTask = cron.schedule(cronExpr, () => this.trigger());
    } else {
      const minutes = config.get<number>('intervalMinutes', 60);
      const ms = Math.max(minutes, 1) * 60 * 1000;
      this.intervalTimer = setInterval(() => this.trigger(), ms);
    }

    this.imageManager.refresh();
    this.setStatusBar(true);
  }

  /** 停止提醒计划。 */
  stop(): void {
    this.clearSchedule();
    this.setStatusBar(false);
  }

  /** 立即触发一次提醒，显示消息和图片。 */
  trigger(): void {
    const config = vscode.workspace.getConfiguration('motivator');
    const customMessages = config.get<string[]>('customMessages', []);
    const showNotification = config.get<boolean>('showNotification', true);
    const showWebview = config.get<boolean>('showWebview', true);
    const breakMinutes = config.get<number>('breakDurationMinutes', 5);

    const message = getRandomMessage(customMessages);
    const imagePath = this.imageManager.getNextImage();

    if (showWebview) {
      MotivatorPanel.show(this.extensionUri, message, imagePath);
    }

    if (showNotification) {
      vscode.window.showInformationMessage(`🌸 ${message}`);
    }

    this.startCountdown(breakMinutes * 60);
  }

  /** 启动状态栏倒计时，结束时闪烁提示。 */
  private startCountdown(seconds: number): void {
    this.clearCountdown();
    this.countdownSeconds = seconds;
    this.renderCountdown();

    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        this.clearCountdown();
        this.startFlash();
      } else {
        this.renderCountdown();
      }
    }, 1000);
  }

  /** 倒计时结束后闪烁状态栏提示"休息结束"。 */
  private startFlash(): void {
    let toggle = false;
    let count = 0;
    const MAX = 10;
    this.flashTimer = setInterval(() => {
      toggle = !toggle;
      count++;
      this.statusBarItem.text = toggle ? `$(bell) 休息结束！` : `$(bell) 💪 继续加油！`;
      this.statusBarItem.color = toggle
        ? new vscode.ThemeColor('statusBarItem.warningForeground')
        : new vscode.ThemeColor('statusBarItem.prominentForeground');
      if (count >= MAX) {
        clearInterval(this.flashTimer!);
        this.flashTimer = null;
        this.setStatusBar(!!this.cronTask || !!this.intervalTimer);
        MotivatorPanel.disposeAll();
      }
    }, 500);
  }

  /** 将倒计时秒数渲染到状态栏。 */
  private renderCountdown(): void {
    const m = Math.floor(this.countdownSeconds / 60).toString().padStart(2, '0');
    const s = (this.countdownSeconds % 60).toString().padStart(2, '0');
    this.statusBarItem.text = `$(coffee) 休息中 ${m}:${s}`;
    this.statusBarItem.tooltip = '休息倒计时进行中，点击立即再次触发提醒';
    this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
  }

  /** 清除倒计时定时器。 */
  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.flashTimer) {
      clearInterval(this.flashTimer);
      this.flashTimer = null;
    }
    this.countdownSeconds = 0;
  }

  /** 清除 cron 任务和间隔定时器。 */
  private clearSchedule(): void {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
  /** 根据激活状态更新状态栏文本和颜色。 */
  private setStatusBar(active: boolean): void {
    if (active) {
      const config = vscode.workspace.getConfiguration('motivator');
      const scheduleType = config.get<string>('scheduleType', 'interval');
      let schedule: string;

      if (scheduleType === 'cron') {
        schedule = config.get<string>('cronExpression', '0 * * * *');
      } else {
        const mins = config.get<number>('intervalMinutes', 60);
        schedule = `每 ${mins} 分钟`;
      }

      this.statusBarItem.text = `$(clock) 休息提醒`;
      this.statusBarItem.tooltip = '点击立即显示休息提醒';
      this.statusBarItem.color = undefined;
    } else {
      this.statusBarItem.text = `$(clock) 休息提醒 (已停止)`;
      this.statusBarItem.tooltip = '休息提醒已停止，点击立即触发一次';
      this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
    }
  }

  /** 清理所有资源，插件停用时自动调用。 */
  dispose(): void {
    this.clearSchedule();
    this.clearCountdown();
    this.statusBarItem.dispose();
    MotivatorPanel.disposeAll();
  }
}
