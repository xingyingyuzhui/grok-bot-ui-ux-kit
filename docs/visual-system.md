# 视觉系统：实现规则与证据

这是一份从 Grok Bot 0.68.1 安装包提取的静态规格。原应用未启动，未获得实际截图或用户偏好；下述“源码事实”能支持样式实现，不能证明当前屏幕已应用全部开关。推荐值专门标记，不能视为恢复出的原设计稿。

## 从哪份颜色开始

以 [tokens/design-tokens.json](../tokens/design-tokens.json) 的 `light` / `dark` 映射为主题基础。它们包含 136 个 Sand 语义变量以及已验证的生成器覆盖。`tokens[]` 保存原表达式及 0 起始字符偏移；`generatedThemeOverrides` 记录覆盖来源。

不要把 [主 CSS](../reference/renderer/assets/index-DLJ0gwBH.css) 开头的 Cursor 默认深色值直接当作最终主题。[主题 JS](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) 的 `nhe` / `oHe`（字符约 1,172,700–1,173,320）会生成 `sand-cursor-theme` 样式，并设置 `data-theme=cursor-light|cursor-dark`。`zpe` 将 Cursor 语义变量映射到 Sand；原子类可以继续使用 Cursor 变量名。

| 语义 | 浅色 | 深色 |
|---|---|---|
| 页面 `--sand-bg-base` | `#fcfcfc` | `#070707` |
| 导航/次表面 `--sand-bg-subtle` | `#f7f7f7` | `#111111` |
| 第三表面 `--sand-bg-tertiary` | `#f4f4f4` | `#151515` |
| 浮层 `--sand-bg-elevated` | `#fcfcfc` | `#181818` |
| 主文字 `--sand-text-primary` | `#141414` | `#fcfcfc` |
| 次文字 `--sand-text-secondary` | `#14141499` | `#fcfcfc99` |
| 第三文字 `--sand-text-tertiary` | `#1414149c` | `#fcfcfc8f` |
| 主填充 `--sand-fill-primary` | `#070707` | `#fafafa` |
| Agent 气泡 `--sand-fill-bubble-agent` | `#eeeeee` | `#262626` |
| 用户气泡 `--sand-fill-bubble-user` | `#070707` | `#5a5a5a` |
| 默认边框 `--sand-border-default` | `#14141426` | `#fcfcfc26` |

**源码事实：** `Hpe`（1,163,484）将 `--sand-fill-accent` 映射到黑白 primary 体系；基础表中的蓝色 accent 被覆盖。`Wpe`（1,163,895）在没有传入自定义颜色时将 checked 控件映射到 `var(--sand-fill-success)`。因此“主要按钮黑白、勾选状态绿色”比“一律用蓝色按钮”更符合生成代码。

仍保留蓝 `#1084fe`、绿 `#00c972`、黄 `#ff9800`、红 `#ff263c` 及五组辅助色，用于状态、图表与其他语义。根据名字推断某个页面用途时，应继续追踪组件，而不是仅凭颜色变量归类。

## 排版：两套尺寸体系

**源码事实：** Sand 排版和 Cursor 兼容组件尺度同时存在。二者不可混用。

| Sand 等级 | 字号 / 行高 | Cursor 等级 | 字号 / 行高 |
|---|---|---|---|
| xxs | 11 / 16px | xs | 11 / 14px |
| xs | 12 / 16px | sm | 12 / 16px |
| sm | 13 / 18px | base | 13 / 18px |
| base | 14 / 20px | lg | 14 / 22px |
| lg | 15 / 22px | — | — |
| xl | 17 / 24px | — | — |
| xxl | 22 / 28px | — | — |
| xxxl | 26 / 32px | — | — |

CSS 锚点：`:root,.sand-1i0a8np`、`.sand-wedd3g`、`.ui-qruemj`、`.ui-1no9adk`。例如标准 Sand Button 使用 Cursor 字号变量，所以其 md 文本 13px；不要因 Sand base=14px 就把所有按钮改为 14px。

默认字体路径为系统 sans；等宽路径为 ui-monospace / SFMono / Menlo 等。`isXvfTypeface` 条件启用时采用 XVF 与 XVF Mono：

```css
@font-face {
  font-family: XVF;
  src: url('../reference/renderer/assets/X-VF-C7NyO54W.woff2') format('woff2');
  font-weight: 200 800;
  font-display: fallback;
}
@font-face {
  font-family: 'XVF Mono';
  src: url('../reference/renderer/assets/XMono-VF-K4lk0ar0.woff2') format('woff2');
  font-weight: 200 800;
  font-display: fallback;
}
```

以上 URL 以 `docs` 为相对位置示例；放入其他目录时调整路径。字重 regular/medium/semibold 为 400/500/600；JS `Ffe` 针对 darwin 的 regular 为 420 或 425（参数控制）。主字体是否已在原用户环境启用，静态材料不能确定。

