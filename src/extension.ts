import * as vscode from 'vscode';
import { ReminderService } from './reminderService';
import { ImageManager } from './imageManager';
import { t } from './i18n';

let reminderService: ReminderService | undefined;

/** Extension activation entry point. Initializes services and registers all commands. */
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
      vscode.window.showInformationMessage(t().cmdStarted);
    }),

    vscode.commands.registerCommand('motivator.stop', () => {
      reminderService?.stop();
      vscode.window.showInformationMessage(t().cmdStopped);
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

/** Cleans up resources when the extension is deactivated. */
export function deactivate(): void {
  reminderService?.dispose();
  reminderService = undefined;
}
