# GitHub 新手村现状审计（2026-09-11）

依据：`docs/product/NEW_TASK_HANDOFF_PRD.md`、`docs/research/GITHUB_GAME_LEARNING_CASES.md`、`AGENTS.md` 与当前工作树。

## 启动流程

`src/components/adventure/adventure-game.tsx` 已有 `village-intro → character-selection → WorldMap` 状态，但正式入口仍存在 `/`、`/start`、`/map` 等旧课程页面；首次启动存档读取完成后依赖 `state.view`，历史存档可能直接恢复旧视图，因此没有统一保证“首次只能引导页”。

## 角色与素材

`CharacterArt` 通过 atlas 偏移裁切，`characterAssets` 仍把三个角色指向一张 `wuxia-cast-transparent-final.png`；动作使用另一张共享 atlas。虽然文件名含 transparent，但当前代码没有 alpha 元数据、四角 alpha、halo 或独立文件的验证清单，无法证明像素级抠图、不串位、无灰边。角色卡以 CSS 裁切高度适配，脚底锚点也未进入统一的 `CharacterPlacement` 契约。

## 江湖地图

`worldNodes` 把第 0–4 章、鉴宝、第 6–12 章、预览地点和区域支线混在一个节点数组；第 5 章依赖客栈而非第 4 章，存在右侧节点提前可进入风险。地图虽有背景图、路径和雾层，但节点本质仍是按钮叠加，迷雾按节点椭圆覆盖，没有分区揭雾序列或奖励落点。主角按当前节点坐标瞬移/过渡，未按道路路径移动，脚底锚点和接触阴影未统一。

## 第 0–12 章小游戏

第 0–4、6 章使用 `FoundationLesson` 的三组选项按钮；第 5 章是鉴宝卡牌；第 7–12 章已有贡献链的 Issue、远端、分支、PR、Review、Checks 操作，但第 7–12 章仍共享链式工作台与少量背景，不具备每章独立的局部地图声明和完整场景数据。

## 地图与局部场景映射

现有 `regionLessons` 仅为四个回访地点提供 cards/targets；章节数据没有 `parentMapRegionId`、`cameraStart`、`walkableGround`、`npcAnchors`、`interactiveHotspots`、`returnMapReward` 字段，无法证明每章场景是大地图区域的具体下钻。

## 武林宝典

`Handbook` 使用 `<dialog>` 固定右侧宽面板，视觉和交互仍是抽屉式：搜索、筛选、术语列表和 details 纵向堆叠。缺少封面、分卷目录、章节索引、书签/待复习专门区、上一条/下一条/回到当前任务动作。

## 章节工作台

贡献链页面把剧情、任务、操作和反馈混在同一个右侧长列，FoundationLesson 也以“选项按钮 + 三步列表”为主；场景层只是一张背景图，操作区不随章节语义变化，反馈虽存在但缺少收束层的地图奖励与悬念。键盘焦点和章节内首步定位未形成统一模板。

## 自由探索与命名

自由探索通过 `AdventureGame` 重新挂载 `demo exploration`，快跳列表来自 `demoStops`，不保证固定第 0–12 章命名；正式地图还混入“飞鸽台、飞鸽分拣局、藏经院”等支线/旧地点，容易与主线列表混淆。演示隔离已有，但需固定主线列表并明确不读写正式进度。

## 测试、构建与桌面

仓库已有 Vitest、Playwright、Electron 脚本和初学者走查记录；本次审计前尚未在本轮执行完整 `content:*、typecheck、lint、test、build、desktop:test、desktop:verify` 链。桌面打包/启动、窗口缩放、控制台无错和真实初学者实测均没有本轮直接证据；`docs/testing/BEGINNER_USABILITY_TEST.md` 明确真实外部用户访谈仍待维护者招募。

## 差距清单

- P0：首次启动统一状态机；独立 RGBA 角色文件与资产验证；0–12 场景契约和独立操作循环；地图严格 0→12 解锁、道路移动、揭雾奖励；工作台分层。
- P1：线装宝典重构与固定自由探索列表。
- 验证：补齐全量脚本、浏览器逐章进入、桌面测试和真实新手记录；在没有外部用户证据前保持“待验证”。
