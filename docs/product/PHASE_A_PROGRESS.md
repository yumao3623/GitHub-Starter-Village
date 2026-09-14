# 阶段 A 实施记录

> 当前基线已统一到 [阶段 A/B/C 当前交付基线](PHASE_ABC_BASELINE.md)。本文保留 A 的历史实施证据；其中“14 章”等旧课程统计不代表当前武侠主线章数。

更新：用户已审核通过阶段 A，并于 2026-09-11 授权阶段 B。下文保留阶段 A 当时的实施和验收记录，新增结果见 [PHASE_B_PROGRESS.md](PHASE_B_PROGRESS.md)。

用户于 2026-09-10 批准改版需求并授权开始阶段 A。

## 范围与顺序

1. 审查现有实现、相关 Skills 和当前 Next.js 静态导出文档。
2. 生成原创三角色设定样板、局部地图和鉴宝场景，记录来源与提示词。
3. 实现独立的 `/adventure` 阶段 A 入口：选角、地图、完整鉴宝、后继地点解锁。
4. 以独立版本存档验证操作恢复、导入导出、错误反馈与键盘操作，不迁移或覆盖旧版学习记录。
5. 构建静态内容并封装 Electron，验证本机可打开；另提供可复现的 Windows 打包路径。
6. 内容、类型、lint、测试、构建、浏览器与桌面验证，记录真实结果和限制。

阶段 A 不扩展其余章节，不授予 P0 全部掌握或正式毕业，不发布网站、不推送、不上传 Release。

## 设计约束

Design Read：淡彩水墨江湖场景，清楚的现代中文操作台，原创一致角色，教学动作驱动地图变化。

Taste dials：DESIGN_VARIANCE 6 / MOTION_INTENSITY 4 / VISUAL_DENSITY 5。适度地图不对称、动作反馈、集中操作密度。浅纸面是已批准的水墨画卷方向；不把落地页的卡片、标签或章节编号限制套到游戏的真实状态标识。阶段 A 为明确的样板入口，保留版本状态说明。

使用 Skills：design-taste-frontend（视觉层级与审读）、imagegen（原创图像）、nextjs（静态输出与客户端边界）、shadcn（现有 Button 变体与控件组合）、react-best-practices（状态和组件审查）、agent-browser / agent-browser-verify / verification（实际体验验证）。

## 实施结果（2026-09-10）

阶段 A 的可玩样板已实现；**2026-09-10 追加授权后，macOS Apple Silicon 独立应用打包及本机完整流程验收通过。** 阶段 A 技术验证已完成，等待用户体验审核；这不是十四章正式版或跨平台发布验收。

- 新入口 `/adventure`；固定初始数据、不读写学习存档的 `/adventure-demo`。旧课程入口保留，不同时改造十四章。
- 三个原创主角：陆行舟、沈知微、阿团。选角、地图、场景与结算复用同一角色图集，角色不同不改变难度。
- 云溪谷局部地图：客栈、集市、飞鸽台，路径、位置标识、迷雾、完成反馈和先修条件。飞鸽台目前只是解锁后的剧情预告。
- 完整鉴宝：查看三卷资料，收集证据，放入运行环境/使用条件/维护线索，给出三卷鉴定，再交付推荐。Stars 是干扰资料，不是质量或授权凭证。错放、证据不足、错误鉴定都有原因反馈，允许立即重试。
- 复玩变体改变真实任务条件，使另一卷成为正确推荐，而非只交换按钮位置。
- 武林宝典可搜索、打开术语解释与官方来源；行囊支持减少动效、导入导出、确认重置。损坏存档停止自动覆盖。
- 独立版本存档记录关卡内部证据、角色、地点和解锁；不修改旧版进度，不把收集或通关直接记为 P0 掌握。
- Electron 桌面壳与打包脚本已实现。静态资源通过私有协议读取，没有后台开发服务器；禁用渲染页 Node、隔离上下文、启用沙箱、阻止远程内容加载，外部官方文档交给系统浏览器。

## 实际验证

| 项目 | 结果与范围 |
| --- | --- |
| 内容校验 | 通过；既有课程 102 个词条、14 章、25 道 P0 结业题；新增鉴宝数据另有 Zod 与内容测试 |
| 内容覆盖 | 旧课程结构性覆盖 P0 25/25、P1 58/58；不是十四章已改为武侠小游戏，也不是学习效果证明 |
| 类型检查、lint | 通过 |
| Vitest | 5 个文件、19 项测试通过，包含新增状态/存档/鉴宝内容测试 |
| 桌面协议测试 | 4 项通过：路径范围、外链白名单、CSP、静态资源/错误响应 |
| Playwright | 10 项通过，其中阶段 A 5 项；含鉴宝完整通关、条件变体、保存恢复、演示隔离、损坏存档、键盘触发与宝典焦点恢复 |
| 桌面布局 | 1440×940、1024×720 截图与关键操作检查；未开展移动端完整验收 |
| 普通生产构建 | `npm run build` 通过 |
| 桌面静态导出 | `npm run desktop:build` 通过，输出 `out/`（约 17 MB，不含 Electron 运行时） |
| 浏览器错误 | 新关卡通关测试无 pageerror；独立浏览器检查未见错误覆盖层 |
| 本机 Electron 壳 | macOS arm64 已实际打开；安全设置断言、断网鉴宝、关闭重开恢复、私有协议进入 `/start/` 均走通 |
| 桌面完整脚本 | **通过**：GET/HEAD 探测 200，断网完成鉴宝，关闭重开恢复，往返本地指南，加载 25 次本地 RSC 数据；无页面/控制台错误、实际资源失败或 4xx/5xx |
| 打包后应用启动 | **通过**：独立 `.app` 从非仓库临时目录启动、PATH 不含开发 Node；上述完整流程再次通过，记录 `packaged: true` |
| Windows/干净系统/签名 | 未验证、未签名、未公证、未公开发布 |

