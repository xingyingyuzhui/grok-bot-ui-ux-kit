# Grok Bot 0.68.1：静态视觉设计说明

**结论：安装包带有完整的设计变量、主题生成器、字体与组件样式，可以建立可信的 UI 样式参考。这里没有启动原应用、登录账号或观察实际画面，因此不能把参考页当作截图复刻或体验审计。**

## 证据范围

- 原始材料：`../reference/renderer`，本报告只读这些文件。
- 主样式：[index-DLJ0gwBH.css](../reference/renderer/assets/index-DLJ0gwBH.css)，663,915 字节，绝大多数为压缩的 StyleX 原子类。
- 主题生成器：[index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js)。本文 JS 定位采用 **0 起始字符偏移**，不是压缩文件的行号。
- 可复用数据：[design-tokens.json](../tokens/design-tokens.json)。136 个 Sand 语义颜色变量的浅色定义与 CSS `:root,.sand-1wuigm2` 全部一致。深色值来自明确的调色板与语义表达式；提取脚本只解析有限的字面量/已知表达式，没有执行目标 JavaScript。
- REA renderer 分析证据：`ev_37ea2ba040342adc818604b2c0f30221fe136dac5a0409ff512c3e0bbfda1eb3`，[renderer-rea-evidence.json](../evidence/renderer-rea-evidence.json.gz)。519 个 JavaScript 文件成功解析，关系图受资源预算限制，`coverage: partial`。本文视觉锚点另由直接读 CSS/JS 得出，不把 REA 的关系覆盖范围扩展为运行时观察。
- 未恢复原 TSX、设计稿、页面截图；未知当前账号偏好、实验开关和实际启用的字体。

## 主题与颜色

**静态观察：** CSS 内同时含 `cursor-*` 与 `sand-*` 变量。不能直接把文件前段默认的 Cursor 深色值当作最终应用外观。JS 的 `nhe` / `oHe`（约字符 1,172,700–1,173,320）生成并插入 `sand-cursor-theme` 样式，设置 `data-theme=cursor-light|cursor-dark` 与 `colorScheme`；`zpe` 把 Cursor 语义变量映射到 Sand 变量。

| 用途 / CSS 变量 | 浅色 | 深色 |
|---|---|---|
| 页面 `--sand-bg-base` | `#fcfcfc` | `#070707` |
| 次表面 `--sand-bg-subtle` | `#f7f7f7` | `#111111` |
| 第三表面 `--sand-bg-tertiary` | `#f4f4f4` | `#151515` |
| 浮层 `--sand-bg-elevated` | `#fcfcfc` | `#181818` |
| 主文字 `--sand-text-primary` | `#141414` | `#fcfcfc` |
| 次文字 `--sand-text-secondary` | `#14141499` | `#fcfcfc99` |
| 第三文字 `--sand-text-tertiary` | `#1414149c` | `#fcfcfc8f` |
| 主按钮 `--sand-fill-primary` | `#070707` | `#fafafa` |
| Agent 气泡 `--sand-fill-bubble-agent` | `#eeeeee` | `#262626` |
| 用户气泡 `--sand-fill-bubble-user` | `#070707` | `#5a5a5a` |
| 默认边框 `--sand-border-default` | `#14141426` | `#fcfcfc26` |

来源：JS `ys`（字符 647,060）、`gr`/`Ms`（651,498）、`Zm` 与 `hZ`（约 802,000–809,540）；逐变量精确锚点在 JSON `tokens[].source`。

**生成主题的重要覆盖：** `Hpe`（1,163,484）将 `--sand-fill-accent` 及 hover/disabled/subtle 系列映射到黑白主色/次表面，所以生成主题的强调按钮是黑白体系。原始语义表中同名 accent 的蓝色值并不是这里的最终覆盖结果。`Wpe`（1,163,895）默认把 checked 控件指向 `var(--sand-fill-success)`，可被显式传入的自定义颜色替换。JSON `light` / `dark` 已应用这些有证据的覆盖，原始定义留在 `tokens`。

蓝色 `#1084fe` 仍在色阶、图表和相关语义中使用；成功绿色 `#00c972`、警告橙黄 `#ff9800`、危险红 `#ff263c`，并有橙、棕、青、紫、洋红辅助色阶。颜色系统以实色、透明色和语义映射组织，而不是只有少量硬编码颜色。

