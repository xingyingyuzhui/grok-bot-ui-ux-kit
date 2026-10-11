# UI / UX 复刻验收清单

适用于根据 [ui-ux-spec.md](ui-ux-spec.md) 在另一个项目实现 Grok Bot 设计参考。清单默认全部未勾选：它定义要验证什么，**不是本仓库已完成的测试结果**。原应用未在此调查中运行，因此不能用本清单证明与原版视觉像素相同。

记录每项完成时附实现文件、fixture/状态、浏览器/平台、viewport与主内容宽，以及截图或短操作证据。代码事实用规格里的 E## 引用，建议项不能改名为原版事实。源码位于 `reference/renderer`，压缩JS以锚点+零基字符偏移定位。

## A. 复刻范围与来源

- [ ] 项目界面明确「设计复原」和「演示数据」；截图说明是否来自复刻还是原版，不能混用。
- [ ] 组件和素材来源可以追到实际源锚点；REA coverage partial和未运行原版限制保留。
- [ ] view model / 事件 adapter 独立于真实 `window.desktop`、`coordinatorPort`，在普通浏览器可运行（规格E53、E54）。
- [ ] 目标项目不沿用真实产品账户信息；本地UI偏好使用本项目自己的命名空间（实现建议）。
- [ ] 没有把全部feature-gated选项画成已经证实的默认设置；有gate/平台状态的演示 fixture。

## B. Shell、导航和侧边栏

- [ ] Shell 具有侧边栏、聊天、输入框、详情/任务线程、设置叠层，各状态独立。
- [ ] 侧边栏搜索、新建、选Bot、pin/unpin、section folds、隐藏/恢复Bot有事件，并与删除动作区分。
- [ ] 默认展开280；拖宽限制240–400；折叠88；显示尺寸基于CSS逻辑像素（E01、E05）。
- [ ] 自动紧凑条件使用windowWidth < expandedWidth+424；不只用一个固定media query（E02）。
- [ ] 手动collapsed偏好与自动紧凑分开：缩窄再变宽能恢复原展开偏好。
- [ ] 测试展开宽280时windowWidth=703/704/705，展开宽400时=823/824/825；记录实际渲染与边界比较（推导）。
- [ ] 拖动在展开状态<210折叠；紧凑状态在220阈值两边测试，且剩余空间不足不强行展开（E03、E04）。
- [ ] pointerup、pointercancel、lostpointercapture、blur、Esc能收尾，清全局cursor/userSelect。
- [ ] 侧边栏切换动画duration .2s或明确记录项目自主调整；reduced motion支持另记为补强。
- [ ] selected、unread、working/offline、键盘focus样式可区分；紧凑态仍有可理解的label/tooltip（实现建议与组件事实结合）。
- [ ] 账户名显示/编辑状态分离；取消与保存失败不会丢已有值。
- [ ] 列表更新时已选Bot稳定，pin reorder后仍能正确根据当时顺序快捷选Bot。

## C. 详情面板与任务线程

- [ ] 详情默认320/min280；单Bot tabs为overview/media/computer，group为overview/media/members，members-only只保留members（E01、E56）。
- [ ] 打开详情时保留主聊天最小空间；窄窗口不产生不可达控件或横向溢出。
- [ ] 任务线程有独立taskId/reply context、close、输入和消息，任务回复不会发到主聊天。
- [ ] 并排默认opt-in=false；设置开关与实际能否并排分开（E06、E37）。
- [ ] 测**主内容区**847/848/849宽，验证并排条件；不能把viewport848当阈值（E07–E09）。
- [ ] 分别在展开/折叠侧边栏及详情开/关时测试同一viewport，确认内容宽决定并排。
- [ ] A=848默认线程424/主424；A=1000默认500/500；preferred650时576/424（E10公式推导）。
- [ ] preferredWidth过小/过大由CSS约束，保存读取过滤NaN/Infinity/0/负数（E12）。
- [ ] 拖动结束保存实际宽度；重新打开/刷新后恢复；RTL delta方向测试（E11）。
- [ ] 分隔器有role separator、aria label/orientation；键盘调宽若实现，标为自主补强而非原版验证。

