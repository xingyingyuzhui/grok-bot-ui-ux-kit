# 组件复刻规格

每节分为 **源码事实** 与 **复刻建议**。事实来自已拆包的 CSS / 编译 JS，没有启动原应用；推荐值解决静态证据尚未覆盖的实现空白。字符偏移为 **0 起始字符偏移**，适用于链接中的原打包文件。StyleX 选择器省略重复的 `:not(#\#)` 优先级后缀，类名保持真实。

共同资源：[颜色变量](../tokens/design-tokens.json)、[主 CSS](../reference/renderer/assets/index-DLJ0gwBH.css)、[视觉系统](visual-system.md)。应用状态和排版可以重写为自己的组件，不需要逐类复制压缩原子样式。

## 1. 按钮与图标按钮

**源码事实：** [index JS](../reference/renderer/assets/index-ByKx0M82.js) 的 `Ys` / `Pn`，`Ys` 字符 251,055、`Pn` 字符 253,790，对应 `.sand-button`。默认 size=`md`、variant=`secondary`、shape=`rounded`、frame=`container`；接受 leading/trailingIcon、快捷键、disabled、focusableWhenDisabled、nativeButton。

| size | 高度 | 左右 padding | 圆角 | 文本字号 / 行高 | 高度 / 圆角锚点 |
|---|---:|---:|---:|---|---|
| xs | 22px | 8px | 11px | Cursor sm：12/16px | `.sand-17rw0jw` / `.sand-1ctf4ec` |
| sm | 26px | 10px | 13px | Cursor sm：12/16px | `.sand-d7y6wv` / `.sand-9h44rk` |
| md | 30px | 13px | 15px | Cursor base：13/18px | `.sand-1gnnpzl` / `.sand-n5hx6u` |
| lg | 34px | 15px | 17px | Cursor base：13/18px | `.sand-90ne7k` / `.sand-mf3hgm` |
| xl | 38px | 18px | 19px | Cursor lg：14/22px | `.sand-16wdlz0` / `.sand-etvl1f` |

按钮不是通用 8px 圆角：上述尺寸有独立圆角。`shape=pill` 改 9999px；`frame=content` 改 padding，不能把 container 尺寸作为所有实例的最终尺寸。

| variant / 状态 | 源码事实 |
|---|---|
| primary | 背景 `--cursor-bg-accent`，hover `--cursor-bg-accent-hover`，文字 `--sand-text-on-accent`；生成主题把 accent 填充映射为黑白主色 |
| secondary | 背景 `color-mix(in srgb,var(--cursor-bg-tertiary) 82%,var(--cursor-bg-editor))`；hover `--cursor-bg-secondary`；主文字 |
| outline | 透明底与边框；hover `color-mix(in srgb,var(--cursor-bg-tertiary) 76%,transparent)` |
| ghost | 透明底、次文字；hover 主文字与 86% tertiary 透明混色 |
| disabled | `.sand-uhm2yv` opacity .56，`.sand-1s07b3s` cursor not-allowed；hover 规则排除 disabled |
| transition | background-color / border-color / color，140ms，`cubic-bezier(.16,1,.3,1)` |
| focus | 全局 2px focus-visible；`focusAppearance=none` 有独立取消规则，不能一律删除焦点 |

图标按钮 `Cs`（同文件字符 50,281）支持 filled/outline 图标、container/content 框、indicatorDot、tone、disabled。**主聊天输入动作**是更具体的实例：`Ts.actionCircle`（1,399,375）为 28×28px，图标调用 `iconSize:14`、glyph 容器 16×16px；附件 plus、发送 arrow-up、语音 mic/waveform 通过同一个动作区切换。发送 hover opacity .9、disabled .4，不同于普通按钮的 .56。

**复刻建议：** 使用原生 button；pending 动作加 `aria-busy` 与 loading 图标，避免重复提交。pending 不是此普通按钮组件已验证的统一状态，需由上层实现。未确认的图标 glyph 使用同尺寸替代并标记。

## 2. 输入框与主聊天 Composer

**源码事实：** 通用 `InputGroup.Root` / `g0`（[index JS](../reference/renderer/assets/index-ByKx0M82.js)，`g0` 字符 56,062（样式表在前段））默认 variant=`default`、size=`lg`、frame=`container`、shape=`rounded`；有 default/elevated/ghost/unfilled、mono、disabled、textarea layout。

