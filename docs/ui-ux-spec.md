# Grok Bot 0.68.1 UI / UX 行为规格

本文件指导独立项目复原安装包中可以证实的 UI 结构和交互。它不是原作者的设计文档，也不是运行原应用得到的验收结论。来源是拆出的 Electron renderer HTML、CSS 和 JavaScript；本轮未运行原应用、未登录、未取得真实窗口截图。

**标记规则**：`代码事实` 是静态代码/文案直接支持；`推导` 是基于公式的计算；`实现建议` 是参考项目自主选择；`未知` 是缺少运行时或完整路径验证。不可把建议值标成原版值。所有尺寸是 renderer 中的 CSS 逻辑像素，宿主缩放可能改变屏幕物理像素。

REA Evidence ID：`ev_37ea2ba040342adc818604b2c0f30221fe136dac5a0409ff512c3e0bbfda1eb3`。519 个 JS 文件解析成功，但关系图因预算限制 coverage partial；下面的定向阅读不能宣称完整语义恢复。源码索引位于文末，路径全部相对仓库的 `reference/renderer`。压缩源以可搜索锚点和零基**字符**偏移定位，字符偏移不等于 UTF-8 字节偏移。

## 1. 页面结构与导航

`代码事实`：主 UI 分为可折叠 Bot / 聊天侧边栏、主聊天、底部输入区、可选详情面板/电脑视图、可选任务线程、设置与其他叠层。可见区域由当前 Bot、任务、账户、连接、电脑重建状态和 feature gates 共同决定。不能把所有包内组件都拼到一个默认页面。

| 区域 / 页面 | 内容与导航事件 | 实现契约 | 来源 |
|---|---|---|---|
| 侧边栏 | 搜索 Bot、新建聊天、Bot 列表、置顶/分区、账户名、未读/任务状态 | 选择 Bot 改变当前聊天；紧凑形态保留入口；隐藏 Bot 与删除 Bot 要区分 | E15–E17；主 bundle 的 `onHideFromSidebar` / `onShowInSidebar` |
| 主聊天 | 头部 Bot/电脑入口、消息流、附件/状态/动作卡、回复定位 | 主消息流与任务线程有独立回复上下文；搜索命中可定位消息 | E19、E33；`sand-chat-header__computer` |
| 详情面板 | 单 Bot：overview、media、computer；群组：overview、media、members；members-only 只保留 members | 详情 tab 由对象类型决定，切换对象时验证 tab 仍有效 | E56 |
| 任务线程 | 当前任务的消息、专属输入区、关闭与宽度拖动 | 用户在此输入是对该任务回复；不能误送成主聊天消息 | E08、E11；中文 chat ID `XYn9Hy` |
| 设置 | 通用 general、电脑 computer、用量与账单 usage、更新 updates | 导航项是明确枚举；usage 可被条件隐藏；支持带 focusSetting 的定位入口 | E13、E14；G 的 `focusSetting` |
| 桌面浮动板 | Bot 标记按钮、Bot 菜单、小输入框、发送按钮 | 独立于主窗口；不是主聊天的缩小截图 | E47–E52；panel HTML |

`实现建议`：独立项目的 URL 可使用 `/chat/:botId`、`/chat/:botId/task/:taskId`、`/settings/:section`。这些路由是建议，原包的 UI 并非已经证实使用相同 URL。把当前 Bot、taskId、replyTargetId、设置叠层、详情 tab 作为不同状态，不要只保存一个 page 字符串。

## 2. 侧边栏、详情面板与任务线程尺寸

### 2.1 已恢复的尺寸和保存规则

