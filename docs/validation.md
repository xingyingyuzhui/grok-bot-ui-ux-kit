# 本仓库验证记录

以下检查针对本仓库参考代码与资料的完整性；原App仍未运行。官网观察与0.68.1包内证据分开保存。

## 自动检查

`npm run build` 成功生成主题、设计变量页、产品预览、素材画廊、官网头像运行包与两套头像参数表。`npm run check` 验证：

- 575份原renderer/preload参考文件的SHA-256。
- 53份原素材与原参考副本的SHA-256。
- 官网观察文件哈希、7份生成头像SVG哈希和XML有效性。
- 浅/深各136个变量、136个原表达式字符锚点及源文件哈希。
- 808图标名称与关键字形映射。
- 3份Evidence解压哈希与Evidence ID。
- 中文说明链接、HTML资源链接、参考JS语法。
- 原4项Node测试：IME/菜单/ShiftEnter防误发送；附件-only与只读/不可发送；语音处理忙态；系统主题变化、订阅替换与清理。

GitHub Actions执行同样检查，并确认重新生成不会产生未提交变化。

## 浏览器检查

通过Codex浏览器实际操作并观察结果：

| 对象 | 操作 | 结果 |
|---|---|---|
| 主产品页 | 1280×900 viewport，测演示窗 | 976×660；侧栏280；聊天行53；标题44；输入45 |
| 主产品页 | 700×800 viewport | 自动紧凑，侧栏88 |
| 主产品页 | 输入草稿→切Bot→切回 | 原Bot草稿保留 |
| 主产品页 | Appearance切深色与DMG视觉来源 | data-theme=cursor-dark；DMG editor=#070707；可切回官网来源 |
| 主产品页 | 设置下一消息Failed后发送 | 失败显示、输入保留；Retry更新本地记录 |
| 主产品页 | 新建Bot | 新本地条目与独立空聊天出现 |
| 主产品页 | 打开电脑与关闭 | 明确标preview的面板出现并可关闭 |
| 工作台 | ShiftEnter / Enter | 换行保留；发送添加消息 |
| 工作台 | 发送失败 / 只读 | 失败保留草稿；输入与动作按钮禁用 |
| 工作台 | 宽窗任务线程 / 窄窗 | 主区满足848时并排；不足时显示明确标注的Web适配弹窗 |
| 素材画廊 | 搜索arrow-up | 过滤到arrow-up和cloud-arrow-up；字形字体正常 |

主产品页和素材画廊检查中未观察到console error/warning。该结论只限本轮操作，不等同于所有分支、平台和可访问性已全面验收。文件选择/粘贴、多媒体、真实服务错误、桌面宿主快捷键和原App完整流程仍按验收清单补验证。

截图见 [capture-plan](capture-plan.md)。用户明确指出旧工作台与官网画面不一致后，根入口改为官网结构；原工作台不再作为产品外观复刻结果。

## 动态头像补充验证（2026-10-11）

新增3项测试，总计7项全部通过：官网展示参数与状态校验；DMG 53状态的有限SVG几何和相同种子可重复性；官网原组件的受控RAF推进、35状态/25轮廓、眨眼收合、thinking粒子、转身/弹跳/庆祝、25轮廓静态回退、暂停/减少动态效果及销毁清理。

浏览器实际检查六个侧栏头像、标题头像、新建Bot头像均挂载动画；Appearance开关将所有实例切为resting并恢复playing；切Bot保留各自形状，Inbox=wedge、Account=gem；画廊heart轮廓进入暂停不会报错；thinking可见三点形变。深色眼睛跟随背景变量，无需重新加载素材。本轮没有观察到浏览器console error/warning。

在不更改头像状态/形状/暂停的两次idle采样中，六个独立Bot的SVG哈希全部不同，记录在 [avatar-motion-validation.json](avatar-motion-validation.json)。这验证真实连续帧变化，不以静态截图代替动画证明。截图：[头像画廊](screenshots/avatar-motion-light.jpg)、[思考形变](screenshots/avatar-thinking.jpg)、[主产品浅色](screenshots/product-light.jpg)、[主产品深色](screenshots/product-dark.jpg)。截图均为独立参考实现，不是原App窗口。

原群聊组合头像仍使用单帧SVG；真实业务事件与状态映射没有服务验证。原App没有运行或登录。头像原代码的来源、裁剪范围与实现选择见 [动画接入](avatar-animation.md)。
