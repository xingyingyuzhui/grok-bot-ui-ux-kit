# 原生图标使用说明

本套图标来自 Grok Bot 0.68.1 的 `cursor-icons` 字体和打包代码。已恢复 **808 个名称、808 个 outline 字形、392 个独立 filled 字形**。其余 filled 名称按照原应用的解析器回退到 outline。所有映射在 [`assets/icon-map.json`](../assets/icon-map.json)；不要凭外观给私用区码点重新命名。

## 字体和渲染方式

原 CSS 的声明为：

```css
@font-face {
  font-family: cursor-icons;
  font-display: block;
  src: url('./cursor-icons-16-gwXtdAvu.woff2') format('woff2');
}
```

原组件是 `<i class="ui-icon cursor-icon" data-icon-name="…">`，通过 `::before` 读取 `--cursor-icon-content`。变量值必须是 **带引号的 CSS 字符串**，只放一个未经引号包裹的字符不会产生正确的 `content`。下面是可移植写法；字体 URL 指向你项目中实际复制的位置：

```css
@font-face {
  font-family: 'cursor-icons';
  src: url('/assets/fonts/cursor-icons-16-gwXtdAvu.woff2') format('woff2');
  font-display: block;
}
.cursor-icon {
  --icon-size: .75rem;
  --icon-weight: 400;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  font-family: 'cursor-icons';
  font-size: var(--icon-size);
  font-style: normal;
  font-weight: var(--icon-weight);
  line-height: 1;
  color: inherit;
  vertical-align: middle;
  text-align: center;
  text-decoration: none;
  text-transform: none;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  user-select: none;
}
.cursor-icon::before {
  content: var(--cursor-icon-content);
  box-sizing: inherit;
}
```

原组件还会给首尾图标应用 `margin-inline-start` / `margin-inline-end: var(--cursor-spacing-ne-0-5)`。这是按钮的视觉对齐规则，不宜一律应用到独立图标。

## 按名称调用

```js
// map 是 assets/icon-map.json 的 JSON 内容。
function setIcon(element, map, name, variant = 'outline') {
  const entry = map.icons[name];
  if (!entry) throw new Error(`Unknown cursor icon: ${name}`);
  const selected = variant === 'filled' ? entry.filled : entry.outline;
  element.dataset.iconName = name;
  element.style.setProperty('--cursor-icon-content', JSON.stringify(selected.glyph));
}
```

```html
<button type="button" aria-label="发送消息">
  <i class="cursor-icon" aria-hidden="true"
     style="--icon-size: 1rem; --cursor-icon-content: '\eaa1'"></i>
</button>
```

有可见文字的按钮和纯装饰图标使用 `aria-hidden="true"`。只有图标的按钮在按钮上放 `aria-label`；不要让读屏读取私用区字形。原 `Ke` 组件默认隐藏没有 `aria-label` 的图标，有标签时允许图标参与无障碍树。

原尺寸预设使用 rem，跟随项目的根字号；下面的 px 值仅以根字号 16 px 为例：

| size | 原值 | 16 px 根字号 |
|---|---:|---:|
| xs | .625rem | 10 px |
| sm | .75rem | 12 px |
| base | .875rem | 14 px |
| lg | 1rem | 16 px |
| xl | 1.25rem | 20 px |
| 2xl | 1.5rem | 24 px |

颜色来自容器的 `color` 或 `--cursor-icon-primary` / secondary / tertiary / quaternary 等语义 token；按界面角色选择。不要给整套图标固定黑色或白色。

## 核心图标

| name | outline | filled |
|---|---|---|
| arrow-up | U+EAA1 | U+F374 |
| mic | U+EC12 | U+F3D7 |
| search | U+EA6D | U+F3D5 |
| settings | U+EB52 | U+F3F0 |
| plus | U+EA60 | U+F3E5 |
| chevron-down | U+EAB4 | U+F387 |
| chevron-left | U+EAB5 | U+F389 |
| chevron-right | U+EAB6 | U+F38B |
| chevron-up | U+EAB7 | U+F38D |

outline / filled 是字体中的实际字形选择，不是描边宽度变化。`filled.explicitFilledOverride: false` 表示原应用没有这个名称的独立 filled 字形，已按其原算法回退。需要别的名称时查 JSON，避免使用其他图标库同名图标替换后造成视觉差异。

## 来源与静态恢复方法

映射解析链：

1. `dist/renderer/assets/index-ByKx0M82.js` 的 `Ke` 组件调用 `Ece(t,s)`。
2. 主 bundle 从 `index.eager-platform-AatQIEPx.js` 导入 `bF as Ece`。
3. platform bundle 以 `DI as bF` 导出解析器；`DI(e,t="outline")` 在 outline 字典与 filled 合并字典间选择。
4. `m2` 是前缀压缩的名称列表：每个空格分隔 token 的首字符表示上一名称保留的前缀长度（base36），剩余部分为后缀。
5. `g2` 为 outline 字符码点的累计有符号 base36 差值。
6. `y2` 每两个 base36 字符表示一个 filled 名称在 outline 名称数组中的索引；`k2` 为对应 filled 码点的累计差值。filled 字典覆盖 outline 字典，其余键保留 outline 字形。

本次使用 Python 只读取四个字符串字面量，再独立复制这些确定的解码规则，没有 eval、import 或执行应用 bundle。静态检查保证名称唯一、outline 数量与名称数量一致、filled 索引数量与字形数量一致。

`icon-map.json.source.sha256` 对应上述 platform bundle 原文件的 SHA-256。每条记录保留名称 token、glyph 差值 token、filled 索引 token 在原 bundle 中的字符 offset。offset 为 **从 0 开始、UTF-8 解码后 Unicode 字符位置**，不是字节位置，也不是经过格式化的文件行号。字形由累计差值生成，所以单个差值 token 不是可独立解释的码点。

CSS 的静态证据位于 `dist/renderer/assets/index-DLJ0gwBH.css`：字符 offset 404677 的 `.ui-1yj7g93:before` 使用 `content:var(--cursor-icon-content)`；offset 411332的 `@font-face` 声明上述字体。组件 `Jn.base` 与对应原 CSS 可用于核对可移植样式。

## 覆盖与限制

映射已完整恢复该 resolver 的名称集合，但它不是应用全部图标的目录。品牌 Logo 中存在独立 SVG 组件，文件类型图标还使用 `seti` 字体；这些不属于 `cursor-icons`，需要分别使用原素材。`cursor-icons` 是字体素材，字形没有自动转换为 SVG。

该映射以 0.68.1 的原字体为准，换用别的版本字体可能改变码点对应的视觉形状。映射完整性已做静态校验；本轮未运行原应用，也未验证全部字形的实际屏幕表现、字体 cmap 或每个图标在各页面里的使用位置。原组件包含 RTL、spin 同步和 capTrim 分支，移植这些行为时应以组件规范和页面上下文为准。
