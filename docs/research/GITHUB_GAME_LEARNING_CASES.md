# GitHub 学习游戏与页游体验研究

版本：v1.0 · 2026-09-11  
用途：为《GitHub 新手村》0–12 章玩法、地图推进和真实 GitHub 迁移提供研究依据。  
研究边界：只借鉴公开项目的交互原则，不复制代码、素材、角色、音效或受版权保护的 UI。

## 1. 研究结论摘要

本项目应采用“短目标 + 可操作状态 + 即时可解释反馈 + 可恢复试错 + 结算奖励 + 真实 GitHub 迁移”的循环。GitHub 官方把 Skills 组织成可操作的小课程，并提供自动反馈；这证明“做一次真实动作，再解释概念”比先背术语更适合新手。[GitHub 学习资源](https://docs.github.com/en/get-started/start-your-journey/git-and-github-learning-resources)

可视化 Git 学习项目的共同有效点是：玩家能看到状态变化，错误不会清空进度，并且每个关卡都有明确完成条件。它们可以转译为武侠页游的地图机关、卷轴、驿站和炉火，但不应把 GitHub 页面伪装成游戏界面或声称替用户完成真实操作。

## 2. 案例研究表

| 案例 | 已核验入口 | 观察到的机制 | 对本项目的借鉴原则 | 使用边界 |
| --- | --- | --- | --- | --- |
| GitHub 官方学习资源 | [GitHub Docs](https://docs.github.com/en/get-started/start-your-journey/git-and-github-learning-resources) | GitHub Skills 短课、真实仓库练习、自动反馈；Learn Git Branching 作为交互式补充 | 每章先给一个可完成目标；完成动作后立刻反馈并解释术语 | 官方内容可引用并链接，仍需按页面日期复核 UI 文案 |
| GitHub Hello World | [官方教程](https://docs.github.com/en/get-started/using-github/hello-world) | 以仓库、分支、提交、Pull Request 串成第一条贡献路径 | 第 10–12 章必须模拟同一条链；结算后迁移到自己的 Fork | 不模拟登录，不替用户创建真实 PR |
| Learn Git Branching | [GitHub 仓库](https://github.com/pcottle/learnGitBranching)、[在线演示](https://learngitbranching.js.org/) | 关卡、提交树可视化、命令即时结果、撤销/重置、自由沙盒 | 第 8–10 章让本地/远程/分支/提交状态可见，并提供撤销和重试 | 研究机制；不复制其代码、图形或关卡文本 |
| Git Gud | [GitHub 仓库](https://github.com/benthayer/git-gud) | 用实际 Git 命令逐关完成任务，关卡易扩展 | 目标驱动、操作后再讲知识；每章可独立添加新挑战 | 需在实现时重新核对仓库许可证与维护状态 |
| Oh My Git! | [GitHub 仓库](https://github.com/git-learning-game/oh-my-git) | Godot 开源 Git 学习游戏；独立关卡和可视化操作；提供桌面发行包 | 把 Git 状态变成场景中的可观察物件；每关完成后有明确结算 | 仅借鉴玩法；不复用 Godot 项目资源或视觉资产 |
| Git-Mastery | [GitHub 仓库](https://github.com/MikaStiebitz/Git-Mastery) | 学习路径、提交图、状态面板、练习场、进度记录 | 宝典和章节结算要同时展示“已学、已做、待复习” | 仓库许可限制较多，只做机制研究，不复制代码或 UI |
| Dev Quest Runner | [项目页面](https://pages.opencodingsociety.com/tools/gamified) | NPC、空间探索、任务引导 Make、调试、文件结构 | 每章 NPC 给动机和线索，玩家仍需亲自操作关键机关 | 作为教学结构参考，不把第三方角色或文本带入产品 |
| Dungeon Campus | [GitHub 仓库](https://github.com/Dungeon-CampusMinden/Dungeon) | 2D Rogue-like 场景承载课程任务、代码挑战和自动分析 | 场景行为就是学习行为；完成任务应改变地图和剧情 | 需自行核对许可证；不复制项目素材 |
| learn-by-playing 聚合 | [awesome-learn-by-playing](https://github.com/lmammino/awesome-learn-by-playing) | 聚合大量“边玩边学”项目，便于发现新案例 | 作为后续扩展检索入口，持续更新案例库 | 聚合列表不是定义来源，也不替代逐项阅读 |

## 3. 0–12 章应用映射

| 研究原则 | 应用章节 | 具体实现要求 |
| --- | --- | --- |
| 目标可见 | 0–12 全部 | 首屏显示中文目标、当前步骤和完成条件；不让玩家猜下一步 |
| 状态可见 | 0–3、8–12 | 用路牌亮灯、机器产物、火槽连线、货运包裹、分支竹径、检查炉状态表现因果 |
| 可恢复试错 | 0–12 全部 | 每个小游戏提供撤销/重置当前步骤；错误反馈保留已完成进度 |
| NPC 动机 | 0–7、11–12 | NPC 解释“为什么做”，不替玩家点按钮；对话可收起，操作区不被遮挡 |
| 视觉化抽象 | 2、8、9、10、12 | Fork/Clone/ZIP、origin/upstream、Branch、Diff、Checks 以卷轴、马车、竹径、墨迹和炉火表现 |
| 真实迁移 | 0、10–12 | 反复标注“本地教学模拟”；毕业任务只引导玩家在自己的 Fork 操作，不伪造验证 |

## 4. 造梦西游 1/2 页游研究结论

公开网络资料主要是玩家截图、攻略和第三方介绍，未找到可直接授权复制的官方 UI 规范或素材包。第三方资料可以辅助确认“地图选关、主题场景、逐关推进、通关奖励”等页游结构，例如[第三方主界面介绍](https://m.4399.cn/news-id-714097.html)和[关卡/奖励说明](https://www.downxia.com/downinfo/347690.html)，但不能作为原作素材或代码的授权证明。

因此，本项目只提炼以下页游规律，并使用原创武侠视觉重新表达：

1. 固定游戏画布是主角：局部地图占主要面积，菜单、任务和对话围绕画布服务。
2. 地图是进度容器：章节沿一条清晰路线从左到右解锁，迷雾、主角移动和奖励动画在完成后连续发生。
3. 每个地点是一关：地点继承大地图的空间线索，但有自己的 NPC、机关、对话和小游戏。
4. HUD 要轻：角色/章节、当前目标、对话和操作台分层，不堆叠成仪表盘。
5. 动作必须有结果：点击、拖拽、配对、排序、修复都改变物件、角色或场景状态。
6. 角色必须统一：同一透明 sprite、脚底锚点、动作命名和光照方向贯穿地图、场景、对话和结算。

## 5. 研究转开发验收

- 每个章节 PRD 需填写“借鉴案例、借鉴原则、原创转译、未复制资产”四项。
- 每个小游戏至少有一次可观察的因果变化和一次可恢复错误。
- 章节完成后必须发生地图揭雾、主角移动和奖励反馈；三者缺一不可。
- 章节局部地图必须声明 `parentMapRegionId`，并能在大地图上指出其来源区域。
- 新增案例必须记录核验日期、URL、许可证或“仅机制研究”说明。
- 没有真实新手测试记录前，只能写“待验证”，不能写“已适合小白”。


## 6. 本轮实现核验与应用（2026-09-11）

本轮重新读取了上述 GitHub 官方学习资源、Hello World，以及 Learn Git Branching、Git Gud、Oh My Git!、Git-Mastery、Dungeon Campus 的公开项目入口；Dev Quest Runner 直接读取首次失败，随后从该官方项目站点的索引内容核对到顺序任务、NPC、移动和调试学习描述。未运行或复制这些项目的代码、图片或资产。Oh My Git! 当前 README 明确为低维护状态，不据此宣称持续活跃。

| 来源机制 | 本轮原创转译 | 验证位置 |
| --- | --- | --- |
| Hello World 的分支—提交—PR 路线 | 第 9–12 章竹径、卷轴快照、评审席和检查炉；毕业入口仅指向自己的 Fork | `chapterLessons` / `journey.spec.ts` |
| Learn Git Branching 的可见状态和 undo/reset | 第 8 章 u0/u1 货运状态、第 10 章工作区/Stage/Commit/origin；动作日志回放、撤销和重试 | `chapter-games.ts` / `mechanism-trace.tsx` |
| Git Gud 的明确任务与逐步练习 | 每章显示当前机关目标，只在前置操作齐备时推进 | `chapter-workbench.tsx` |
| Oh My Git! 的视觉化仓库操作 | 三台拓印机分别产出账号副本、本地历史、文件快照 | 第 2 章 |
| Git-Mastery 的挑战与反馈面板 | 当前目标、已完成动作证据和宝典待复习分开记录 | 13 章结算 / `Handbook` |
| Dev Quest Runner 的 NPC/移动/调试任务 | 青砚提供动机，主角移动，工坊拔线—读日志—修复；NPC 不代操作 | 第 0、3、11 章 |
| Dungeon Campus 的场景承载学习 | 13 个 parentMapRegionId 对应镜头和机关，章节完成驱动地图道路、印章、迷雾 | `chapter-scenes.ts` / `jianghu-map.tsx` |

以上是机制应用与代码验证，不是教学效果的实验结论。真实新手 3 人测试仍未执行，观察表见 `docs/testing/BEGINNER_USABILITY_TEST.md`。

UI 复核另见 `docs/curriculum/JOURNEY_UI_REVIEW_2026-09-11.md`。本轮发现并修正了重跑工作流的一个教学风险：GitHub 的重跑沿用原 SHA/REF，所以先 Commit / Push 修复并触发新运行，再示范取消和重跑；不能暗示重跑旧运行会自动带入新提交。[GitHub 重跑说明](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)
