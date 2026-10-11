# Grok Bot 0.68.1 UI / UX 静态流程说明

范围：只读拆出的 `../reference/renderer` HTML 与打包 JavaScript，未运行原应用，未读取用户账户数据、凭据或后端。以下「观察」表示包内实际存在的代码或文案；「推断」是设计解读。没有实机截图，也不宣称静态代码实际执行过。

REA 解析证据：`renderer-rea-evidence.json`，Evidence ID `ev_37ea2ba040342adc818604b2c0f30221fe136dac5a0409ff512c3e0bbfda1eb3`。主调查记录为 519 个 JavaScript 解析成功；关系图预算导致 coverage partial，不能据此声称完整语义恢复。本说明补充有针对性的本地静态阅读，不等价于运行时验证。

## 引用规则

所有简写文件均位于 `reference/renderer`。JS 多为压缩文件，行号帮助有限，因此引用为**文件 + 精确可搜索锚点 + 从文件文本起始计算的零基字符偏移**，字符偏移不等于 UTF-8 字节偏移。可在编辑器搜索锚点定位，报告不复制整行 bundle。

- **M**：`assets/index-ByKx0M82.js` 主 UI / 装配。
- **A**：`assets/index.eager-app-aiFqpW8R.js` 状态、平台桥接、英文文案、语言映射。
- **P**：`assets/chunk-prompt-editor-DXTe_qPf.js` 富文本输入。
- **G**：`assets/chunk-view-BRMGAw-B.js` 通用设置内容。
- **中文文案**：`assets/chunk-agents-BH2NhSM4.js`、`assets/chunk-chat-4UyyZmYV.js`、`assets/chunk-settings-DXr0G-c3.js`、`assets/chunk-core-BEbjihst.js`。**A** `"zh-CN":()=>bt(`（181555 附近）明确映射这些文件；下面给出文案 ID，它们不是按文件名猜测的中文资源。

## 页面与分区

| 分区 | 包内观察与可见标签 | 依据 / 真实锚点 | 静态限制 |
|---|---|---|---|
| 应用入口 | 标题 Grok Bot；`#root` React 挂载；空白启动壳在 root 有内容后隐藏 | `index.html`：`<title>Grok Bot</title>`、`#root:not(:empty)+#sand-boot-shell`；**M** `createRoot(wx`（2002660） | 启动期间实际时长未知 |
| Bot / 聊天侧边栏 | 搜索、新建聊天、可展开/收起的紧凑侧边栏；展开态有收起按钮；支持拖拽调整宽度 | **M** `sand-agents-sidebar__search`（413074 附近）、`mkMLq4`（432512）、`tugdy6`（513714）、`sand-sidebar-resize-handle`（515203 附近）；中文 agents ID `A1taO8` / `hIQkLb` / `cyFaZJ` | 实际默认宽度、用户列表排序未知 |
| 侧边栏组织 | Bot 置顶、隐藏/恢复、分区；名称编辑；未读消息、任务入口 | **M** `sand-agents-sidebar__account-name`（382942）、`onHideFromSidebar`（420513）、`onShowInSidebar`（420990）；中文 agents `nWMRxa` 取消置顶、`rf+5cn` 在侧边栏显示、`6sOXlK` 未读消息、`GtycJ/` 任务 | 文案证明功能候选；具体分组默认规则未完整跟踪 |
| 主聊天 | 聊天头部包含电脑入口；消息流不只文字，包含 message、notice、attachment、审批、表单、MCP App、语音卡等 | **M** `sand-chat-header__computer`（706177）、`/features/chat/cards/message/message/card.ts` 与 `/features/chat/cards/send-message/user-form/card.ts`（1737xxx–1742xxx 组件注册表） | 注册表证明可装配卡片类型，不能证明本账户都能触发 |
| 输入框 | 多行富文本 textbox、拼写检查；内容/附件、回复对象、mention、skills、app actions、PR/MCP references；主/次输入框模式 | **P** `"aria-multiline":"true",role:"textbox"`（84600 附近）；**M** `function pF(t)`（1427880 附近）、`getMentionMembers`、`getSkills`、`composerMode` | 条件菜单可见性受 feature gates / 数据影响 |
| 任务线程 | 主聊天与任务线程分离；可关闭/调整线程宽度；足够宽时支持在主聊天旁显示 | **M** `sand-task-thread__resize-handle`（1460209）、`4SnhAz`（1460181）；**G** `function lt()`（63000）、`oQJQPF`（63187）、`zpafJ7`（63354）；中文 chat `/k5ck8` 关闭线程、`XYn9Hy` 此处消息就此任务发给 Bot | 并排开关受 `sand_tasks` gate 控制，窄屏具体断点未验证 |
| 设置 | 四个导航 general、computer、usage、updates；用量有条件隐藏 | **M** `Ry=[{id:"general"`（1617682）、`s.id!=="usage"||e`；中文 settings IDs `Weq9zb`、`9lzViG`、`6BjldL`、`qIrtcK` | 名称为通用 / 电脑 / 用量与账单 / 更新；实际默认页/可见性依状态 |
| 通用设置 | 外观、语言、通知声音、线程并排等；多个条件区块 | **G** `sand-settings-general`（684xx）、`aAIQg2`（47709）、`vXIe7J`（45208）、`wm7RV4`（50566）、`oQJQPF`（63187）；中文 settings `AQEPsg` 拼写说明、`RkLueX` 自动审核 | 区块 gate 与宿主平台会改变 UI；不要把全部候选一起当默认界面 |
| 桌面浮动输入面板 | 独立的小面板：Bot 标记按钮、切换 Bot 菜单、单行起始 textarea、箭头发送；初始 main hidden、composer inert | `src/electron-renderer/desktop-mount/panel/panel.html`：`id="mount-trigger"`、`aria-label="Switch bot"`、`id="composer" inert`、`id="send"` | 是否默认启用、出现在哪个屏幕角落未验证 |