| 项目 | 代码事实 | 来源 |
|---|---|---|
| 侧边栏 expandedWidth | 默认 280；保存值约束到 240–400 | E01、E05 |
| 手动折叠侧边栏 | 宽 88；初始 isCollapsed 为 false | E01；A 的 `dC={expandedWidth:Ju,isCollapsed:!1}` |
| 空间不足自动紧凑 | 当未手动折叠且 windowWidth < expandedWidth + 424 时渲染紧凑 | E02；A 的 `function Cm(e,t)` |
| 拖动跨折叠阈值 | expanded 状态拖宽 <210 时折叠；collapsed/自动紧凑时，拖动宽或剩余空间 <220 时继续紧凑 | E03、E04 |
| 拖动可用宽度 | 从 windowWidth 中减主内容最小 424 与已打开详情宽；可展开时再约束 240–400 | E03；A 的 `function nW(e)` |
| 详情宽度 | 默认 320，最小 280；动态显示宽不得超出侧边栏与主区保留后的空间 | E01；A 的 `function I4e(e)` |
| 侧边栏动画 | 激活动画属性时 duration .2s，普通状态 0s | E57；C 的 `--sand-sidebar-anim-duration:0s` |
| 保存边界 | ui-layout schema 3 标为 accountSensitive false；pinnedAgentIds/section folds 等 ui-agent-refs 标为 accountSensitive true | E55；A 的 `slice:"ui-agent-refs"` |

`代码事实`：自动紧凑与手动 `isCollapsed` 不是同一个状态。窗口变窄可仅改变渲染宽度而保留展开偏好；手动 toggle 则写入偏好。拖动应使用 pointer capture，pointerup/cancel/blur/lostpointercapture 和 Esc 结束操作并清理全局 cursor/userSelect（E58；M 中以 S4 别名使用）。`未知`：这里只恢复相关路径，没有实际验证所有宿主窗口扩宽请求和动画顺序。

`推导`：默认展开 280 时自动紧凑阈值为 704；展开宽 400 时为 824。它们来自 `expandedWidth + 424`，不能替换成一个固定的移动端媒体查询。

### 2.2 任务线程不是 viewport 848px 断点

`代码事实`：并排条件是任务功能开启、当前任务属于当前 Bot、其他导航排斥条件满足、用户选择并排，以及**主内容区实际测量宽度**至少 `2 × 424 = 848`。E07 的 `dre` 来自 A 导出 `sl as zs`，值 424；E09 使用 ResizeObserver 测量主内容。E08 中原始条件 `wn` 还包含 `C==null&&!ne&&!ee`，这里没有把所有局部变量完整重命名，不能声称已恢复全部排斥条件。

默认用户偏好：`isThreadSideBySideOptIn=false`，preferred width 为 null（E06）；设置开关受 `sand_tasks` gate 控制（E37）。足够宽且用户 opt-in 后并排，否则呈覆盖主聊天的线程布局。后一行为也由中文设置 `zpafJ7`「窗口足够宽时，在主聊天旁显示任务线程，而不是覆盖主聊天」支持。

原 CSS 默认公式（E10）：令 `A` 为线程与主聊天共享的可用内容宽，`m=424`，`p=preferredWidth`，无偏好时 p=50%：

```text
threadWidth = min(max(m, p), max(A / 2, A - m))
mainWidth = A - threadWidth
```

在并排 A≥848 时，上限为 A−424，下限为424，默认50%。例如：A=848 时 424/424；A=1000 默认500/500；A=1000 且 preferredWidth=650 时线程576、主聊天424。这里是 CSS 公式推导，不是实机尺寸测量。`--sand-chat-min-width` 可覆盖424，因此重建若修改该变量要同步阈值策略。

拖动步骤（E11、E12）：pointerdown 保存起点/当前 section 宽/方向；pointermove 计算新宽并写 CSS var；pointerup 等结束时读取实际 layout width，再持久化。持久化过滤只接受有限正数，CSS 负责最终约束。LTR/RTL 方向参与 delta 计算；不要只硬编码 `width -= deltaX`。

`实现建议`：在纯 Web 中用 ResizeObserver 测主内容容器，不请求扩宽宿主窗口；在拖动结束后保存已约束的实际宽度，避免过大的 preferredWidth 再次打开时跳变。分隔器还应提供键盘增减宽能力，但这项补强不是已验证的原版行为。

## 3. 组件输入与事件契约

下表的名称为方便复刻采用的接口名，**不是反编译出的原始 TypeScript 类型**。字段和事件来自代码观察，返回协议由实现项目自定。

