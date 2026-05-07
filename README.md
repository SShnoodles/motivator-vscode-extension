# Motivator - 休息提醒助手 🌸

一个可爱的 VS Code 休息提醒插件，定时提醒你起身休息、保护眼睛和身体健康！

## 功能

- ⏰ **定时提醒**：支持固定时间间隔或 Cron 表达式两种调度方式
- 🖼️ **图片展示**：到时间后打开漂亮的图片面板，支持随机或顺序播放
- 💬 **可爱提示语**：内置 20 条可爱的中文提示语，也可自定义
- 📊 **状态栏显示**：随时查看当前提醒状态

## 命令

| 命令 | 说明 |
|------|------|
| `Motivator: ▶ 开始提醒` | 启动提醒服务 |
| `Motivator: ⏹ 停止提醒` | 停止提醒服务 |
| `Motivator: 🌸 立即显示提醒` | 立即触发一次提醒 |
| `Motivator: ⚙ 打开设置` | 打开插件设置 |

也可以点击右下角状态栏的时钟图标立即触发提醒。

## 设置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `motivator.enabled` | boolean | `true` | 启动 VS Code 时自动开始提醒 |
| `motivator.scheduleType` | string | `"interval"` | 调度方式：`interval`（固定间隔）或 `cron` |
| `motivator.intervalMinutes` | number | `60` | 提醒间隔分钟数（scheduleType=interval 时有效） |
| `motivator.cronExpression` | string | `"0 * * * *"` | Cron 表达式（scheduleType=cron 时有效） |
| `motivator.imageOrder` | string | `"random"` | 图片顺序：`random`（随机）或 `sequential`（顺序） |
| `motivator.imagesPath` | string | `""` | 自定义图片文件夹绝对路径，留空使用内置 images 文件夹 |
| `motivator.customMessages` | array | `[]` | 自定义提示消息列表，留空使用内置消息 |
| `motivator.showNotification` | boolean | `true` | 是否显示右下角通知 |
| `motivator.showWebview` | boolean | `true` | 是否打开图片面板 |

## Cron 表达式示例

```
每小时整点提醒：    0 * * * *
每30分钟提醒：      */30 * * * *
工作日每小时提醒：  0 9-18 * * 1-5
每天下午3点提醒：   0 15 * * *
```

## 自定义图片
1. 将图片（支持 `.png .jpg .jpeg .gif .webp .svg`）放入 ~/.vscode/extensions/ssnoodles.motivator-vscode-extension-{version}/`images/` 文件夹，或
2. 在设置中配置 `motivator.imagesPath` 指向你自己的图片文件夹

默认内置 2 张 SVG 插图。

## 安装与启动

```bash
npm install
npm run compile
```

然后按 `F5` 在 VS Code 中启动扩展开发主机。

## 打包

```bash
npm i -g @vscode/vsce
vsce package
```

## 许可证

MIT
