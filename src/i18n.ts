import * as vscode from 'vscode';

export type Locale = 'zh' | 'en';

/**
 * Determines the active locale in this order:
 * 1. motivator.language config (if not 'auto')
 * 2. VS Code display language (vscode.env.language)
 * 3. Fallback: 'en'
 */
export function getLocale(): Locale {
  const config = vscode.workspace.getConfiguration('motivator');
  const lang = config.get<string>('language', 'auto');
  if (lang === 'zh') { return 'zh'; }
  if (lang === 'en') { return 'en'; }
  return vscode.env.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const strings = {
  zh: {
    // --- Commands ---
    cmdStarted: '🌸 Motivator 休息提醒已开启！',
    cmdStopped: 'Motivator 休息提醒已停止。',

    // --- Errors ---
    invalidCron: (expr: string) =>
      `Motivator: Cron 表达式无效: "${expr}"，请检查设置。`,

    // --- Status bar ---
    statusBarActive: '$(clock) 休息提醒',
    statusBarActiveTooltip: '点击立即显示休息提醒',
    statusBarStopped: '$(clock) 休息提醒 (已停止)',
    statusBarStoppedTooltip: '休息提醒已停止，点击立即触发一次',
    scheduleEveryN: (mins: number) => `每 ${mins} 分钟`,

    // --- Countdown ---
    countdownText: (m: string, s: string) => `$(coffee) 休息中 ${m}:${s}`,
    countdownTooltip: '休息倒计时进行中，点击立即再次触发提醒',
    breakOver: '$(bell) 休息结束！',
    keepGoing: '$(bell) 💪 继续加油！',

    // --- Webview panel ---
    panelTitle: '🌸 休息一下~',
    htmlLang: 'zh-CN',
    htmlTitle: '休息一下',
    htmlBreakTime: '☕ 休息时间到啦！',
    htmlImgAlt: '休息提醒图片',
    htmlFooter: 'Motivator · 保持健康，才能更好地创造世界 💪',
  },

  en: {
    // --- Commands ---
    cmdStarted: '🌸 Motivator break reminder is now active!',
    cmdStopped: 'Motivator break reminder has been stopped.',

    // --- Errors ---
    invalidCron: (expr: string) =>
      `Motivator: Invalid cron expression: "${expr}". Please check your settings.`,

    // --- Status bar ---
    statusBarActive: '$(clock) Break Reminder',
    statusBarActiveTooltip: 'Click to show break reminder now',
    statusBarStopped: '$(clock) Break Reminder (stopped)',
    statusBarStoppedTooltip: 'Break reminder stopped. Click to trigger once.',
    scheduleEveryN: (mins: number) => `Every ${mins} min`,

    // --- Countdown ---
    countdownText: (m: string, s: string) => `$(coffee) Break ${m}:${s}`,
    countdownTooltip: 'Break countdown in progress. Click to trigger again.',
    breakOver: '$(bell) Break over!',
    keepGoing: '$(bell) 💪 Keep it up!',

    // --- Webview panel ---
    panelTitle: '🌸 Time for a Break~',
    htmlLang: 'en',
    htmlTitle: 'Take a Break',
    htmlBreakTime: '☕ Time for a Break!',
    htmlImgAlt: 'Break reminder image',
    htmlFooter: 'Motivator · Stay healthy, code better 💪',
  },
} as const;

/** Returns the localized string set for the current locale. */
export function t() {
  return strings[getLocale()];
}
