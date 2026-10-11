# 来源、分析过程与证据边界

本仓库来源为用户提供的 `Grok_Bot_0.68.1.dmg`：大小 **145,937,657 bytes**，SHA-256：

```text
7c568ac449780ff9ea8da26b65d108391b91390652eb382a68be51c6b2f65fdd
```

打包 metadata 中 productName 为 Grok Bot、version 为0.68.1、package 名称为 sand。Electron renderer 使用 React 与预编译 StyleX/原子 CSS；内部还包含 @anysphere 命名依赖。不能仅凭这些名称确定开发者身份、许可或远程服务状态。

## 分析步骤

1. 阅读 [REA 项目](https://github.com/morluto/rea) 的工作流，使用 npm 分发 `rea-agents@6.4.0`。
2. 对 DMG 静态 inspect。严格完整性检查未通过；以 `record-and-continue` 保存实际差异继续分析。该模式允许读取，不等同于信任校验通过。
3. 只读挂载 DMG，对 app 内 `Contents/Resources/app.asar` 提取；提取651文件并逐文件校验后复制到工作目录；完成后卸载镜像。
4. 限定 renderer 做 REA静态分析：519个JS、2个HTML，JS解析失败为0。图关系因内存/结果预算为 partial，记录979项 limitations；不是完整语义恢复。
5. 定向阅读 CSS与编译JS，恢复主题136变量、808图标名称和UI布局/状态路径。初始静态分析阶段没有执行原应用代码，原App没有启动或登录。后续为动态头像提取并在独立参考环境运行了已审核的头像数学/渲染子集，见 [动画接入](avatar-animation.md)。
6. 参考仓库保留 renderer和UI preload；另有独立的`reference/website/`官网观察，见 [画面对照](website-comparison.md)；原DMG、ASAR、完整主进程与可执行应用没有提交。参考文件全量哈希见 [reference/manifest.json](../reference/manifest.json)。

## 完整性差异

DMG记录中包含6项ASAR/native companion integrity差异。差异原因没有独立确认；它们可能影响对分发包整体完整性的结论，不能改写为“原包可信验证通过”。renderer内逐文件复制校验与token源码锚点检查，只证明分析材料复制一致，不消除这6项差异。

## 证据文件

[Evidence 清单](../evidence/manifest.json) 保存每个记录的Evidence ID、解压后SHA-256与大小；`.json.gz`解压后保持原记录字节不变。历史机器路径留在原证据中用于溯源，不是本仓库运行前提。

| 记录 | 内容 | Evidence ID |
|---|---|---|
| [DMG record](../evidence/dmg-evidence-recorded.json.gz) | 安装包、资产与完整性观察 | `ev_9a3b22242ebfb9ba7e48995f780064f33e247990575aaf4129b80a01694ba513` |
| [ASAR extraction](../evidence/asar-extraction-evidence.json.gz) | 提取清单与复制溯源 | `ev_f9952ae3efe374fd6046e96a976a4d5efe206d909fd9a712630fff6caf9001cc` |
| [renderer analysis](../evidence/renderer-rea-evidence.json.gz) | 静态实体/关系、来源与limitations | `ev_37ea2ba040342adc818604b2c0f30221fe136dac5a0409ff512c3e0bbfda1eb3` |

```sh
# 仓库根目录；只解压/读取，不执行目标代码。
python3 -c "import gzip,json; d=json.load(gzip.open('evidence/renderer-rea-evidence.json.gz')); print(d['evidence_id'])"
```

## 如何引用结论

`tokens/design-tokens.json`保存值、原表达式和零基字符偏移；`assets/icon-map.json`保存字形和映射来源；UI规格使用源码链接、压缩函数/选择器锚点与字符偏移。字符偏移不是UTF-8字节偏移；应读取原文本后定位。

文档中的“代码事实”表示材料直接支持；“推导”是计算结果；“实现建议”是独立实现选择；“未知”需要运行观察。参考页截图是本仓库代码的截图，不是原应用。账号权限、feature gates、真实动态数据、系统缩放、每个动画与错误分支尚未运行验证。

## 后续增补

改变原材料需记录新版本、SHA-256与新证据，不覆盖0.68.1的历史依据。修改推荐实现可以更新示例，但不要变更原参考文件。补原应用观察时按 [capture-plan](capture-plan.md) 保存版本/窗口/主题/状态，并让新结论指向具体证据。

官网补证据来自2026-10-11公开网页DOM/CSS与真实截图。官网演示版本未知；原App仍未启动。官网CSS/头像的清单独立于0.68.1原文件清单，不能改写原包事实。
