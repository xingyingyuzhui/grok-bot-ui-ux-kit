# 素材使用说明

所有可复制素材按类型放在 [assets](../assets/)，原始同字节文件保留于 [reference/renderer/assets](../reference/renderer/assets/)。[manifest.json](../assets/manifest.json) 的每条记录含 `path`、`source`、`sha256`、`bytes`、`category`；不要用显示名称猜文件。

运行本地服务后打开 [素材画廊](../examples/asset-gallery.html)，按名称查找图标、查看图片、切主题和试听音频。浏览器禁止自动播放时手动点播放。画廊预览属于资料展示，不表示原应用已经使用每份素材。

| 分类 | 数量 | 使用 |
|---|---:|---|
| fonts | 22 | XVF、XVF Mono、cursor-icons、19 个 KaTeX 字体 |
| images | 22 | App 图标、连接服务品牌图、CTA 图片等 |
| audio | 5 | 原提示音资源；各音频的触发场景仍需追踪/观察 |
| styles | 4 | 原主 CSS、KaTeX/渲染与浮动板相关样式参考 |

## 字体

UI 默认用系统字体；XVF 是条件分支，勿因为包内有字体就宣称原应用默认使用。原图标必须使用 cursor-icons，见 [图标说明](icons.md)。KaTeX 字体只用于对应数学渲染，不能拿它们替换 UI 字体。`src/styles.css` 已为基础参考声明 XVF/XVF Mono/cursor-icons，公式还需目标项目接入数学渲染器与原 KaTeX CSS 路径。

静态站点复制字体后，CSS 的相对 url 应保持可访问。字体被构建器改名时更新 URL。图标字形是私用区码点，若字体未载入会显示方框；这不意味着名称映射错误。

## 图片

`app-icon-C7NKj2u7.png` 是256×256；多数服务品牌 PNG 为128×128；部分 SVG 为32×32 viewBox；unify CTA为250×111。按原比例展示，图标保持独立背景，不用拉伸把它们强制变成整套单色图标。

工作台只使用 App 图标，其余在画廊中按原文件名呈现。原页面中的实际位置、授权和可见条件需以组件引用与运行状态进一步确认。

## 音频

5 个 WAV 以原文件名保留，画廊通过 `audio controls preload="none"` 手动试听。未建立完整事件→声音映射，不能把文件名直接当作所有消息/任务的触发规则。目标项目应提供静音偏好并按实际场景接入。

## 样式与原代码

`assets/styles/` 保留完整原 CSS，供追溯具体选择器。建议按文档重写可维护组件，而不是直接全局导入整个原 CSS。原 renderer JS 是打包代码，依赖 Electron 与业务状态；它不是浏览器即开即用的组件库。

`assets/icon-map.json` 是恢复出的名称→字形映射，不是原作者单独发放的 JSON；`tokens/` 是恢复出的主题值。源码位置与校验见各清单和 [provenance](provenance.md)。授权说明见 [NOTICE](../NOTICE.md)。

官网额外头像在 [assets/website](../assets/website/)，共7份；来源与SHA-256独立记录，未混入53份DMG素材统计。使用SVG文件作为img可直接显示；内联使用时可按`--fg`/`--bg`改变色彩。官网与安装包视觉差异见 [website-comparison](website-comparison.md)。