| 组件 | 需要的输入 | 发出的事件 | 渲染约束 / 来源 |
|---|---|---|---|
| Sidebar | bots、selectedBotId、pinnedIds、sections、collapsedSectionIds、unread、layout、loading/failure | selectBot、newChat、search、toggleCollapsed、resize、pin/unpin、reorderPinned、toggleSection、retry | 折叠偏好与自动紧凑分开；只读展示当前失败并保留恢复数据。E01–E05、E15–E17 |
| ChatHeader | bot、isGroup、computerState、detailsOpen | openComputer、toggleDetails、openBotSettings | computer 入口可受状态限制；群组详情 tabs 不同。E56 |
| Transcript | entries、loading/error、savedSnapshotVisible、readOnly、replyTargetId、searchHit | replyTo、openThread、jumpToMessage、resend、cancelQueued、loadOlder | 渲染卡片的类型分派；不要只把 entries 拼成字符串。E26–E33 |
| Composer | initialPrompt/richText、attachmentPaths、replyTarget、composerMode、hasContent、isSendDisabled、isSendingPaused、isChatCovered、voiceState、suggestionProviders | promptChange、stageFiles、removeAttachment、clearReplyTarget、submit、teachTask、startVoiceCall、voiceMemo、dictate、stop/cancelVoice | 主/次输入模式分离；最大6个附件；禁用发送时不能丢草稿。E18–E25 |
| TaskThread | task、entries、preferredWidth、sideBySideOptIn、availableWidth | closeThread、submitTaskReply、resizeThread | 并排阈值基于主内容宽；taskId 必须随消息上下文保留。E07–E12 |
| ApprovalCard | requestId、entryId、botId、status、summary、detail、proposedRule、groupContext | approveOnce、deny、alwaysAllow、openRules | submitting 中禁用重复动作；expired 不再提供有效批准。E31、E32 |
| SettingsRow | value、disabled/policy、isPending、failure、description | change、retry、openPicker | 控件值与保存结果分开；显示 pending/failure，条件不可用时给出来源说明。E34–E38 |
| FloatingComposer | mount/currentBot、botChoices、expanded、prompt、submitting/failure | expand/collapse、switchBot、submit、movePanel、endPanelMove | 初始 hidden/inert，后端桥接返回 mount 决定可见；发送不能重复。E47–E52 |

`实现建议`：对独立参考项目定义只含演示数据的 view model，所有事件返回可控 Promise；禁止让展示组件直接调用 Electron bridge。真实数据接入由另一个 adapter 实现，保留演示可运行性。

## 4. 输入、附件与语音状态

### 4.1 富文本与键盘

`代码事实`（E22–E25）：输入为多行 textbox，spellcheck true。Enter 无Shift且非isComposing时提交；repeat 不重复发。菜单打开时 Enter/Tab/Esc/上下交给菜单。列表内 Shift+Enter 有专门 split/换行分支，非列表换行由编辑器处理。Tab 可调整列表缩进；不在列表且无Shift时尝试补全，否则插入 tab。Esc 在语音会话活动时取消并复焦；其他情况先取消回复，再 blur。中文输入法组合期间 Enter 不能触发提交。

粘贴文件加入 staged attachments；某些文本能被转换为文件附件；多行纯文本粘贴采用富文本转换逻辑。附件上限6（E18）；消息「最多只能添加 {maxStagedAttachments} 个附件」存在溢出反馈。`未知`：所有文件类型和每类大小限制未作为完整契约恢复，不能凭文案拼一个通用上传限额。

### 4.2 动作按钮与语音状态表

