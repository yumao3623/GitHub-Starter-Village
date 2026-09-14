# 阶段 A/B/C 当前交付基线

更新：2026-09-14  
用途：阶段 D 成品验收的唯一产品基线。本文统一记录阶段 A、B、C 的实际交付；早期实施记录保留为历史证据，若与本文冲突，以本文和最新的 C V2 复核结果为准。

## 统一口径

- 武侠主线以 `src/content/minigames/chapters.ts` 的运行配置为准：第 0 章至第 12 章，共 **13 章主线**。
- 地图节点为 **14 个**：13 个主线节点，加上“百戏客栈”支线节点。不能再把旧课程的 14 章统计写成武侠主线章数，也不能把地图节点数写成主线章数。
- 阶段 C 的最终验收依据为 [PHASE_C_V2_REAUDIT_RESULT.md](../verification/PHASE_C_V2_REAUDIT_RESULT.md)，不是早期“六章贡献链”或“62 项运行资产”的记录。
- 资产数量采用 C V2 复核口径：104 件独立透明对象，另有纸张、客栈锁卷轴、骨骰等新增生图；`npm run assets:validate` 的当前运行资产登记以验收时实际输出为准。
- 所有 GitHub 登录、Fork、Clone、Push、Pull Request 和发布行为仍是官方页面或 Desktop 中的真实实践；本地游戏只做明确标注的模拟教学，不收集凭据、不接 OAuth/API。
- 赞助入口在没有维护者提供真实收款码前保持关闭；联系邮箱可以展示为 `603244647@qq.com`，不构成付款要求。

## 阶段交付

| 阶段 | 当前确认的实际交付 | 证据与边界 |
| --- | --- | --- |
| A | 入村引导、三角色、局部江湖地图、鉴宝教学关、武林宝典、隔离存档与 Electron 壳；A 视觉方向选择束带行囊秘籍图标候选 C，并落地古风字体/素材管线。 | [PHASE_A_PROGRESS.md](PHASE_A_PROGRESS.md)、[v0.2-phase-a](../design/v0.2-phase-a/README.md)。A 不是完整 13 章，也不是公开发行验收。 |
| B | 角色与场景资产契约、地图状态/对话/目标/迁移、代表性第 0/8/10 章样板、共享钱包基础、宝典筛选与辅助评估。 | [PHASE_B_PROGRESS.md](PHASE_B_PROGRESS.md)、[PHASE_B_SAMPLE_PROGRESS.md](PHASE_B_SAMPLE_PROGRESS.md)。早期“仅一关”的说明属于样板阶段历史记录。 |
| C | 13 章独立主线玩法与重玩变体；每章错误反馈、撤销/重开、证据与新手提示；全景桑皮纸地图、14 节点卷轴锁牌、104 件独立对象与新增骨骰/客栈素材；中央书脊单页翻书；“六骰聚财”三回合风险取舍；铜钱/银票/路引账本及中断恢复；古风中英字体；自定义 `.icns` 打包图标；赞助关闭。 | [PHASE_C_V2_REAUDIT_RESULT.md](../verification/PHASE_C_V2_REAUDIT_RESULT.md) 已记录人工通过与自动证据。未包含 GitHub 上传、Apple 公证、Windows/Intel 或干净系统验收。 |

## 旧记录如何阅读

`PHASE_C_PROGRESS.md`、`PHASE_C_MAINLINE_PROGRESS.md`、`PHASE_C_HUMAN_REMEDIATION_PRD*.md`、`PHASE_C_REVIEW.md` 和 `PHASE_C_ASSETS.md` 中较早的六章、62 项、旧锁牌或旧玩法文字只用于追溯调整过程。阶段 D 报告不得引用这些旧数字作为当前完成口径；需要引用时必须同时链接本基线和 C V2 复核结果。

## 阶段 D 起点

阶段 D 只验收当前 A/B/C 成品在构建、浏览器、Electron 包、存档恢复、资产/字体/图标、窗口尺寸和发布门禁上的可复现证据。阶段 D 通过不等于公开发布：签名、公证、干净系统、跨平台实机和 GitHub Release 仍需单独的人工作业与授权。
