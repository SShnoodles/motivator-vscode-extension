import * as vscode from 'vscode';
import cron from 'node-cron';
import { ImageManager } from './imageManager';
import { MotivatorPanel } from './webviewPanel';
import { getRandomMessage } from './messages';
import { t } from './i18n';

const NOTIFICATION_DURATION_MS = 5_000;

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

  /** Reads config and starts the cron or fixed-interval reminder schedule. */
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
        vscode.window.showErrorMessage(t().invalidCron(cronExpr));
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

  /** Stops the reminder schedule. */
  stop(): void {
    this.clearSchedule();
    this.setStatusBar(false);
  }

  /** Immediately triggers one reminder, showing a message and image. */
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
      void vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `🌸 ${message}`,
        },
        () => new Promise<void>((resolve) => {
          setTimeout(resolve, NOTIFICATION_DURATION_MS);
        })
      );
    }

    this.startCountdown(breakMinutes * 60);
  }

  /** Starts the status-bar countdown; flashes an alert when it reaches zero. */
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

  /** Flashes the status bar to signal that the break is over. */
  private startFlash(): void {
    let toggle = false;
    let count = 0;
    const MAX = 10;
    this.flashTimer = setInterval(() => {
      toggle = !toggle;
      count++;
      this.statusBarItem.text = toggle ? t().breakOver : t().keepGoing;
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

  /** Renders the remaining countdown seconds to the status bar. */
  private renderCountdown(): void {
    const m = Math.floor(this.countdownSeconds / 60).toString().padStart(2, '0');
    const s = (this.countdownSeconds % 60).toString().padStart(2, '0');
    this.statusBarItem.text = t().countdownText(m, s);
    this.statusBarItem.tooltip = t().countdownTooltip;
    this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
  }

  /** Clears countdown and flash timers. */
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

  /** Clears the cron task and interval timer. */
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
  /** Updates status bar text and color based on whether the reminder is active. */
  private setStatusBar(active: boolean): void {
    if (active) {
      const config = vscode.workspace.getConfiguration('motivator');
      const scheduleType = config.get<string>('scheduleType', 'interval');
      let schedule: string;

      if (scheduleType === 'cron') {
        schedule = config.get<string>('cronExpression', '0 * * * *');
      } else {
        const mins = config.get<number>('intervalMinutes', 60);
        schedule = t().scheduleEveryN(mins);
      }

    this.statusBarItem.text = t().statusBarActive;
    this.statusBarItem.tooltip = t().statusBarActiveTooltip;
    this.statusBarItem.color = undefined;
  } else {
      this.statusBarItem.text = t().statusBarStopped;
      this.statusBarItem.tooltip = t().statusBarStoppedTooltip;
      this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
    }
  }

  /** Disposes all resources. Called automatically when the extension deactivates. */
  dispose(): void {
    this.clearSchedule();
    this.clearCountdown();
    this.statusBarItem.dispose();
    MotivatorPanel.disposeAll();
  }
}