| UI 状态 | 代码事实 / 应呈现的动作 | 要保留的状态 | 来源 |
|---|---|---|---|
| 无文本/附件，语音可用 | 圆按钮可用 mic「开始语音输入」或 waveform 语音聊天；由 voice intent / 条件分支决定 | prompt 保留空态；不能保证所有账户默认同一图标 | E20；M 的 `voiceIntent` |
| 有文本或附件，可发送 | arrow-up，submit 类型 | richText、附件、replyTarget、task context | E19–E21 |
| 有 payload，canSend=false | 发送按钮 disabled | 草稿不可清除 | E21 |
| activating | 录音启动阶段由 isActivating 标识 | 保留来源 slotKey | E19；M 的 `isActivating:ye` |
| recording | 录制 chip、流/时长，停止与取消；语音 memo 有发送动作 | duration、stream、dictation/memo intent | M 的 `sand-prompt-voice-chip` / `sand-prompt-voice-send` |
| processing | 转写/准备语音消息反馈 | 不能当已发消息，允许相应错误恢复 | 中文 chat `nvOFfg` / `YPa5jn`；E19 |
| stop-in-flight | 独立 isStopInFlight 标记 | 防止重复 stop | M 的 `isStopInFlight:je` |
| voice error | 权限拒绝、无麦克风、转写/播放失败等文案 | 停留草稿并提供对应重试/系统提示 | 中文 chat `FK3oLp` / `HdSs2e` / `MfurAn` / `eX001i` |
| blocked/covered | access / rebuild lock / isSendingPaused / isChatCovered 影响交互 | 避免穿透覆盖层提交 | E19；M 的 `rebuild-locked` |

语音实时通话和语音 memo/听写是不同交互，不要把 waveform 按钮等同于「开始录音」。本表是静态分支集合，不是经过实测的完整状态机。`实现建议`：演示用状态菜单或 fixture 展示各态；不访问真实麦克风即可完成视觉复刻。

## 5. 消息状态、卡片与恢复

### 5.1 状态维度应分离

| 维度 | 已观察状态 / 用户文案 | 实现约束 | 来源 |
|---|---|---|---|
| 消息发送 | 内部 queued、prepared、dispatching、accepted-awaiting-echo；UI 等待发送、重新连接后发送、离线发送、失败重发 | accepted-awaiting-echo 不是模型已答复；不能提前移除待发送指示 | E26、E29、E30；中文 chat `i0MZ5f` / `Gl26Yv` / `UR3CiL` |
| 正在发送 | 已发送中的消息不能取消的文案 | cancelQueued 与 cancel ongoing 不混淆 | E26；中文 chat `bC9a5W` |
| transcript 数据 | loading/error、显示保存消息、只读、可能过时且恢复连接自动刷新 | 已保存内容仍可见并标注；readOnly 禁止 composer 的发送 | E27、E28；中文 chat `Et9Woa` / `WrEfex` |
| Bot 活动 | 输入中、工作、离线、未读、电脑唤醒/重连 | 活动状态与消息是否送达分别显示 | M 的 `OmANKk` / `PxYAul`；中文 agents `afTcdw` / `z2Cwm8` |
| 用户动作卡 | pending、approved、always、denied、expired | 提交期间禁用重复；stale 映射 expired；提交失败清 local answer 以便重新呈现 | E31、E32 |

`代码事实`：卡片注册表包括普通消息、notice、附件、user-form、auto-review-approval、publish-approval、local-tool-permission、connector、widget、MCP App、语音通话、任务/例行任务事件等（E33及邻近注册项）。这证明类型存在；不证明所有类型都在当前账户可触发。复刻至少需要通用 CardFrame，并为摘要、详情、动作组、pending/status、settled note 预留插槽。

审批卡（E31、E32）局部观察：pending/approved 默认不额外显示拒绝说明；always 可显示已保存规则；denied/expired 有明确结算文案；request stale 记录为 expired。`未知`：其他发布/本地权限/连接器卡的完整状态机未逐项分析，不要套用此审批卡的全部状态到每种卡。

`实现建议`：演示消息使用 fixture 注入状态，注明模拟；如果真实接服务，为队列项分配稳定ID，重复点击不能重复执行。列表更新要保留阅读位置、未读分界和 replyTarget，避免数据恢复时将用户强制滚到底部；这是一项 UX 建议，不是全路径运行时证明。

## 6. 快捷键