## D. 输入、附件和发送

- [ ] textbox多行语义与可访问label存在；focus样式清楚（E25）。
- [ ] 非IME的Enter提交；Shift+Enter换行；中文isComposing/日文IME的Enter不误发；长按Enter不重复发（E22）。
- [ ] 菜单开启时Enter/Tab/Esc/上下交给菜单；列表Tab缩进不被全局快捷键抢走。
- [ ] Esc取消回复；无回复则blur；语音时取消并复焦（E23）。
- [ ] 输入状态分开存prompt与richText，初始草稿、编辑、取消回复不会相互覆盖。
- [ ] stage附件上限6，测试第6/7个、多文件同时加入以及已有5个再加入3个；溢出反馈明确（E18）。
- [ ] 粘贴文件进入staged；多行文字保留结构；混合clipboard场景不丢文字或重复添加（E24）。
- [ ] 不冒称原版所有文件限制已知；目标项目的大小/格式限制由自己的adapter返回并明确提示。
- [ ] 无payload可显示语音动作，有payload显示发送箭头；hasPayload且canSend=false时disabled（E20、E21）。
- [ ] sendingPaused/access/rebuild lock/covered阻止不允许的发送，草稿与附件保留（E19）。
- [ ] replyTarget和taskId随submit事件保留；提交事件不能只传字符串。
- [ ] 取消queued与正在发送的不可取消状态区别清楚；失败能resend，不重复入队（E26、E30）。
- [ ] 断线时显示等待/重连后发送，不显示成已完成；connected后恢复fixture可覆盖同ID确认（E29）。

## E. 语音和通话

- [ ] 听写、语音memo、实时语音通话是三个可区分意图，waveform不是一律录音。
- [ ] activating、recording、processing、stop-in-flight、error各有fixture；时长/流/停止/取消/发送与状态一致。
- [ ] recording/processing/stop期间重复点击不会启动第二个任务（实现建议）。
- [ ] permission denied、no microphone、transcription error、playback error的反馈可见，恢复不会清掉现有输入。
- [ ] 无真实麦克风的演示不提示「已经录制到真实声音」；需要真实硬件的目标实现另附实测记录。
- [ ] 语音来源slotKey切换到另一Bot/线程后不会误把返回文字插入错误会话（依据composer slot状态的实现建议）。

## F. Transcript与状态卡

- [ ] 普通文本、富文本、附件、notice、表单、审批卡、工具/widget占位至少各一fixture（E33）。
- [ ] loading/error/savedSnapshot/readOnly独立渲染；saved消息有明确标注；readOnly不可发送（E27、E28）。
- [ ] message delivered/awaiting echo与Bot typing/working/offline是不同维度，不合并成一个status。
- [ ] pending approval显示动作；submitting禁用重复；approved/always/denied/expired显示对应settled状态（E31）。
- [ ] stale response进入expired；提交失败撤回临时本地答案并允许重新呈现；无假成功提示（E32）。
- [ ] always规则保存失败不能声称已永久允许；以目标adapter返回结果决定显示。
- [ ] 发布/连接器/本地权限等卡有自己的状态定义，不未经验证套用auto-review全部状态。
- [ ] 复制/回复/跳转原消息/开线程/更多动作菜单有清楚焦点返回。
- [ ] 新消息滚动与历史加载不会把正在读上文的用户强制拉到底部；未读分界与跳转按钮可用（实现建议）。
- [ ] 刷新/切Bot/状态恢复后稳定entryId，虚拟列表不会把不同消息复用成错误卡（实现建议）。

## G. 快捷键与焦点

