# 使用与维护本复刻资料

用户目标是将 Grok Bot 0.68.1 的 UI / UX 移植到其他项目。先读 README、docs/integration.md、docs/ui-ux-spec.md、docs/component-spec.md，再按 docs/replication-checklist.md 实现与验收。

- `reference/` 和 `assets/` 的原材料保持字节不变；不要格式化、改写或给它们补造许可证。新组件写在自己的项目中。
- 事实引用使用仓库相对路径、原选择器或零基字符偏移。字符不是字节。不要把推荐值或缺少运行观察的分支标成原版已验证。
- 浅深色使用 tokens/design-tokens.json 的最终映射，不直接套用原 CSS 开头的深色默认表。样式应按语义变量切换。
- 原图标来自 cursor-icons 字体；名称映射用 assets/icon-map.json。不要凭外观重新命名码点。
- 侧边栏展开宽与自动紧凑状态分开保存；线程并排判断主内容实际宽度，不仅 viewport。
- 输入要防 IME Enter、Shift+Enter、菜单打开时误发送；附件-only 允许发送；异步失败保留草稿；任务线程上下文不得误送主聊天。
- `src/` 和工作台是简化参考适配器，不是全部原组件。实现缺口按 docs/capture-plan.md 补证据；不要用示例文案、模拟语音或示例截图冒充原运行结果。
- 修改生成器/token 后执行 npm run build；提交前执行 npm run check。原文件哈希变动需要核实来源，不能仅更新哈希使检查通过。
- 用户没有请求时不要加入真实登录、付款、自动更新、电脑控制或目标程序执行。

- 根入口是按官网内嵌产品演示修正的界面；先读docs/website-comparison.md。不要再把workbench状态测试页当作官网界面复刻结果。官网CSS/头像/主题独立标来源，不能覆盖DMG原始证据。