`代码事实`：A 的 jfe 显式把 mod 映射为 Mac meta、其他平台 ctrl（E43）。下表列 package 中动作注册，是否实际可执行仍受动作上下文/启用状态限制。很多动作允许 contentEditable，但并非全部。

| 键 | 注册动作 / 行为 | 来源 |
|---|---|---|
| Mod+K | commandPalette | E40 |
| Mod+Shift+F | focusSearch / 搜索 Bot | E40 邻近 |
| Mod+N | newAgent；官方中文 core ID `2hjDEV` 为「新建 Bot」 | E42 邻近；中文 core `2hjDEV` |
| Mod+Enter | send | E42 |
| Mod+I | focusInput | E42 邻近 |
| Mod+F | findInChat | E42 邻近 |
| Mod+B | toggleSidebar | E42 邻近 |
| Mod+, | openSettings | E42 邻近 |
| Mod+Shift+, | toggleAgentSettings（特定条件可不存在） | E45 |
| Alt+Up / Alt+Down | previousAgent / nextAgent | E46 |
| Mod+[ / Mod+] | navigateBack / navigateForward | E46 邻近 |
| Mod+1…9 | 根据当时侧边栏顺序选第1…9个 Bot | E41、E44 |
| Mod+L | addSelectionToPrompt | E42 邻近 |
| Mod+Shift+M / Mod+Shift+W | openTools / openSkills | E42 邻近 |
| Mod+Alt+B | toggleInfo；Mac 平台增加 Mod+Shift+I 别名（M 为 isMacPlatform，E60） | E42 邻近 `const At=` |
| Ctrl+Tab / Ctrl+Shift+Tab | 先移动 cycle cursor；松Ctrl确认选择；Esc取消 | E59及邻近 `Dq`（不声称 OS 会放行） |

编辑器内 Enter/Shift+Enter/Esc/Tab 见第4节；悬浮菜单按自己的键处理。`实现建议`：先检查 focus scope 和 modal lock，再运行全局动作；Web 页面浏览器保留快捷键可与上述动作冲突，应在 README/界面说明支持范围，而不是宣称桌面一致。

## 7. 设置、主题、语言

`代码事实`：四分区名称为「通用」「电脑」「用量与账单」「更新」，中文资源在 E39 指向的设置 chunk 中。通用包含账户/Bot相关项，以及外观、通知声音、线程等区块；多个区块受平台与实验 gate 控制。

| 设置类别 | 观察到的 UI/保存约束 | 来源 |
|---|---|---|
| 外观 | 系统/浅色/深色；preference、resolved theme 分开；存在 isPending/failure；部分 Bot 色彩选项受 gates 控制 | E34；中文 settings `NMdQdl` / `3XHx94` / `0RUFwi` / `eeSkqM` |
| 语言 | 选择器有搜索与关闭；Follow System、zh-CN/zh-TW 等资源；resolved language 改变后页面 reload | E36、E38、E39 |
| 通知声音 | 开关与声音选择独立；关闭 playSound 时 picker 也不可用；选声音触发预览播放器 | E35 与相邻函数 |
| 拼写 | 多行 editor 默认 spellcheck true；设置存在「输入时检查拼写」和说明 | E25；中文 settings `hzdQ0D` / `AQEPsg` |
| 线程 | 在主聊天旁打开线程；sand_tasks gate；并排偏好与实际宽度分开 | E06、E37 |
| 自动审核 | 自然语言规则、允许/先询问等行为；pending/failure/entry limit；控件有 Mod+Enter提交、Esc取消/清草稿 | G 的 `function es(s)`；中文 settings `RkLueX` / `NFRGrQ` |
| 平台/团队政策 | 已由管理员禁用/要求启用、平台不可用等明确文案 | 中文 settings `/Mb+jM` / `HrUSV3` |

`实现建议`：复刻 UI 保存主题、宽度等到独立本地存储，不使用原版 `sand.*` keys；展示设置请求的 pending/error。主题切换时所有弹层/代码/表单应同步变色，采用系统主题监听；独立应用如不 reload 语言应明确这是改善方案。未知项包括所有 gates 的实际默认开启情况、每个用户账户的可用设置和平台权限触发后的画面。