- [ ] Mod在Mac映射Command/meta，其他平台映射Ctrl（E43）；浏览器保留键冲突记录清楚。
- [ ] Mod+K命令菜单、Mod+Shift+F搜索Bot、Mod+F聊天查找、Mod+I聚焦输入、Mod+B侧栏。
- [ ] Mod+,设置、Mod+Shift+,Bot设置、Mod+Enter发送，条件不可用时动作不会误执行。
- [ ] Alt+上下选Bot、Mod+[ / ]导航前后、Mod+1…9选当前顺序对应Bot（E41、E44、E46）。
- [ ] Mod+L加入选中内容、Mod+Shift+M工具、Mod+Shift+W技能、Mod+Alt+B详情若纳入范围均有测试。
- [ ] Mod+N对应「新建 Bot」；如目标项目改变新建语义，明确是自主修改而非原版「新线程」。
- [ ] Ctrl+Tab的cycle cursor与释放确认若纳入范围有fixture；浏览器/OS截走按键时不能报全平台成功。
- [ ] 弹层/菜单/输入法/重建lock期间全局快捷键遵循focus scope；Esc只关闭最相关上下文。
- [ ] Tab顺序可以到达侧栏、输入、菜单、设置与返回入口；disabled/inert区不能穿透获焦。

## H. 设置、主题与语言

- [ ] 四导航为通用/电脑/用量与账单/更新；usage有条件可见fixture（E13、E14）。
- [ ] 通用行分value、pending、failure、policy-disabled；失败保留当前值且给重试。
- [ ] 系统/浅色/深色三态；系统色变化与手动覆盖正确；所有弹层、表单、代码和卡片同步。
- [ ] Bot色彩设置受gate；无gate条件不把它当永远可见。
- [ ] 语言选择器可搜索与关闭；zh-CN/zh-TW映射证据可追；placeholder/aria label也翻译（E36、E39）。
- [ ] 原包resolved language变更会reload（E38）；目标项目若用即时切换，明确是自主实现，且已保存草稿不丢。
- [ ] 通知开关与声音picker分开；关闭声音时picker按代码关系禁用；选择预览不被记作业务通知。
- [ ] 线程并排开关保留opt-in并响应内容区resize；拼写设置、自动审核规则若纳入范围有对应状态。
- [ ] 管理员要求/禁用、平台不支持与普通请求失败分别呈现，避免可点但永远失败。

## I. 桌面浮动板

- [ ] mount=null时hidden；composer初始inert；currentBot更新mark/name/placeholder（E52）。
- [ ] 点trigger展开并focus；Esc折叠并焦点返trigger；blur仅在空且非submitting时折叠（E47）。
- [ ] 右键trigger开Bot菜单，menuitemradio/aria-checked正确；选当前Bot不重复switch（E49）。
- [ ] 菜单上下循环/Home/End、Esc/Tab关闭、外点击/失焦关闭都测试。
- [ ] 拖动距离3/4/5px测试；达到4px才move；拖完不触发expand click（E50）。
- [ ] Enter非Shift/non-composing发送；trim空内容不发；disabled期间重复submit不生效（E48）。
- [ ] 成功清文本并折叠；失败保留文本并显示failed；finally恢复按钮和输入、必要时复焦（E48）。
- [ ] textarea高度44–140，大于52展开数据属性；长文内部滚动和发送按钮仍可达（E51）。
- [ ] 纯Web版声明页面内浮动演示，不宣称真实OS顶层窗口/桌面权限已实现。

## J. 验收结果记录模板

| 项目ID / 功能 | 依据（E##或实现建议） | 实现位置 | fixture / 操作 | viewport / 内容宽 / 缩放 | 证据文件 | 结果 / 剩余未知 |
|---|---|---|---|---|---|---|
| 待填 | 待填 | 待填 | 待填 | 待填 | 待填 | 未验证 |

建议至少保存：默认浅/深主聊天、侧栏紧凑、双栏任务848边界、readOnly/error/queued、审批pending/settled、录制/转写、设置pending/语言picker、浮动板菜单/失败。建议最少覆盖Chromium和目标宿主一次实际交互；若只完成Web参考，不把Electron或原版性能列为通过。