| 通用 InputGroup 参数 | 已验证尺寸 / 样式 | CSS 锚点 |
|---|---|---|
| md 单行 | 高 24px，block padding 4px，inline padding 5px | `.ui-1e94bgo`、`.ui-174jhef`、`.ui-xlcw59` |
| lg 单行 | 高 28px，block padding 4px，inline padding 8px | `.ui-170hpbr`、`.ui-cby3z1` |
| xl | block padding 8px，inline padding 8px；此尺寸表未给固定高度 | `.ui-17wxzvn`、`.ui-cby3z1` |
| 默认框 | 1px 边框、通用 base 圆角（生成主题 8px）、`--cursor-bg-input-field` | `.ui-1cx02xk`、`.ui-1043rbw`、`.ui-1gwrjia` |
| 默认 stroke | `--cursor-stroke-secondary` | `.ui-l27skc` |

Textarea 有 minRows（默认 1）、maxRows、autoResize（默认 true）、失焦收成单行选项及 `field-sizing:content` 支持检测。输入组通过 context 把 disabled 传给子控件。

**主聊天 Composer 是独立组件，不能照搬 28px 输入组外框。** `.sand-prompt-shell` / `.sand-prompt-field` / `.sand-prompt-content`（index JS 约 1,433,962–1,444,900）组合输入、附件列表、reply pill、附件/语音/发送动作、错误 notice。发送/语音/附件错误均有独立 status 提示；一些 voice error 使用 `aria-live=polite`。状态输入参数包括 hasPayload、canSend、isRecording、isProcessing、isActivating、voiceIntent。

**复刻建议：** 主 Composer 尚未完整核对每个布局分支的外框尺寸：首版设 min-height 96px、max-height 240px、外框圆角 18px、padding 12px、动作行 gap 8px；这些是建议，不是提取事实。允许输入区独立增高，附件和回复区在上方；发送失败保留草稿并展示独立错误文字。空输入动作显示 mic/voice、存在 payload 时显示 send 的确切产品切换仍应按上层条件实现。

## 3. 消息气泡、正文与行动

**源码事实：** 主 CSS `.sand-1f5rttx` / `.sand-17gkl6d` 定义：

- Agent fill：浅 `#eeeeee` / 深 `#262626`；nested fill：浅 `#ececec` / 深 `#181818`。
- User fill：浅 `#070707` / 深 `#5a5a5a`；文字引用 `--cursor-text-invert`。
- 正文行高 22px，block padding 7px，单行高度 36px，圆角 18px。
- Sender name 使用 `--sand-text-secondary`。
- `.sand-message-action-anchor` 聚焦时显示内嵌 `.sand-message-focus-ring`，2px 框；`data-peeking` 情境排除该显示分支。

Markdown、代码、公式、PDF 并非纯文本；[KaTeX CSS](../reference/renderer/assets/markdown-math-katex-DijbQiNo.css) 与 [PDF 文本层 CSS](../reference/renderer/assets/fullscreen-file-viewer-body-C0m-nKZz.css) 是额外资源。不能只使用一组正文 CSS 覆盖所有内容类型。

**复刻建议：** 用户右侧、Agent 左侧、正文最大宽 760px、气泡横向 padding 12px、组间距 16px，均作为首版未验证布局值；保留多段内容和状态行。copy/reply/更多行动在 hover 或键盘 focus-within 时出现，并始终提供可访问名称。不要根据全局 user-select:none 推断消息一定不可选，最终正文类需另行验证。

## 4. 菜单、侧边栏与 Agent 条目

**源码事实：** CSS `.sand-16ng3gd` 默认菜单规格：行高 30px、字号/行高 13/18px、行 gap 4px；菜单圆角 12px、行圆角 6px；新聊天菜单 14/8px。字体开关会改变它们：

| 配置路径 | 已验证变化 |
|---|---|
| `Qpe` / XVF 开启 | 行高 32px，gap 6px；Agent 头像 gap 10px、标题 gap 1px、条目圆角 12px；palette 行 gap 10px |
| `Jpe` / 两个条件同时满足 | 菜单字号映射 Sand base=14px、行高20px；菜单/行圆角16/10px，palette圆角18px |

来源：[主题 JS](../reference/renderer/assets/index.eager-app-aiFqpW8R.js)，常量约 487,872–488,038；模板 1,171,350–1,172,690。静态包不能确认当前用户开关。

侧栏布局状态同文件约 617,390：默认展开宽 280px，收起宽 88px；expandedWidth / isCollapsed 可持久化。`SC` / `Ua`（634,714 / 641,912）依据窗口宽自动收起，设置 `data-sidebar-collapsed` 与 grid `sidebarPx minmax(0,1fr) auto`。主聊天保留宽度常量 424px；拖拽逻辑包含 210px / 220px 收起阈值与 240px 边界，不能把这些都称为同一个最小宽度。右信息面板默认宽 320px、默认关闭，和任务线程是不同面板。