## 8. 桌面浮动输入板

`代码事实`：HTML 初始 `<main id="panel" hidden>`，composer inert，切换 Bot 菜单使用 role menu / menuitemradio / aria-checked；展开按钮 aria-expanded 反映状态。mount为null时隐藏；有mount后显示Bot图案/name，name作placeholder（E52）。

| 事件 | 原包处理 | 来源 |
|---|---|---|
| 点 Bot 标记 | toggle expanded；展开移除 inert 并 focus textarea | E47 |
| Esc（板展开） | 折叠并把焦点送回 trigger | E47 相邻 Y |
| blur | textarea 非disabled且trim后为空时折叠；非空草稿保留 | E47 相邻 Y |
| 右键 trigger | 打开/关闭 Bot 选择菜单；选中项或首项获焦 | E49 |
| 菜单上下/Home/End | 循环前后/首尾；Esc或Tab关闭；失焦/外点击关闭 | E49 |
| 选 Bot | 当前已选不发 switch；否则 switchTo({agentId}) | E49 |
| 拖 trigger | 移动距离至少4px才视为drag，调用 movePanel；结束调用endPanelMove；抑制拖动后的click | E50及 `function K(t,e)` |
| Enter | 非Shift、非isComposing才发；form submit同样发送 | E48 |
| submit | trim空白；空内容不发；禁用prompt/send；成功清文本并折叠；失败显示data-state failed；finally恢复disabled且展开时复焦 | E48 |
| 输入高度 | min44，max140；高度>52设置expanded数据属性 | E51及 `function y(t)` |

`未知`：显示位置默认值、实际系统层级、开机默认挂载哪个Bot、主题联动等未实测。`实现建议`：纯Web参考把面板放在明确的「浮动板演示」区域，position fixed 与 pointer拖动只影响页面内位置，不声称拥有 OS 桌面浮窗权限。

## 9. 实现边界与建议顺序

真实 index 依赖 `window.desktop`（E53）和 `window.coordinatorPort.claim`（E54），后者会接MessagePort；主题、语言、恢复、实验、聊天/roster都在客户端启动中参与。直接浏览器载入原入口不能保证运行，不能通过一个空object就声称恢复了真实应用。

1. `实现建议`：先完成 Shell/Sidebar/Transcript/Composer/TaskThread/Settings/FloatingPanel 的独立 view model；主题和资源读本仓库已整理的素材。
2. `实现建议`：用静态 fixture 覆盖交互状态；尺寸与快捷键遵循本规格，页面声明「设计复原 / 演示数据」。
3. `实现建议`：完成下一个文件中的复制验收清单，再接目标项目自己的服务/权限/文件适配器；不接原版账户和Electron桥。
4. `未知`：原版服务返回协议、实时交互时序、真实所有页面截图及性能没有恢复，不能作为此UI包保证。

## 10. 源码锚点索引

偏移按 Python `Path.read_text().find(anchor)` 对当前源计算；bundle 换版本或格式化后会改变。引用 `E## 邻近` 指同一附近函数，请使用动作名二次搜索定位。源文件是证据，文档是复刻规格；避免在产品界面展示压缩实现细节。