测试脚本不会因有截图就宣称成功。早期过严的请求断言已按实际响应证据修正：只将本地、非导航、fetch 类型、HEAD 方法、已经收到 200 的 `ERR_ABORTED` 单独记录；其他失败和所有错误响应仍会阻止通过。两次桌面验收各记录 11 条此类 HEAD 取消，不声称网络事件列表完全为空。键盘自动化使用聚焦后 Enter/Space，并验证宝典 Escape 返回焦点；这不是专业读屏器审计或完整 Tab 顺序人工审计。

### 桌面阻塞的经过

官方运行时下载连接超时，随后使用 Electron 官方安装文档列出的 npmmirror 镜像。下载的 Electron 44.3.0 darwin-arm64 压缩包由 `@electron/get` 使用 npm 包内置 SHA-256 校验值验证后写入本机缓存，再由官方安装脚本解压。没有关闭校验。

桌面第一次验证已执行并达到末尾请求断言；后续命令曾被审核服务容量错误拒绝，没有绕过。用户追加“允许”后继续，经命令级审批完成验收。

新增诊断确认：取消记录均来自 Next.js 静态导出路由在加载 RSC 文件前发出的 HEAD 探测，并且已返回 200；直接 GET/HEAD、实际 RSC 读取和往返导航均成功。空流替代 null 的试验未消除取消，因此没有保留“空流已修复问题”的错误结论，也没有修改 Next.js 内部代码。协议补齐 Content-Length，测试补充 HEAD 无正文断言。打包器按已安装 20.3.0 版本改为具名 `packager` 导入。

本轮 verification 技能用于完整使用流程及逐层证据检查，Next.js 技能与本地版本文档用于解释静态路由的 HEAD/RSC 请求，而不是修改课程或视觉。

## 文件与查看入口

- `src/components/adventure/`：选角、地图、鉴宝、宝典与存档设置。
- `src/content/characters/`、`src/content/minigames/`：人物与关卡数据。
- `src/core/game/appraisal.ts`、`src/core/persistence/adventure-storage.ts`：关卡规则与隔离存档。
- `desktop/`、`scripts/*desktop.mjs`、`src/config/desktop.json`：桌面壳、协议和本机构建。
- `public/characters/`、`public/world/`：原创生成资产；详见[资产清单](../assets/PHASE_A_ASSETS.md)。
- `tests/unit/adventure.test.ts`、`tests/content/appraisal.test.ts`、`tests/e2e/adventure.spec.ts`、`tests/desktop/`：新增验证。
- 本地截图在 `artifacts/phase-a/`（git 忽略）：`desktop-character-selection.png`、`appraisal-feedback.png`、`unlocked-map.png`、`desktop-1024.png`、`desktop-locked-map.png`、`desktop-completed.png`。截图是验收证据，不是完整安装包。
- [体验与构建方法](../setup/DESKTOP_PREVIEW.md)。当前没有真实下载链接；品牌和仓库占位配置尚未替换，赞助继续关闭。

## 本机产物与后续边界

历史验收产物目录已在 2026-09-14 清理，不再作为可下载包；当前候选包见 [阶段 D 成品验收](../releases/PHASE_D_ACCEPTANCE_2026-09-14.md)。

ZIP 文件：`GitHubStarterVillage-phase-a-mac-arm64.zip`（约 135 MB），压缩包完整性检查通过。SHA-256：`1bec444624adbdf31d5f73ce04812d3ef6cc4aa0499ff48b38510325a2f497b3`。哈希用于核对文件是否改变，不是开发者签名或安全背书。解压后打开目录里的 `.app`，无需安装 Node.js/npm；未签名样板在其他机器可能受到系统安全检查阻止，不建议关闭系统安全保护。

成品验证报告：`artifacts/phase-a/desktop-packaged-verification.json`，验证时间 2026-09-10 22:58（UTC+8）。开发壳报告为同目录 `desktop-verification.json`。旧的早期构建保留在其他时间戳目录，不作为本次验收产物。

1. 用户体验审核一个关卡后，再进入阶段 B；没有代替用户评价“是否好玩”。
2. Windows、Intel Mac、干净系统安装、签名/公证仍需后续专门验证。
3. 动作帧、角色表情、十四章连续剧情、正式安装器和发布属于后续阶段；本阶段不提前实现。

本轮未推送 GitHub、未部署、未上传 Release、未配置签名证书、未加入 OAuth/API/数据库，也未伪造任何真实 GitHub 操作验证。
