# 阶段 C · 全主线交付记录

> 本文的全主线代码记录须与最新 [C V2 复核结果](../verification/PHASE_C_V2_REAUDIT_RESULT.md) 一起阅读；若资产数量、人工状态或旧 C-R11–C-R18 记录不一致，以 V2 复核结果为准。

日期：2026-09-14

## 交付范围

- 以修订稿 v0.2 的阶段 A/B 资产与实际配置为基线，完成第 0–12 章共 13 章主线；章节数量来自 `src/content/minigames/chapters.ts`，不使用旧文档中的“14 章”文字。
- 每章都有独立的可 replay 规则、错误反馈、撤销、重开、证据链和 seed 1 变体，集中定义于 `src/content/minigames/campaign.ts` 与 `src/core/game/campaign.ts`。各章玩法分别覆盖路引寻路、安全审查、拓印交付、运行排障、版本检索、虚拟鉴宝、飞鸽分拣、Issue 协作、fetch/pull/push、分支、暂存提交、PR 评审、Actions 发布链。
- `CampaignWorkbench` 已接管 13 章工作台；所有操作通过版本化本地存档记录，不连接 GitHub 账号、不收集凭据。旧版 `chapter-games` 记录仍可导入和回放。
- 地图使用完整 `jianghu-full-v1.png`，13 个地点各有独立的生成卷轴图集（封缄/可进入/已完成三态与正确章数），锁牌不再复用第四章数字。
- 每章新增 4×2 生图道具图集，工作台通过 sprite 裁切使用；透明度已复核为 RGBA。木质动作按钮、行囊/银票/路引、翻书过场和结尾茶席均使用生成资产。
- 全局中文正文、标题、品牌和代码说明分别使用 LXGW WenKai、Ma Shan Zheng、Zhi Mang Xing、WenKai Mono；英文保留可读的 Cormorant/系统回退，不再使用单一现代无衬线。
- 新手引导在入村、角色选择和每章首步提供；错误原因、证据入口、键盘操作和无倒计时说明均可见。页面布局在 1280×800 下不产生垂直滚动；章节切换使用翻书过场并提供跳过按钮。
- 经济系统为纯游戏内铜钱/银票/路引，章首奖励、兑换、账本和迁移挑战均有不可重复交易 ID。赞助入口保持关闭，只有维护者补齐真实收款码后才会显示；结尾保留联系邮箱。

## 自动校验

- `npm run content:validate`、`npm run content:coverage`、`npm run content:sources`：通过。
- `npm run assets:validate`：早期记录曾登记 62 项；当前验收实际输出为 169 个运行资产，最终人工对象口径见 C V2 复核结果。
- `npm run typecheck`、`npm run lint`：通过；仅保留阶段 A 评审样例的既有 warning。
- `npm run test`：15 个测试文件、113 项通过；含 13 章 × 2 变体的可解性、重放、存档账本、权限边界、跨章道具联动测试。
- `npm run build`、`npm run desktop:build`、`npm run desktop:test`：通过。
- 已在本地开发页面完成入村→选角→地图→第 0 章工作台的浏览器可见性检查，13 个地图节点均显示且地图无滚动。

## 人工验收修订（2026-09-14）

- 依据 `PHASE_C_HUMAN_REMEDIATION_PRD.md` 完成 C-R11–C-R18：压缩玩家文案、统一角色卡、修复地图宣纸边缘与锁牌雾形、优化翻页过场、替换粗糙路线 SVG、复核透明素材，并为每章补充下一步提示与可选行囊助力。
- 行囊凭证现在会在对应章节产生可见规则影响，使用过程写入本地账本；不会跳过章节知识验证，也不连接真实 GitHub。
- 已通过 1280×800 浏览器检查：入村、选角、13 节点地图、第 0 章引导与工作台；截图保存在 `docs/verification/phase-c/`。

## 人工验收边界

尚未进行 GitHub 发布、签名/公证、Windows/Intel 或干净系统验收。macOS 打包脚本已将 `public/brand/jianghu-manual-icon-v1.icns` 作为应用包图标，并在运行时设置 Dock 图标；最终菜单栏/Dock 外观仍需你重启 Electron 或安装包人工确认。支付宝/阿里巴巴收款码未提供前不会启用赞助。
