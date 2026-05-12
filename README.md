# Motivator - Break Reminder 🌸

[![](https://vsmarketplacebadges.dev/version-short/ssnoodles.motivator-vscode-extension.svg)](https://marketplace.visualstudio.com/items?itemName=ssnoodles.motivator-vscode-extension)
[![](https://vsmarketplacebadges.dev/installs-short/ssnoodles.motivator-vscode-extension.svg)](https://marketplace.visualstudio.com/items?itemName=ssnoodles.motivator-vscode-extension)
[![](https://vsmarketplacebadges.dev/downloads-short/ssnoodles.motivator-vscode-extension.svg)](https://marketplace.visualstudio.com/items?itemName=ssnoodles.motivator-vscode-extension)

A cute VS Code extension that reminds you to take regular breaks, protect your eyes, and stay healthy while coding!

## Features

- ⏰ **Scheduled reminders** — supports a fixed interval or a cron expression
- 🖼️ **Image panel** — opens a full-screen panel with your images, played randomly or sequentially
- ⏱️ **Status-bar countdown** — shows a break countdown after each reminder, then flashes when it ends
- 💬 **Motivational messages** — 20 built-in messages (English & Chinese); fully customizable
- 🔔 **Notification popup** — bottom-right toast notification, can be toggled independently
- 🌐 **Bilingual UI** — auto-detects VS Code display language (English / Chinese), or set it manually

## Commands

| Command | Description |
|---------|-------------|
| `Motivator: ▶ Start Reminder` | Start the reminder service |
| `Motivator: ⏹ Stop Reminder` | Stop the reminder service |
| `Motivator: 🌸 Show Now` | Trigger a reminder immediately (also starts the countdown) |
| `Motivator: ⚙ Open Settings` | Open extension settings |

You can also click the clock icon in the status bar to trigger a reminder instantly.

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `motivator.language` | string | `"auto"` | UI language: `auto`, `zh`, or `en` |
| `motivator.enabled` | boolean | `true` | Auto-start reminders when VS Code launches |
| `motivator.scheduleType` | string | `"interval"` | Schedule mode: `interval` or `cron` |
| `motivator.intervalMinutes` | number | `60` | Reminder interval in minutes (used when scheduleType is `interval`) |
| `motivator.cronExpression` | string | `"0 * * * *"` | Cron expression (used when scheduleType is `cron`) |
| `motivator.breakDurationMinutes` | number | `5` | Break countdown duration in minutes (1–60) |
| `motivator.imageOrder` | string | `"random"` | Image order: `random` or `sequential` |
| `motivator.imagesPath` | string | `""` | Absolute path to a custom images folder; leave empty to use the built-in `images/` folder |
| `motivator.customMessages` | array | `[]` | Custom reminder messages; leave empty to use built-in messages |
| `motivator.showNotification` | boolean | `true` | Show a notification popup in the bottom-right corner |
| `motivator.showWebview` | boolean | `true` | Open the image panel |

## Cron Expression Examples

```
Every hour on the hour:          0 * * * *
Every 30 minutes:                */30 * * * *
Weekdays 9 AM – 6 PM, hourly:   0 9-18 * * 1-5
Every day at 3 PM:               0 15 * * *
```

## Custom Images

1. Place images (`.png .jpg .jpeg .gif .webp .svg`) in the `images/` folder inside the extension directory, or
2. Set `motivator.imagesPath` in settings to point to your own images folder.

## Development

```bash
npm install
npm run compile
```

Then press `F5` in VS Code to launch the Extension Development Host.

## Packaging

```bash
npm i -g @vscode/vsce
vsce package
```

## License

MIT