## 关键操作与状态

### 输入与发送

1. **观察**：富文本编辑器 Enter（未按 Shift、且非 `isComposing`）提交；Shift+Enter 在列表等结构情况下另有换行处理；非列表的标准换行交由编辑器；Esc 在语音时取消并复焦，其他情况先取消回复，否则 blur。菜单打开时 Enter / Tab / Esc / 上下方向键交给菜单。**P** `handleKeyDown`（84900 附近），`k.key==="Enter"&&!k.shiftKey&&!k.isComposing`（85300 附近），`cancelReply()||P.dom.blur()`（85700 附近）。这是键盘代码阅读，未实测输入法。
2. **观察**：粘贴剪贴板文件会 `onStageFiles(K)`；某些纯文本可转成文件附件；多行粘贴经过富文本转换。**P** `handlePaste`（857xx–866xx），`const K=Zr(k.clipboardData)`、`E().onStageFiles(K)`。
3. **观察**：右侧圆形动作按钮随 payload / voice intent 变化，在 mic、waveform、arrow-up 间切换；有内容但 `canSend` 为假时禁用。**M** `sand-prompt-send`（1402988）、`q("mic","dictate")`（140335x）、`const G=a&&!l`、`const V=a?"submit":"button"`。
4. **观察**：附件按钮可展开动作菜单，含「添加附件」；主 composer 接收教任务/语音 memo 操作。**M** `scgxhp`（1402060 / 1407606）、`N7m8E+`（1407850）、`onTeachClick` / `onVoiceMemoClick`（1401000 附近）。中文 chat `yrMloC` 为「教它做一项任务」，core `zTyn2M` 描述录制步骤让 Bot 学习。教学完整流程未跟踪。
5. **观察**：消息存在等待发送、重新连接后发送、离线发送、失败重发与取消 queued 的 UI/动作。**M** `sNe={id:"Gl26Yv"}`（1323682）、`UR3CiL`（1325912）；**A** `resendFailed`（399612）、`cancelQueued`（同函数附近）。状态底层枚举含 `queued / prepared / dispatching / accepted-awaiting-echo`（**A** 210986 附近）。不能把它们画成经过验证的网络时序。

### 语音、消息与恢复

- **观察**：语音有 activating、recording、processing、stop-in-flight；录制 chip 有停止/取消与单独发送按钮。**M** `isRecording:de,isProcessing:ge,isActivating:ye,isStopInFlight:je`（1429xxx），`sand-prompt-voice-chip`（140397x）和 `sand-prompt-voice-send`（140461x）。中文 chat `+rJuax` 录制中、`nvOFfg` 转写中、`YPa5jn` 准备语音消息、`FK3oLp` 麦克风权限拒绝。
- **观察**：聊天覆盖/发消息暂停/电脑 rebuild lock/账户权限影响 composer。**M** `isSendingPaused`（1427668）、`isChatCovered`（1428xxx）、`rebuild-locked`（1427xxx）。用户不可交互状态是代码条件，不是单个静态截图能说明的。
- **观察**：聊天有 saved-message、加载失败、只读、断线后自动刷新等状态。**M** `goVP0n`（1374734）、`QfCTDv`（1461634）；中文 chat `WrEfex` 无法加载对话、`Et9Woa` 恢复连接后自动刷新、`QfCTDv` 此聊天仅供查看。
- **观察**：卡片机制承载需要用户操作的步骤；有 auto-review-approval、publish-approval、local-tool-permission、user-form 等真实注册项。**M** `$ze=Object.assign`（17377xx）、`Oze=Object.assign`（17423xx）。设计上可表现为聊天中的状态与动作卡片；每种卡片的完整生命周期未全部分析。

