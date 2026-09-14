# 云溪谷十三章实施交付报告（2026-09-11）

## 交付结论

已依据已审核的 `NEW_TASK_HANDOFF_PRD.md` 与 `GITHUB_GAME_LEARNING_CASES.md` 完成一套新的 v3 武侠页游运行时。正式入口统一为“入村引导 → 选择角色 → 江湖地图”，地图承载 0 到 12 章的主线状态，章节页面使用独立局部场景和因果小游戏。工程验收与自动化验证通过；真实初学者可用性仍处于 0/3 招募阶段，不能据此宣称已适合小白。

现状审计已先于实施保存于 [`docs/testing/CURRENT_STATE_AUDIT_2026-09-11.md`](../testing/CURRENT_STATE_AUDIT_2026-09-11.md)。审计记录了旧版直接恢复地图、共享图集串位风险、节点式地图、缺少 13 个场景契约、抽屉宝典、混杂自由探索和未完成验证链等差距。

## 工程范围

核心新增文件包括 `src/config/journey.ts`、`src/content/minigames/chapters.ts`、`src/content/scenarios/chapter-scenes.ts`、`src/core/game/chapter-games.ts`、`src/core/game/wuxia.ts`、`src/core/persistence/chapter-storage.ts`，以及 `wuxia-game.tsx`、`jianghu-map.tsx`、`chapter-workbench.tsx`、`scene-environment.tsx`、`mechanism-trace.tsx`、`character-placement.tsx` 和 `journey.css`。入口路由 `/`、`/map`、`/adventure`、`/adventure-demo`、`/demo` 已接入新运行时；旧课程页面仍保留。

状态机使用 `intro / character / map / chapter / handbook` 视图，章节事件经过可重放校验；正式存档使用版本化 `gsv:wuxia:v3`，演示模式不读写正式存档。旧 v2/A 存档未自动迁移为新的 13 章奖励，避免伪造已完成进度。

## 十三章玩法与地图映射

每章都声明并使用 `parentMapRegionId`、`cameraStart`、`walkableGround`、`npcAnchors`、`interactiveHotspots`、`returnMapReward`。地图锚点按左到右为 `region-0` 至 `region-12`，坐标依次为 `(10,67)、(20,64)、(27,28)、(33,39)、(42,46)、(50,53)、(57,51)、(63,32)、(68,39)、(73,48)、(81,51)、(87,25)、(92,40)`；场景相机使用同一锚点，主角脚底统一落在 `groundY=632` 并带接触阴影。

| 章 | 地点 | 独立玩法与因果链 | 地图奖励 |
|---:|---|---|---|
| 0 | 村口路标 | 调查 README/Code/Releases/Fork → 连用途 → 按真实学习路线点灯 | 路标残页 |
| 1 | 护身堂 | Sign in/Sign up 配对 → 域名/身份/Settings 灯笼顺序 → 防护卡与索取拒绝槽 | 护身符 |
| 2 | 拓印坊 | Fork/Clone/Download ZIP 三台机器 → 产物交付 → HTTPS/SSH 与 Codespaces 工作环境 | 拓印纸 |
| 3 | 营火工坊 | Directory→Terminal→Node/npm → 依赖/开发服务器/localhost 连线 → 读错日志拔线修复 | 营火芯 |
| 4 | 藏图阁 | 探照搜 Files/Branch/History/License/Release → 证据书架 → 归属与可见性核对 | 藏图印 |
| 5 | 集市鉴宝 | 三仓库调查 → 五证据卡组合 → 运行/维护/许可结论 | 鉴宝铃 |
| 6 | 飞鸽传书 | Star/Watch/Follow/Fork 分拣 → Releases 通知滑杆 → Issue/Discussion 投递 | 飞鸽信 |
| 7 | 悬赏亭 | bug/enhancement/duplicate/good first issue 贴签 → Assignee/Milestone/Subscribe → Comment/Mention/Open/Closed | 悬赏签 |
| 8 | 双城驿站 | origin/upstream 马车 → Fetch→Pull→Push → working directory、Sync fork、权限边界 | 驿站牌 |
| 9 | 分流竹林 | 创建 `fix/` 分支 → Switch → 拾取 Changes/Diff 竹签 | 分支竹签 |
| 10 | 合卷台 | 编辑 README 南门 → Diff → Stage/Commit → Push 回执 | 合卷印 |
| 11 | 议事堂 | Base/Head → Compare/Draft/Ready → NPC 评审 → 修订/Resolve/Approve → 冲突双保留合并 | 议事令 |
| 12 | 百炼炉 | Workflow 失败读日志 → Changelog 修复并推送新 SHA → Cancel → Re-run all jobs → Artifact/Tag/Release/Pages | 百炼炉火 |

所有章节均有错误解释、撤销或重试、章节结算、下一章悬念和返回地图；章节内没有其它章节跳转菜单。地图只按 0→12 顺序解锁，未解锁区域是一段连续迷雾，完成后播放揭雾和沿道路行走动画，再落下印章/奖励。

## 角色与素材