Agent 条目是 button，包含头像、姓名、badge、时间、preview 和 trailing marker；expanded / 其他布局分支由 `data-layout` 控制。working 用活动文本，blocked preview 与 needs-attention 标记另有颜色；这些结构在 [index JS](../reference/renderer/assets/index-ByKx0M82.js) 约 242,000–251,700 可见。标题内 gap 6px（`.sand-17d4w8g`），预览行 gap 4px、min-height 18px（`.sand-1jnr06f` / `.sand-vrgn94`）。

**复刻建议：** 菜单宽 240px、内 padding 4px、图标 16px；菜单溢出独立滚动。Agent 未验证头像尺寸先选 32px，条目 min-height 56px；使用 title 与 preview 双层，时间右对齐。维持收起栏 88px 与展开 280px 的观测值。菜单键盘 loop/home/end 行为有组合控件代码，但不证明每个产品菜单启用全部选项；需实际实现与测试。

## 5. 任务线程与面板

**源码事实：** `.sand-task-thread__resize-handle`（[index JS](../reference/renderer/assets/index-ByKx0M82.js)，约 1,460,209）为 `role=separator`、`aria-orientation=vertical`，有 pointer resize 绑定。`.sand-chat` 接受 taskThreadLayout=`takeover` 等分支（约 1,856,022）；`SV`（字符 1,928,355）按 agentId/taskId 读取 entries、建立独立 composerDraft、附件、发送错误与线程 send target。

[主题/应用 JS](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) 约 508,350 定义 `--sand-task-thread-width`，toolbarMinHeight=38px；线程具体初始宽度未在本规格核实。任务侧面板不能直接套用信息面板的默认 320px。

**复刻建议：** split 线程初始 384px、可拖到 320–600px、header 至少 38px；空间不足时切换 takeover，并提供返回主聊天的动作。线程标题、正文滚动、底部输入相互独立。上述 width 和断点是复刻决策；不要写入观测 tokens。切换线程时应保存每个 agentId/taskId 的草稿，避免跨线程显示旧附件和错误。

## 6. 设置 Dialog、导航与设置行

**源码事实：** [设置布局 JS](../reference/renderer/assets/chunk-layout-DilXmZPB.js) 的 `Z` / `ts`，保留 `.sand-settings-dialog`、`.sand-settings-nav`、`.sand-settings-panel`。

| 部位 | 精确规则 | CSS 锚点 |
|---|---|---|
| dialog | width `min(900px,calc(100vw - 40px))`；max-width `calc(100vw - 32px)`；padding 0；base 背景 | `.sand-qzs4y3` / `.sand-1gy1zxj` |
| nav | 宽198px，padding16px 12px，gap2px，右边框.5px | `.sand-tqaf1t` / `.sand-yamay9` / `.sand-pdmqnj` / `.sand-195vfkc` / `.sand-128c8uf` |
| nav item | padding7px 9px，gap9px，圆角8px，图标调用15px | `.sand-m7lytj` / `.sand-rw5ot4` / `.sand-mmi0ta` / `.sand-ur7f20` |
| active item | `--sand-fill-ghost-selected`；`aria-current=page`、`data-active` | `.sand-luhinc`，JS约2917 |
| settings card | block padding8px、.5px默认边框、xl圆角（生成14px） | `.sand-13ly8rp` / `.sand-4hv7ue` / `.sand-1pkpdue` |

[设置行 JS](../reference/renderer/assets/chunk-settings-row-C4etneKJ.js) `es`（字符 2834）有 default/card 两种：default column-gap24px、row-gap8px、label为secondary/sm；card padding10px 14px、column-gap20px、label为primary/md。控制区 `margin-inline-start:auto`、basis=max-content；描述与 hint 单独显示。hover 让 anchor 入口可见（`--sand-anchor-reveal`），设置可以深链。

Settings Toast（index JS 643,104）错误为 `role=alert` / aria-live assertive，其他为 status / polite；图标 error=exclamation-circle、success=check。不是把所有通知都变为阻断 dialog。

**复刻建议：** Dialog 首版高度 min(680px,100vh−64px)，body 独立滚动、关闭按钮固定；高度未从本规格取得。窄窗口时建议 nav 转顶部菜单，但这个响应式决策未在原设置实现中验证。异步保存应显示 saving/saved/error，并保留当前设置值；不要把 loading、失败、管理策略禁用混为一个 disabled。