**设计推断：** 产品主界面偏低彩度，通过浅深表面、文字透明度、边框和少量状态色建立层级；这是根据样式定义的判断，尚未确认每个组件在实际页面的占比。

## 字体、字号、行高

| 等级 | 字号 | 行高 |
|---|---:|---:|
| xxs | 11px | 16px |
| xs | 12px | 16px |
| sm | 13px | 18px |
| base | 14px | 20px |
| lg | 15px | 22px |
| xl | 17px | 24px |
| xxl | 22px | 28px |
| xxxl | 26px | 32px |

来源：CSS `:root,.sand-1i0a8np`（字号）、`:root,.sand-wedd3g`（行高），`sand-1ywxvvw`（字重）。默认 regular / medium / semibold 为 400 / 500 / 600。JS `Ffe`（约 1,139,600）针对 macOS 把 regular 设为 420 或 425，属于光学重量调整。

主字体存在两个路径：

- 系统路径：`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`；等宽使用 `ui-monospace`、SFMono、Menlo、Monaco 等。
- `isXvfTypeface` 开关启用时：`XVF` 与 `XVF Mono`。对应 `X-VF-C7NyO54W.woff2` / `XMono-VF-K4lk0ar0.woff2`；CSS `@font-face` 声明 200–800 可变字重与 `font-display:fallback`。

`nhe` 明确按开关选择字体；仅发现字体资源不足以确认用户实际看到 XVF。`Qpe` 开启后还改变字距、菜单行距、头像间距等。`isChatProse15px` 条件又会启用 `Jpe` 的菜单尺寸映射；名称本身不证明所有正文此时都是 15px。

## 间距、圆角与尺寸

- 间距体系以 **4px** 为一个主要单位，提供 1px、2px、3px、小数单位和负间距，主样式选择器 `:root,.ui-au7cpu`。常用 8、12、16、20、24、32px。
- 基础 CSS 的 Cursor 圆角为 6 / 8 / 12 / 14 / 16 / 18px，**主题生成器 `Zpe`（约 1,171,350）覆盖 base / lg / xl / 2xl / 3xl 为 8 / 10 / 14 / 16 / 18px**。复用外观时应采用生成值。
- Sand 消息正文：22px 行高，块垂直 padding 7px，单行高度 36px，气泡圆角 18px。CSS `:root,.sand-17gkl6d`。
- 菜单默认行高 30px、字号 13px、行间距 4px、整体圆角 12px、行圆角 6px。CSS `:root,.sand-16ng3gd`。新聊天菜单对应 14px / 8px。
- XVF 条件路径 `Qpe`：菜单行高 32px、行间距 6px；Agent 头像间距 10px、标题间距 1px、条目圆角 12px；命令面板行间距 10px。`Jpe` 条件路径菜单圆角 16px、行圆角 10px、命令面板圆角 18px。源常量约字符 487,872–488,038。
- CSS 全局 `-electron-corner-smoothing:60%` 提供 Electron 平滑圆角。普通浏览器参考页可能只能近似标准 border-radius。

## 阴影、动效和交互状态

**静态观察：** JS `ga` 定义 control / inline / popover / modal / window 阴影，浮层和模态窗区分距离与扩散范围；浅色采用轻透明阴影，深色对应的很多 shadow token 为透明 `#00000000`。`--sand-blur-background` 在主题生成器中为 24px。不能从变量存在推断所有面板都应用毛玻璃。

CSS `:root,.ui-1edrit9` 定义 50 / 100 / 150 / 200 / 300ms 时长。基础按压缩放 `--ui-press-scale:.98`（`.ui-1uburmg`），部分图标按钮使用 .94。JS `IDe` 定义卡片展开 240ms、收起 300ms、分区显现 260ms，且存在弹簧曲线。

可访问性样式有明确代码证据，但未做实际键盘走查：

