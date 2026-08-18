# Motivator - 休息提醒 🌸

[英文](README.md) | **简体中文**

[![](https://vsmarketplacebadges.dev/version-short/ssnoodles.motivator-vscode-extension.svg)](https://marketplace.visualstudio.com/items?itemName=ssnoodles.motivator-vscode-extension)
[![](https://vsmarketplacebadges.dev/installs-short/ssnoodles.motivator-vscode-extension.svg)](https://marketplace.visualstudio.com/items?itemName=ssnoodles.motivator-vscode-extension)
[![](https://vsmarketplacebadges.dev/downloads-short/ssnoodles.motivator-vscode-extension.svg)](https://marketplace.visualstudio.com/items?itemName=ssnoodles.motivator-vscode-extension)

一款可爱的 VS Code 扩展，定时提醒你休息、保护眼睛，在编程时保持健康！

## 功能特性

- ⏰ **定时提醒** — 支持固定时间间隔或 Cron 表达式
- 🖼️ **图片与视频面板** — 以全屏面板随机或按顺序展示图片和 MP4 视频
- ⏱️ **状态栏倒计时** — 每次提醒后显示休息倒计时，结束时闪烁提示
- 💬 **激励语句** — 内置 20 条中英文消息，并支持完全自定义
- 🔔 **弹出通知** — 右下角通知会在 5 秒后自动关闭，可独立开关
- 🌐 **双语界面** — 自动识别 VS Code 的显示语言（中文 / 英文），也可手动设置

## 命令

| 命令 | 说明 |
|------|------|
| `Motivator: ▶ Start Reminder` | 启动提醒服务 |
| `Motivator: ⏹ Stop Reminder` | 停止提醒服务 |
| `Motivator: 🌸 Show Now` | 立即触发一次提醒（同时启动倒计时） |
| `Motivator: ⚙ Open Settings` | 打开扩展设置 |

你也可以点击状态栏中的时钟图标，立即触发一次提醒。

## 设置

| 设置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `motivator.language` | string | `"auto"` | 界面语言：`auto`、`zh` 或 `en` |
| `motivator.enabled` | boolean | `true` | VS Code 启动时自动启动提醒 |
| `motivator.scheduleType` | string | `"interval"` | 调度模式：`interval` 或 `cron` |
| `motivator.intervalMinutes` | number | `60` | 提醒间隔（分钟），当 `scheduleType` 为 `interval` 时使用 |
| `motivator.cronExpression` | string | `"0 * * * *"` | Cron 表达式，当 `scheduleType` 为 `cron` 时使用 |
| `motivator.breakDurationMinutes` | number | `5` | 休息倒计时时长（分钟，5–60） |
| `motivator.imageOrder` | string | `"random"` | 图片顺序：`random` 或 `sequential` |
| `motivator.imagesPath` | string | `""` | 自定义图片文件夹的绝对路径；留空则使用内置 `images/` 文件夹 |
| `motivator.customMessages` | array | `[]` | 自定义提醒消息；留空则使用内置消息 |
| `motivator.showNotification` | boolean | `true` | 在右下角显示弹出通知，5 秒后自动关闭 |
| `motivator.showWebview` | boolean | `true` | 打开图片面板 |

## Cron 表达式示例

```text
每小时的整点：          0 * * * *
每 30 分钟：              */30 * * * *
工作日 9:00–18:00 每小时： 0 9-18 * * 1-5
每天 15:00：              0 15 * * *
```

## 自定义图片

1. 将图片或视频（`.png .jpg .jpeg .gif .webp .svg .bmp .mp4`）放入扩展目录内的 `images/` 文件夹；或
2. 在设置中将 `motivator.imagesPath` 指向你的图片文件夹。

## 开发

```bash
npm install
npm run compile
```

然后在 VS Code 中按 `F5` 启动扩展开发主机。

## 打包

```bash
npm i -g @vscode/vsce
vsce package
```

## 许可证

MIT