| ID | 仓库源文件 | 精确锚点 | 零基字符偏移 | 用途 |
|---|---|---|---:|---|
| E01 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `const Ju=280,ai=240,nl=400,uC=88,ed=320,vi=280,sl=424` | 617389 | 布局默认和尺寸常量 |
| E02 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function tW(e,t)` | 634652 | 空间不足自动紧凑 |
| E03 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function B4e(e,t,n,s)` | 642360 | 拖动折叠/展开阈值与宽度约束 |
| E04 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `const nd=uC,CC=210,C1=CC+10` | 641884 | 拖动阈值 |
| E05 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `setSidebarLayout:k=>` | 625114 | 侧边栏保存宽度约束 |
| E06 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `isThreadSideBySideOptIn:!1,threadSideBySideWidth:null` | 618067 | 线程默认偏好 |
| E07 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `rDe=2*dre` | 1850299 | 线程并排阈值；dre 为 A 导出的 zs→sl |
| E08 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `En=wn&&Bn&&Gn!=null&&Gn>=rDe` | 1941241 | 线程并排 gate 与测量宽度 |
| E09 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `function GW(t)` | 1850309 | 测量内容区宽度的 ResizeObserver |
| E10 | [assets/index-DLJ0gwBH.css](../reference/renderer/assets/index-DLJ0gwBH.css) | `width:min(max(var(--sand-chat-min-width, 424px),var(--sand-task-thread-width, 50%))` | 641086 | 线程宽度 CSS 公式 |
| E11 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `function yF()` | 1458852 | 线程拖宽与持久化 |
| E12 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function gC(e)` | 618285 | 保存线程宽度要求有限正数 |
| E13 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `Ry=[{id:"general"` | 1617682 | 设置四导航 |
| E14 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `s.id!=="usage"||e` | 1618105 | 用量导航条件显示 |
| E15 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `sand-agents-sidebar__search` | 413061 | 侧边栏搜索按钮 |
| E16 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `sand-agents-sidebar__account-name-input` | 385381 | 账户名编辑 |
| E17 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `sand-sidebar-resize-handle` | 515170 | 侧边栏拖宽控件 |
| E18 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `uF=6` | 1426881 | 主输入框附件上限 |
| E19 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `function pF(t)` | 1427821 | composer 状态与输入依赖 |
| E20 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `q("mic","dictate")` | 1403304 | 动作按钮三种图标 |
| E21 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `const G=a&&!l` | 1403115 | 有 payload 却不可发送时禁用 |
| E22 | [assets/chunk-prompt-editor-DXTe_qPf.js](../reference/renderer/assets/chunk-prompt-editor-DXTe_qPf.js) | `k.key==="Enter"&&!k.shiftKey&&!k.isComposing` | 85336 | Enter / IME 发送逻辑 |
| E23 | [assets/chunk-prompt-editor-DXTe_qPf.js](../reference/renderer/assets/chunk-prompt-editor-DXTe_qPf.js) | `cancelReply()||P.dom.blur()` | 85740 | Escape 取消回复或退出焦点 |
| E24 | [assets/chunk-prompt-editor-DXTe_qPf.js](../reference/renderer/assets/chunk-prompt-editor-DXTe_qPf.js) | `const K=Zr(k.clipboardData)` | 85861 | 粘贴附件 |
| E25 | [assets/chunk-prompt-editor-DXTe_qPf.js](../reference/renderer/assets/chunk-prompt-editor-DXTe_qPf.js) | `"aria-multiline":"true",role:"textbox"` | 84530 | 输入框语义 |
| E26 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `sNe={id:"Gl26Yv"}` | 1323673 | 消息等待/重连发送文案 |
| E27 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `goVP0n` | 1374734 | 显示保存的消息 |
| E28 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `QfCTDv` | 1461634 | 只读聊天说明 |
| E29 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `["queued","prepared","dispatching","accepted-awaiting-echo"]` | 210984 | 消息发送内部状态列表 |
| E30 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `resendFailed` | 399610 | 失败重发操作 |
| E31 | [assets/chunk-view-DgsHr_Kf.js](../reference/renderer/assets/chunk-view-DgsHr_Kf.js) | `function ms(s,e)` | 7676 | 审批卡 pending / approved / always / denied / expired |
| E32 | [assets/chunk-view-DgsHr_Kf.js](../reference/renderer/assets/chunk-view-DgsHr_Kf.js) | `async function gs(s)` | 10236 | 审批提交及 stale 处理 |
| E33 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `/src/electron-renderer/features/chat/cards/send-message/user-form/card.ts` | 1740691 | 消息卡片注册表 |
| E34 | [assets/chunk-view-BRMGAw-B.js](../reference/renderer/assets/chunk-view-BRMGAw-B.js) | `function Vs()` | 47013 | 外观设置与 pending / failure |
| E35 | [assets/chunk-view-BRMGAw-B.js](../reference/renderer/assets/chunk-view-BRMGAw-B.js) | `wm7RV4` | 50566 | 通知声音 |
| E36 | [assets/chunk-view-BRMGAw-B.js](../reference/renderer/assets/chunk-view-BRMGAw-B.js) | `RNnopd` | 45265 | 语言搜索 |
| E37 | [assets/chunk-view-BRMGAw-B.js](../reference/renderer/assets/chunk-view-BRMGAw-B.js) | `function lt()` | 63000 | 线程并排设置 gate |
| E38 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `Nn.language.snapshots.subscribe` | 1998815 | 语言变更 reload |
| E39 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `"zh-CN":()=>bt(` | 181554 | 中文模块映射 |
| E40 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `id:"sand.commandPalette"` | 1757786 | 命令菜单快捷键 |
| E41 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `id:`sand.focusAgent${Te}`` | 1830956 | Bot 序号快捷键 |
| E42 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `id:"sand.send"` | 1845984 | 工作区快捷键组 |
| E43 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function jfe(e,t)` | 1142123 | mod 在 Mac / 其他平台映射 |
| E44 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `const TK=9` | 685556 | Bot 序号快捷键最大 9 |
| E45 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `id:"sand.toggleAgentSettings"` | 1819427 | Bot 设置快捷键 |
| E46 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `id:"sand.previousAgent"` | 1830055 | 导航快捷键组 |
| E47 | [assets/desktop-mount-panel-uPJnWXVn.js](../reference/renderer/assets/desktop-mount-panel-uPJnWXVn.js) | `function I(t,e)` | 1214 | 浮动板展开与 inert |
| E48 | [assets/desktop-mount-panel-uPJnWXVn.js](../reference/renderer/assets/desktop-mount-panel-uPJnWXVn.js) | `function q(t,e)` | 5979 | 浮动板发送与禁用恢复 |
| E49 | [assets/desktop-mount-panel-uPJnWXVn.js](../reference/renderer/assets/desktop-mount-panel-uPJnWXVn.js) | `function N(t,e,r)` | 2838 | 浮动板右键 Bot 选择菜单 |
| E50 | [assets/desktop-mount-panel-uPJnWXVn.js](../reference/renderer/assets/desktop-mount-panel-uPJnWXVn.js) | `const O=4` | 4383 | 浮动板拖动阈值 |
| E51 | [assets/desktop-mount-panel-uPJnWXVn.js](../reference/renderer/assets/desktop-mount-panel-uPJnWXVn.js) | `const A=44,S=52` | 1477 | 浮动板输入高度 |
| E52 | [assets/desktop-mount-panel-uPJnWXVn.js](../reference/renderer/assets/desktop-mount-panel-uPJnWXVn.js) | `function X(t,e)` | 2166 | 浮动板可用状态与当前 Bot |
| E53 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function FHe()` | 1669172 | 真实应用 desktop preload 必需 |
| E54 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function DHe()` | 1624933 | 真实应用 coordinatorPort preload 必需 |
| E55 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `slice:"ui-layout",schemaVersion:3` | 617461 | 布局与账户数据的保存范围 |
| E56 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function GH({isGroup:e,membersOnly:t=!1})` | 627406 | 详情面板标签按群组切换 |
| E57 | [assets/index-DLJ0gwBH.css](../reference/renderer/assets/index-DLJ0gwBH.css) | `--sand-sidebar-anim-duration:.2s` | 435349 | 侧边栏切换动画 |
| E58 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function KH(e)` | 629669 | 通用 pointer resize 结束与清理 |
| E59 | [assets/index.eager-app-aiFqpW8R.js](../reference/renderer/assets/index.eager-app-aiFqpW8R.js) | `function xq(e)` | 722213 | Ctrl+Tab 光标与释放确认 |
| E60 | [assets/index-ByKx0M82.js](../reference/renderer/assets/index-ByKx0M82.js) | `isMacPlatform:M}=t` | 1840329 | 详情快捷键条件为 Mac |