- 常规可聚焦元素 `:focus-visible` 使用 2px 焦点框。
- 消息行动锚点用 `.sand-message-focus-ring` 内嵌焦点框，排除 `data-peeking` 情境。
- `forced-colors:active` 切换到 CanvasText 焦点框。
- 81 处 `prefers-reduced-motion:reduce` 条件可减少动画/过渡；各处的覆盖效果未运行验证。
- `html[dir=rtl]` 与逻辑方向属性说明存在 RTL 样式适配。
- 全局禁止选择，输入、textarea、可编辑元素显式开启文本选择。聊天内容是否全都可选要看对应组件类，不能由全局规则独立判断。

## 桌面浮动输入面板：可直接复用的明确组件规则

来源：[desktop-mount-panel-ClcOEGzG.css](../reference/renderer/assets/desktop-mount-panel-ClcOEGzG.css)，这一小文件拥有未混淆选择器，证据比原子类更直观。

| 选择器 | 结构或样式 |
|---|---|
| `#panel` | 底部固定，56px + 自适应两列，列间距 12px，整体高 176px，padding 12px |
| `#mark` | 56 × 56px 角色标记，浅深主题都有细 drop-shadow |
| `#mount-trigger` | 圆形拖拽入口，active 缩放 .95；dragging 时 grabbing |
| `#bot-menu` | 宽 200–280px，最大高 296px，padding 4px，圆角 12px，0.5px 边框，96% 不透明表面 |
| `.bot-menu-item` | 32px 行高，20px 图标 + 文本 + 16px 勾选的三列，8px 间距，行圆角 8px |
| `#composer` | 默认不可见；`data-expanded=true` 以透明度、位移、clip-path 展开 |
| `#prompt` | 高 44–140px，padding 12px 44px 12px 16px，单行胶囊圆角，多行 `data-expanded` 改 18px |
| `#send` | 28 × 28px 圆形发送按钮，右/底各 8px，active 缩放 .94 |

空输入/disabled 的发送按钮不透明度 .35；`data-state=failed` 输入框改红边；hover 与 focus-visible 增强输入边框。这些是 CSS 状态规则观察，未验证发送/拖拽时真实事件流。

## 图标、图片与特殊内容

renderer 资源清单：22 个 woff2、14 个 PNG、6 个 SVG、1 个 WebP、1 个 JPG、5 个 WAV、4 个 CSS。

- 字体：19 个 KaTeX woff2 用于数学排版，另有 XVF、XVF Mono、cursor-icons。主图标字体 `cursor-icons-16-gwXtdAvu.woff2` 为 125,344 字节；CSS `.ui-1dgk36h` / `.ui-1qt6sjn` 使用 `font-family:cursor-icons`。
- App 图标 `app-icon-C7NKj2u7.png` 为 256 × 256px。
- 连接器/服务标识：Apollo、Ashby、Box、Clay、Databricks、Nooks、QuickBooks、Rippling、Snowflake、Tableau、ZoomInfo 的 PNG 均为 128 × 128px；Calendly、Canva、Mailchimp、Salesforce、Workday SVG 定义 32 × 32px。这里只能确认资源身份/尺寸，实际显示大小需要对应组件规则。
- `unify-cta-individual-CuibPM73.png` / `unify-cta-team-BjaeBmn3.png` 均为 250 × 111px；`context-folder-B7_jGHrF.webp` 存在。
- `markdown-math-katex-DijbQiNo.css` 专用于数学公式；`fullscreen-file-viewer-body-C0m-nKZz.css` 定义可选择的 PDF 透明文本层。
- Bot 角色外观还由 JS 生成 SVG（`--grok-bot-still-ink`、light/dark 媒体规则），因此外观不全是单独 PNG/SVG 文件。不要只靠 assets 图片数量判断视觉系统的复杂度。

## 可复用与仍未知

**可以准确复用：** 主题色/语义命名、浅深层级、字体路径、字号行高、主题圆角、菜单与消息气泡变量、桌面小面板明确状态、动效时长与图片资源。

**需要进一步验证：** 主聊天窗口真实布局/尺寸、当前启用的字体和实验开关、页面密度、hover/焦点在真实 DOM 的组合效果、登录/联网后的页面、触控/键盘路径、文字截断和对比度是否满足实际场景。静态定义支持设计参考，尚不足以宣布像素一致复刻或整体 UX 质量结论。