陆行舟、沈知微、阿团各自拥有 `standing / walking / inspecting / celebrating` 四张独立 RGBA PNG，共 12 张；另有青砚 NPC 投影图。`extract-character-sprites.mjs` 用透明前景连通区域提取、清理彩边并统一到 420×640、脚底 632；`docs/assets/character-sprites-v2.json` 保存裁切、脚点、视觉中心和光照元数据。浅色/深色接触页、alpha 四角和末行检查均通过，未使用棋盘格、白底、灰边或相邻角色残片。地图和场景使用同一落地契约。一次图像生成清理尝试产生了带棋盘格的 RGB 结果，未纳入产品。

## 武林宝典与交互

`handbook.tsx` 已重写为居中的线装秘籍：封面、分卷目录、0–12 章节索引、英文术语、中文解释、非字面理解、当前场景例子、易混淆概念、官方来源/核验日期、书签、待复习、上一条/下一条/回到当前任务。使用原生 dialog、焦点回收、键盘控件和 reduced-motion；视觉采用纸张、墨色、玉色与木框，未沿用紫色渐变、SaaS 卡片、玻璃拟态或后台抽屉。

自由探索固定为第 0 章至第 12 章上述名称，明确是演示/复习；选择和完成不会改变 `gsv:wuxia:v3` 正式进度。

## GitHub 学习边界

项目继续教导“官方仓库 → 中文 README → Fork → Clone / GitHub Desktop / Codespaces → 本地运行 → 回到自己的 Fork → 安全毕业练习”。游戏内动作均标为本地教学模拟或自检提示；没有登录、密码、Token、SSH 私钥、2FA/恢复码输入，没有 OAuth、GitHub API、真实操作伪造、强制 Star/分享/赞助/上游 PR。赞助保持关闭，README、About 和页脚保留独立项目声明。

## 验证证据

`npm run content:validate`、`content:coverage`、`content:sources`、`typecheck`、`lint`、`test`、`build`、`desktop:test`、`desktop:verify`、`assets:validate` 全部退出码 0；单元测试 75 项通过，桌面测试 6/6 通过。完整 Playwright 主旅程覆盖引导、选角、地图、0–12 章、迷雾/揭雾、移动、错误重试、宝典、自由探索、键盘、缩放和控制台错误，最新结果 12 passed。验证日志和截图位于 `artifacts/journey-verification/`、`artifacts/journey/`、`artifacts/journey-desktop/`。

历史 Apple Silicon 桌面包已在 2026-09-14 清理；当前候选包与验收状态见 [阶段 D 成品验收](../releases/PHASE_D_ACCEPTANCE_2026-09-14.md)。

## 已知限制与人工门槛

`content:sources` 验证的是 43 个官方 URL/domain 记录；网络可达性仍受环境影响。真实 GitHub 动作和权限没有被声称已验证。`docs/testing/BEGINNER_USABILITY_TEST.md` 已建立 3 名真实 GitHub 初学者的中立脚本、任务计时、错误率和安全边界记录，目前真实参与者为 0/3，因此最终产品接受门尚未关闭。

仍需维护者提供的只有真实品牌资产、正式商标/字体规范、可公开使用的赞助素材或真实二维码（若未来产品路线需要）；在获得并审核前不接入、不发布、不打开赞助。

当前工作树保留用户原有修改，未提交、未推送、未部署。

## 文件清单索引

产品与设计：`README.md`、`docs/design/DESIGN_DIRECTION.md`、本报告、`docs/curriculum/COVERAGE_REPORT.md`、`docs/curriculum/JOURNEY_UI_REVIEW_2026-09-11.md`、`docs/testing/CURRENT_STATE_AUDIT_2026-09-11.md`、`docs/testing/BEGINNER_USABILITY_TEST.md`。

运行时与页面：`src/config/journey.ts`；`src/content/minigames/chapters.ts`、`src/content/scenarios/chapter-scenes.ts`、`src/content/characters/assets.ts`、`src/content/vocabulary/zh-CN/index.ts`、`src/content/world/index.ts`；`src/core/game/{chapter-games,wuxia,adventure,demo}.ts`、`src/core/persistence/chapter-storage.ts`；`src/components/adventure/{wuxia-game,jianghu-map,chapter-workbench,scene-environment,mechanism-trace,character-placement,handbook,foundation-lesson,adventure-game,contribution-chain,appraisal-market,world-map}.tsx`；`src/app/{page,map/page,adventure/page,adventure-demo/page,demo/page}.tsx`、`src/app/adventure/journey.css`、`src/components/layout/site-frame.tsx`。

素材与脚本：`public/characters/` 下 12 张主角动作图及 `qingyan-inspecting.png`；`scripts/{extract-character-sprites,create-qingyan-sprite,verify-journey,verify-journey-desktop}.mjs/ts`、`scripts/lib/build-inputs.d.mts`；`docs/assets/{character-sprites-v2.json,SPRITE_EXTRACTION_2026-09-11.md,manifest.json}`；`tests/unit/journey.test.ts`、`tests/helpers/journey-{flow,solutions}.ts`、`tests/e2e/journey.spec.ts` 及保留的 `tests/legacy-e2e/` 参考套件。既有用户未提交的 PRD、原始图集和 Phase F 文件未被删除。