XVF 的 `Qpe` 路径同时调整字距（多数 .01em，sm .015em）、菜单行高和条目间距；`Jpe` 仅在另一个开关同时满足时改变菜单字体/圆角。建议复刻项目把这些作为独立显式配置，不以浏览器平台猜开关。

## 间距和圆角

**源码事实：** 间距主要按 4px 递进，也存在 1/2/3px、小数单位和负间距。来源 `.ui-au7cpu`；常用 8、12、16、20、24、32px。

| 部位 | 已验证值 | 锚点 |
|---|---|---|
| 生成主题通用 base/lg/xl/2xl/3xl 圆角 | 8/10/14/16/18px | JS `Zpe`，约 1,171,350 |
| 聊天气泡 | 18px | CSS `.sand-17gkl6d` |
| 默认菜单整体/行 | 12/6px | CSS `.sand-16ng3gd` |
| 默认新聊天菜单整体/行 | 14/8px | 同上 |
| Sand Button md | 15px | CSS `.sand-n5hx6u`，不是通用 radius token |
| 已完成消息卡 | 16px | CSS `.sand-gqmno8` |
| 设置卡片 | `var(--cursor-radius-xl)`，生成后 14px | CSS `.sand-1pkpdue` |

Electron 全局 `-electron-corner-smoothing:60%` 不能保证在普通浏览器得到相同曲率。**复刻建议：** Web 版先使用精确 border-radius 数值，把平滑圆角视为平台增强；不要声称浏览器参考页与原应用像素一致。

## 浮层、状态和动效

**源码事实：** 阴影按 control / inline / popover / modal / window 分层；浅色使用轻阴影，深色语义表中许多 shadow 值为透明。JS `ga`（约 1,139,800）和 `Wpe` 定义组合；背景模糊变量为 24px，变量存在不证明每个面板都使用毛玻璃。

- 通用时长：50、100、150、200、300ms（CSS `.ui-1edrit9`）。
- Sand Button：140ms，`cubic-bezier(.16,1,.3,1)`，仅过渡 background-color / border-color / color。
- 卡片：展开 240ms、收起 300ms、分区 reveal 260ms（JS `IDe`，字符 488,807）。
- 一些控件按压 scale .98；浮动面板入口 .95、发送 .94。不能统一施加给所有控件。
- `prefers-reduced-motion:reduce` 出现 81 处，已确认存在对应覆盖；未逐页运行验证覆盖是否完整。

**复刻建议：** 把“可点击/选中/运行中/等待确认/失败/禁用”作为不同状态，不仅改变透明度。统一基础动效为 140–200ms，具体已验证组件保留原时长；异步动作通过 aria-busy 和文本反馈补充图标。

## 图标与资源

[资源目录](../reference/renderer/assets/) 中 22 个 woff2 包含 19 个 KaTeX 字体、XVF、XVF Mono、cursor-icons。主样式 `@font-face` 和 `.ui-1dgk36h` / `.ui-1qt6sjn` 使用 cursor-icons 字体。通用图标既可能来自 glyph，也可能来自生成 SVG；不要仅凭单独图片数推断图标数量。

- App 图标：`app-icon-C7NKj2u7.png`，256×256px。
- Apollo / Ashby / Box / Clay / Databricks / Nooks / QuickBooks / Rippling / Snowflake / Tableau / ZoomInfo：PNG，128×128px。
- Calendly / Canva / Mailchimp / Salesforce / Workday：SVG，32×32 viewBox。
- 两张 unify CTA：250×111px。
- 设置导航代码调用图标 `size:15`；主输入附件/发送图标 `iconSize:14`。
- KaTeX 与 PDF 文本层另有 CSS，复刻正文时保留公式字体与文本选择机制。

**复刻建议：** 封装 `Icon(name,size,variant)`，先保留被验证的语义名称和尺寸。无法准确映射的 glyph 用同尺寸占位图标，列为待确认，不凭同名替代声称完全相同。

## 焦点与验证边界

**源码事实：** 全局 focus-visible 为 2px；消息行使用 `.sand-message-focus-ring` 内嵌框；forced-colors 使用 CanvasText；RTL 使用 `html[dir=rtl]` 与逻辑方向属性；全局禁止选择，但输入/textarea/contenteditable 开启文本选择。

**复刻建议：** 原生 button/input/nav/section、可见焦点、键盘菜单、减弱动画与独立错误提示应在实现中验证。关闭外层滚动时，各面板必须独立滚动，否则小窗口会丢失操作。

REA renderer 证据 `ev_37ea2ba040342adc818604b2c0f30221fe136dac5a0409ff512c3e0bbfda1eb3` 解析了 519 个 JS，关系图预算导致 coverage partial。这里的 CSS 类和字符锚点是独立直接读取的观察；真实画面、账号状态、响应式触发效果仍未知。
