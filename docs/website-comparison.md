# 官网画面对照与主预览使用

用户指定 [Grok Bot 官网](https://x.ai/bot) 作为画面对照后，本仓库于2026-10-11读取了官网产品演示的DOM、CSS与组件尺寸，并保存截图。此前的工作台只是状态与组件参考，列表/输入区布局不够接近官网；现在根入口改为按官网演示实现的产品预览。

这里复刻的是官网内嵌的**产品聊天演示**，不是官网的营销整页。官网演示本身不是安装包的运行截图；它没有证明对应0.68.1，不能覆盖DMG中已验证的值。

## 原画面与实现的对照

[官网观察截图](screenshots/official-website-product.jpg) 是公开网页真实截图；[本仓库主预览](../index.html) 使用观察到的组件CSS和头像路径，加上本仓库编写的本地交互。图像对应版本/日期与来源在 [observation.json](../reference/website/observation.json)。

| 项目 | 官网观察 | 新主预览 |
|---|---|---|
| 演示窗 | 976×660、外角24 | 宽上限976、高660、外角24；小窗口自适应 |
| 侧边栏 | 280宽、上栏44高 | 同尺寸；可拖动240–400，自动紧凑88参考DMG |
| 聊天行 | 53高、padding8、gap8、两行文案 | 同密度；名称+时间+截断预览 |
| 搜索框 | 254×32、圆角10 | 默认280栏下同尺寸 |
| 头像 | 32px、多颜色、多形状；群组三头像18px | 原公开SVG路径，保留三层群组形态 |
| 主标题栏 | 44高、18px头像、13/18文字、电脑图标 | 同布局；电脑与详情为本地入口 |
| 消息 | 14/20文字、padding8/12、16圆角；用户靠右 | 同；示例文案和账户为本仓库编写 |
| 输入 | 胶囊、45高、padding8、28动作按钮 | 同；本地可编辑，换行最大120高 |
| 标题/正文 | 系统字体 | 系统字体；没有把XVF当默认 |

可运行的页面恢复外观与部分本地行为，不包括官网自动演示脚本、完整远程电脑、真实Bot动作或全部App页面。时间/聊天文案换成示例数据，窗口外的资料导航不是原应用界面。

## 两种视觉来源

Appearance → General → Visual source 可切换：

- **Official website demo**：使用 [observed.css](../reference/website/observed.css) 的公开演示变量。浅色主文字#0a0a0a、背景#fcfcfc；深色editor#1c1c1c。样式保留官网来源。
- **DMG 0.68.1 tokens**：使用本仓库已恢复的Sand变量映射覆盖颜色，保留官网结构。原包浅/深背景#fcfcfc/#070707；这是“原包颜色+官网结构”的组合参考，不是原App截图。

两者差异不能简单归因于版本更新，因为官网演示版本未知。精确原App布局与设置行为仍以安装包规格加运行观察验证。

## 新主预览的操作

点击Bot切换会保存各Bot的本地草稿与附件。搜索筛选列表；右上侧边栏plus打开本地新建Bot；底部账户或窗口外Appearance打开设置；电脑按钮打开明确标为preview的电脑面板。

Enter发送、Shift+Enter换行；IME组成中不发送。空输入按钮模拟语音，停止后模拟转写，不请求麦克风。最多6附件，只读取名称，不上传。设置可切下一条消息sent/queued/failed、只读；失败保留输入，queued可取消、failed可重试。以上消息均本地模拟，不调用远程服务。

`examples/workbench.html`继续用于主聊天/任务分区和状态测试；它不作为官网像素基准。设计变量展示改到 [examples/design-tokens.html](../examples/design-tokens.html)。

## 向目标项目复制

官网结构可复制 `examples/product.css`、`examples/product.js` 和 `examples/product.html`。样式依赖`reference/website/observed.css`、`tokens/themes.css`、原图标字体；脚本依赖`src/`、图标映射、`assets/website/manifest.json`。保持相对目录，或按目标构建器更新路径。不要只复制HTML而遗漏CSS依赖。

[assets/website](../assets/website/)额外提供7个可独立显示的头像SVG，来源与哈希另列清单；它们不混入53份DMG静态素材的统计。生成器为公开SVG加了独立渲染的颜色变量/样式，并组合群组头像；原观察路径保留在observation中。未重新绘制品牌图形。

复刻目标项目建议把DOM拆成Sidebar/ChatHeader/Transcript/Composer/ComputerPreview/Settings组件，数据适配器另实现。`product.js`是参考实现，不能直接当完整生产客户端。