## 7. 工具卡、结果卡与连接器卡

**源码事实：** [已完成消息卡](../reference/renderer/assets/chunk-settled-message-card-CX77XS5_.js) `X` / `$`，结构为 leading + title + status，后接 summary、可选 note；section 使用 aria-labelledby 与 role=region。

| 部位 | 已验证规则 |
|---|---|
| card | width100%，padding12px，gap10px，圆角16px，overflow hidden；Agent bubble 背景 |
| title | Typography lg / medium，min-width0 |
| summary | Typography lg / secondary，nowrap + ellipsis |
| status | Typography sm / medium；成功绿色、其他secondary；可选圆点6×6px |
| note | Typography md / secondary；可选 |

CSS 锚点：`.sand-c7ga6q`、`.sand-883omv`、`.sand-gqmno8`、`.sand-18rdzox`、`.sand-lyipyv`、`.sand-uxw1ft`、`.sand-1v4s8kt`、`.sand-ols6we`。成功 badge 背景 `.sand-1buh4up` 指向 green-secondary。

这不是所有工具卡的统一外观。任务记录的图标映射（index JS `yPe` 字符1,537,784）：tool pending=`loading`，failed=`x-circle`，其他=`wrench`；user=`person-circle`、thinking=`thinking-medium`、assistant-text=`sparkle`、send-message=`send`。

[连接器卡](../reference/renderer/assets/chunk-native-connector-card-D-tJf6r2.js) 传递 displayName、description、iconId/iconUrl、isConnected、actionLabel、connectedLabel、surface；`surface` 默认 bubble，可跳转插件详情并 startConnecting。此适配器传给内部卡 `isActionPending:false` / `isAdminDisabled:false`，不能由此推断所有连接器永远没有 pending/admin-disabled。

**复刻建议：** 工具折叠态一行标题+状态，展开态显示参数/输出/附件和copy行动；运行中保留显式 loading 文案，失败保留错误摘要。结果卡的首版宽跟随消息列；连接器 logo 显示24px、card padding12px是未验证建议。服务PNG源128px、SVG32px不等于页面显示尺寸。

## 8. 桌面浮动面板

**源码事实：** [浮动面板 CSS](../reference/renderer/assets/desktop-mount-panel-ClcOEGzG.css) 使用清晰选择器，以下属于高可信可复用值。

| selector | 规格 |
|---|---|
| `#panel` | fixed底部，56px + 1fr 两列，gap12px，高176px，padding12px |
| `#mark` | 56×56px角色，浅深主题的细 drop-shadow |
| `#mount-trigger` | 圆形入口，active scale .95；dragging cursor grabbing |
| `#bot-menu` | 宽200–280px，max-height296px，padding4px，radius12px，.5px边框，96%表面 |
| `.bot-menu-item` | 高32px，20px图标 + 文本 + 16px勾选三列，gap8px，padding0 8px，radius8px |
| `#composer` | 默认隐藏；expanded以opacity/translate/clip-path展开；pointer-events随可见性切换 |
| `#prompt` | width100%，min/max-height44/140px，padding12px 44px 12px 16px，默认胶囊，多行radius18px，20px行高 |
| `#send` | 28×28px圆，right/bottom8px；active scale .94；浅深反转主色 |

Empty/disabled send opacity .35；failed prompt 红边；disabled prompt opacity .6；hover/focus 增强边框；placeholder空态与发送按钮关联。`#bot-menu [aria-checked=true]` 显示勾选，隐藏状态不可见；reduce-motion 移除位移/clip-path分支。浮动输入使用14px system-ui，与主窗口可选XVF路径不同。

**复刻建议：** 浏览器 demo 用绝对定位容器近似桌面窗口，并声明无法复刻系统级拖拽/置顶行为。展开状态、选Bot、输入失败、空输入、disabled应均可在demo中切换；真实事件流未运行验证。

## 实现验收清单

以下是复刻测试要求，**不是原应用已通过的测试结果**。

- 浅深主题分别验证 normal/hover/focus/disabled/selected/error/pending；不要只验静态首页。
- 30px普通按钮与28px输入动作的区别保留；精确padding/圆角优先采用本规格观测值。
- 开关导致的字号/菜单密度单独配置；截图比对前记录配置和窗口尺寸。
- 验证长标题、长工具输出、多附件、公式、代码块、RTL、小窗口和减弱动画。
- 侧栏/正文/线程/设置body独立滚动；键盘焦点不可被裁剪。
- 未验证的宽度和断点集中在应用配置中，避免混入精确提取的主题token。
