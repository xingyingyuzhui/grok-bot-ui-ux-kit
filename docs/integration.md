# 在另一个项目中接入

把视觉资源与界面状态分开移植：先接主题、字体与原图标，再实现布局和基础组件，最后接业务数据和异步反馈。[工作台](../examples/workbench.html) 是状态测试的最小例子；[官网风格主预览](../index.html)与[对照说明](website-comparison.md)用于界面结构复刻；[UI/UX 规格](ui-ux-spec.md) 是完整行为索引。

## 1. 复制方式

推荐保留以下相对结构，放入目标项目例如 `vendor/grok-kit/`：

```text
grok-kit/
  src/             # 主题与输入适配器、样式及声明
  tokens/          # JSON、CSS、JS
  assets/
    fonts/
    images/
    audio/
    styles/
    icon-map.json
    manifest.json
```

目标构建器需要支持 CSS 的 `@import` 与相对 `url()`；会按引用复制字体。直接静态 HTML 使用 `<link rel="stylesheet" href="./vendor/grok-kit/src/styles.css">`。React/Vue/Svelte 可由自己的 CSS 构建入口导入这个样式文件。若改变目录，同步更改字体 URL。

只需要原始主题时导入 `tokens/themes.css`，自行编写全部组件。只读 JSON 不会自动把变量写入页面。`assets/styles/` 是原打包样式参考，不要与本仓库 CSS 一并全局加载：原子类、根变量和 Electron 规则可能覆盖目标项目。

本仓库的 package `private: true` 只防误发布到 npm，不代表 GitHub 仓库私有。无需 npm 安装即可复制使用；`exports` 供把此目录作为本地包接入时使用。原资源授权边界见 [NOTICE](../NOTICE.md)。

## 2. 启用主题与字体

```html
<html lang="zh-CN" data-grok-theme="light">
<body class="grok-surface">…</body>
</html>
```

```js
import { setTheme } from './vendor/grok-kit/src/index.js';

// 传入自己的偏好值 light / dark / system。
const dispose = setTheme(document.documentElement, 'system');
// 页面销毁时清理监听：dispose();
```

`setTheme` 返回清理函数；同一个 root 再次调用会解除旧监听。`system` 跟随 `prefers-color-scheme` 变化。库不负责保存偏好，目标应用需自己持久化。SSR 只在挂载后调用，因为默认 media 参数使用浏览器 window。已知偏好可由服务端先输出 `data-grok-theme` 避免闪烁。

默认系统字体；在根元素加 `data-grok-typeface="xvf"` 可展示打包 XVF / XVF Mono。原应用是否开启这一分支尚未运行确认。React 中可在 effect 调用并返回 dispose，Vue 中在 mounted 调用并在 unmounted 清理。

```css
.my-chat {
  background: var(--sand-bg-base);
  color: var(--sand-text-primary);
  border-color: var(--sand-border-default);
}
.my-agent-message { background: var(--sand-fill-bubble-agent); }
.my-user-message {
  background: var(--sand-fill-bubble-user);
  color: var(--sand-text-on-color);
}
```

同一组件应使用语义变量，不按主题写两份固定颜色。Sand 与 Cursor 排版尺寸不同，具体尺寸查 [视觉系统](visual-system.md)。

## 3. 基础组件接口

`src/styles.css` 提供 `.grok-button`、`.grok-button--primary`、`.grok-icon-button`、`.grok-input`、`.grok-bubble`、`.grok-bubble--user`、`.grok-menu`、`.grok-menu-row`、`.grok-card`、`.grok-status`。它们是简化参考类，**不是原版全部 variants 的恢复**。尺寸/颜色/动效的精确约束见 [组件规格](component-spec.md)。

```html
<button type="button" class="grok-button grok-button--primary" data-size="md">
  发送
</button>
<div class="grok-bubble grok-bubble--user">用户消息</div>
<span class="grok-status" data-state="failed">发送失败</span>
```

按钮 size 支持 xs/sm/md/lg/xl，高度 22/26/30/34/38px。工作台的动作按钮为了方便测试使用通用 30px；原主 composer 动作圆实际是 28px、图标14px。目标复刻要使用实例规格。工作台卡片样式、手动状态工具栏、消息文案和窄窗口弹窗属于本仓库示例选择。

图标使用 [icons.md](icons.md) 中的 `setIcon`；工作台另用 `.grok-icon` 加直接字形文本。两种渲染方式不要混用。图标-only 按钮提供 aria-label，装饰字形隐藏于无障碍树。

## 4. 输入与业务接口

```js
import { composerAction, shouldSubmit } from './vendor/grok-kit/src/index.js';

const result = composerAction({
  text: draft,
  attachments: stagedFiles,
  canSend: !requestInFlight,
  readOnly: false,
  voice: 'idle',
});
// result: {action, glyph, disabled, label}

function onKeyDown(event) {
  if (shouldSubmit(event, attachmentMenuOpen)) {
    event.preventDefault();
    // 将当前 botId/taskId/replyTargetId 与草稿交给你的发送逻辑。
  }
}
```

`shouldSubmit` 防 Shift+Enter、IME composition 和菜单打开误发送；它只判断快捷键，不发送消息。`composerAction` 是参考分支适配器，voice 值为 idle/activating/recording/processing；没有语音硬件或原服务实现。空输入显示语音、正文或附件显示发送；只读禁用，忙碌转写显示禁用状态。

发送需要目标项目实现：草稿快照 → 阻止重复提交 → 调用业务接口 → 成功清空 → 失败保留草稿并反馈 → 恢复可操作。草稿/暂存附件与消息记录分开保存。不要因客户端请求成功就伪造 Agent 完成状态。附件上限主聊天6、浮动板3；类型、上传、预览、持久化与限制错误由项目实现。

建议适配器 `sendMessage({botId, taskId, replyTargetId, text, attachmentIds})` 是本指南的建议接口名。原宿主暴露 `window.desktop` / coordinatorPort；浏览器不要复制原 preload、也不要自行伪造桥接对象启动原 bundle。原服务类型与建议接口的区分见规格的接入契约表。

## 5. 布局实施顺序

1. 实现 sidebar：默认280、最小240、最大400、折叠88；保留 expandedWidth 与手动折叠偏好，自动紧凑不覆盖偏好。
2. 实现主内容最小424与详情默认320/最小280；把窗口空间、已打开详情和主区一起计算。
3. 通过 ResizeObserver 测主内容，至少848才允许双424的线程并排。宽度分配公式和切换条件见规格；不要写 `@media(min-width:848px)` 代替。
4. 实现消息状态与输入草稿，再接菜单、详情和设置。任务输入保存独立 taskId；只读不会覆盖用户草稿。
5. 最后实现宿主菜单/快捷键、桌面浮动板、连接/审批/异常状态。Web 移动端适配是目标项目设计选择，另列验收。

## 6. 可运行示例的交互

工作台可以折叠/调整侧边栏、搜索/选择 Bot、新建聊天、输入/发送、暂存最多6附件、移除附件、选择下一消息状态、重试失败记录、取消等待记录、切只读、模拟语音、打开任务分区与设置。主题可浅/深/系统切换，字体可系统/XVF切换。

消息失败会保留输入；重试按钮只改变本地示例记录。附件只读取名称，不上传；模拟录制不请求麦克风。设置偏好没有持久化。任务卡与线程没有真实任务执行、独立富文本输入或原窗口桥。静态参数足以起步，原版一致性按 [验收清单](replication-checklist.md) 和 [截图观察计划](capture-plan.md) 验证。
