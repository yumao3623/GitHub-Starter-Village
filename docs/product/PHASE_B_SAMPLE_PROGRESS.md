# 阶段 B 代表性可玩样板实施记录

> 本文是 B 的样板历史记录。当前 A/B/C 交付以 [PHASE_ABC_BASELINE.md](PHASE_ABC_BASELINE.md) 为准，完整主线以 C V2 复核结果为准。

日期：2026-09-12。阶段 A 交付物已核验，保留原有阶段 A 文档、存档和 Electron 验收记录。本记录只追踪 B 的新增样板层，不覆盖 `PHASE_B_PROGRESS.md` 中已完成的底层架构说明。

## 已实现

- 第 0 章“村口路标”：路牌调查、用途配对、顺序寻路三段连线局面；错误保留局面并给出 GitHub 因果提示。
- 第 8 章“双城驿站”：origin/upstream 远端归位、Fetch → Pull → Push 调度、工作区与网页 Sync fork 边界配对。
- 第 10 章“合卷台”：README 修改、Diff 顺序检查、Stage 分组、Commit message 验印、Push 回执五段叠签局面。
- 新增共享钱包：完成章节首次结算 +10 铜钱；第 0 章领取“云溪路引”；样板中可用 5 铜钱请求一次额外线索；余额与幂等奖励进入 v3 本地存档。
- 三联正式生成素材用于三个样板盘面，章节文字和英文术语仍由内容层渲染并可校对。
- Electron macOS 运行时设置线装秘籍 Dock 图标；图标资产离线随 `public`/`out` 打包链路分发。

## 本轮验证证据

- `npm run content:validate`、`content:coverage`、`content:sources`、`typecheck`、`lint`、`test`、`build`、`assets:validate`、`desktop:test` 均通过；lint 仅保留阶段 A review 工具的 3 条既有 warning。
- 该样板包已在 2026-09-14 清理；历史验证结论保留，当前候选包见 [阶段 D 成品验收](../releases/PHASE_D_ACCEPTANCE_2026-09-14.md)。
- 包内 `Contents/Resources/electron.icns` 与 `public/brand/jianghu-manual-icon-v1.icns` SHA-256 均为 `7e5b23bb52b4f295dd9d0806d2bb79fe652cd769d5af4bda7d3d12f2f6cf03ac`。
- 当前机器直接启动开发态 Electron/Next dev server 受到本机 `EPERM` 进程限制；不影响上面的打包 `.app` 验证，仍需在用户重启后的实际桌面环境进行人工视觉核验。

## 尚未宣称完成

全量十三章升级玩法、全量锁牌/字体/动效替换、章节翻书转场、收款码接入、Windows/Intel/签名公证和发布仍是后续阶段或独立验收项。本阶段没有推送、发布或修改真实 GitHub 数据。
