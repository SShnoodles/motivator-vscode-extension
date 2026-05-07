import * as vscode from 'vscode';
import { ReminderService } from './reminderService';
import { ImageManager } from './imageManager';

let reminderService: ReminderService | undefined;

/** 插件激活入口，初始化服务并注册所有命令。 */
export function activate(context: vscode.ExtensionContext): void {
  const imageManager = new ImageManager(context.extensionPath);
  reminderService = new ReminderService(context.extensionUri, imageManager);

  const config = vscode.workspace.getConfiguration('motivator');
  if (config.get<boolean>('enabled', true)) {
    reminderService.start();
  }

  context.subscriptions.push(
    reminderService,

    vscode.commands.registerCommand('motivator.start', () => {
      reminderService?.start();
      vscode.window.showInformationMessage('🌸 Motivator 休息提醒已开启！');
    }),

    vscode.commands.registerCommand('motivator.stop', () => {
      reminderService?.stop();
      vscode.window.showInformationMessage('Motivator 休息提醒已停止。');
    }),

    vscode.commands.registerCommand('motivator.showNow', () => {
      reminderService?.trigger();
    }),

    vscode.commands.registerCommand('motivator.openSettings', () => {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        '@ext:motivator motivator'
      );
    }),

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('motivator')) {
        reminderService?.start();
      }
    })
  );
}

/** 插件停用时清理资源。 */
export function deactivate(): void {
  reminderService?.dispose();
  reminderService = undefined;
}