### 设置状态

- **观察**：外观与通知设置函数接收 `preference / setPreference / isPending / failure`；选择器、开关不是纯装饰。**G** `function Vs()`（47013）以及 `wm7RV4`（50566）邻近状态分支。中文 settings `0RUFwi` / `3XHx94` / `NMdQdl` 对应深色、浅色、系统；`eeSkqM` 对应 Bot 颜色上色说明。
- **观察**：语言选择器提供搜索与关闭标签。**G** `vXIe7J`（45208）、`RNnopd`、`RoIbhu`；**A** 提供 zh-CN / zh-TW 等语言资源映射。**M** `Nn.language.snapshots.subscribe`（199874x）在 resolved language 改变后 `window.location.reload()`，这是包内实现而非实测成功切换。
- **观察**：通用设置仍有平台与 feature gates。例如 **G** `sand_tasks`（63000 附近）、`sand_enable_accent_theming`（47013 附近）、`grok_bot_all_bots_color_theming`、`grok_bot_spend_approval_passkey`（513xx），以及 `platform` 条件。设计参考页宜展示代表性选项并标记其为静态复原。

## 面向 UI 预览的启动依赖

原版 `index.html` 不能直接当普通网页保证运行成功。真实入口先构建 Electron preload bridge，再构建客户端，最后 `createRoot`：

1. **A** `function FHe()`（1669172）读取 `globalThis.window?.desktop`，缺失即抛错。**M** 通过 import alias `AD as Cde` 调用它。
2. **A** `function UHe(e)`（1669417）在启动同步读取 `platform / isDev / usesProductionBackend / devVoiceHarness / getZoomFactor()`、`theme.initial`、`language.initial`、`foreverBox.egressTunnel.initial` / `initialStatus`、`foreverBox.webauthnProxy.initial`、`botColorInChat.initial`、`assistiveTech.initial`、`experiments.initialSnapshot`、`agent.initialRosterPhotoAccess` 等，同时装配许多 method wrappers；这是局部清单，不是完整 mock 合同。
3. **A** `function DHe()`（1624933）要求 `window.coordinatorPort` 对象提供 `claim`；`function xHe(e)`（1625125）执行 `claim({onPort})`、返回对象的 `request()`，再接收 MessagePort 的 message/close、postMessage、start 等。
4. **M** `performance.mark("sand.boot.entry")`（19957xx）、`const cr=Cde(),Ja=Nde(cr)`、`const sm=Pde({portBridge:Rde()})`（1996xxx）、`Nn.start()`（199926x），之后才 `createRoot`（2002660）。账户恢复、持久化、theme/language、实验 gate、roster/chat 数据由客户端参与决定。

**推断**：安全且诚实的 UI 设计参考应采用 HTML/CSS/资源与这些已证实分区做静态重建，明确标记「依据安装包的设计复原」，不伪造运行成功或登录态。真实截图需要运行原应用，由实际账户/窗口状态决定画面；本轮未执行。

## 设计解读与未知

- **推断**：产品把 Bot/聊天当持续工作的单位，侧边栏兼顾身份、组织与待处理状态；主聊天与独立任务线程允许保留上下文同时处理细项。依据是可折叠/可拖宽侧边栏、任务线程与并排开关，而不是品牌文案。
- **推断**：输入区采用状态驱动的渐进呈现：空态可语音，有文本/附件转发送，语音期间改为录制 chip；消息卡使审批、表单、文件和工具结果留在对话上下文内。依据是 composer 分支与卡片注册表。
- **未知**：真实默认屏幕、账户权限、实验开启情况、所有页面视觉层级、动画最终效果、实际响应时间、窄屏切换断点及完整无障碍行为。静态资源可以给出样式候选，最终效果需真实窗口确认。
