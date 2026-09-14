# 阶段 C 实施与验收记录

> **历史记录声明（2026-09-14）**：本文记录早期六章贡献链，已由 [PHASE_C_V2_REAUDIT_RESULT.md](../verification/PHASE_C_V2_REAUDIT_RESULT.md) 取代。当前阶段 C 是 13 章主线 + 百戏客栈地图节点；请勿使用本文早期数字作为成品基线。

日期：2026-09-11。状态：深化版已实现；本机浏览器与 macOS ARM64 桌面完整链路验收通过，待用户体验审核。不是跨平台公开发行声明。

## A/B 基线与实施边界

- 当前分支：phase-c-contribution-chain。
- 实际提交：413adb220f2ac3fe5e511e3ee4fa349c29a4aef0，提交标题 chore: save phase B baseline。Git 历史只有这一个基线提交；不能把它说成分别存在 A、B 两次提交。
- 该提交包含 A/B 文档、角色与鉴宝、地图/目标/迁移模块、Electron 桌面壳。已使用 Git tree 只读确认，而非只看未提交文件。
- 本次在基线之上增量开发，没有重置、覆盖原角色资产、删除 A/B 成果或修改 Git 历史。本次 C 修改仍在工作区，未创建 Git 提交、推送或发布。
- 上一轮统一选择步骤的浅切片已由独立场景替换；旧浅层存档字段保留但不计为新场景完成。

## 一、已完成的产品功能与课程

| 地点 | 独立机制 | 连续交付物 |
| --- | --- | --- |
| 第 7 章 悬赏亭 | 搜索已有议题、填写标题/实际/期望、建议标签 | 可见 Issue #13 |
| 第 8 章 双城驿站 | 选择远端，操作 Fetch/Pull/Push，观察三仓库与跟踪记录 | 本地与 origin 同步上游 u1 |
| 第 9 章 分流竹林 | 建分支、编辑 README、看 Diff、选择暂存文件、写说明、Commit/Push | 修复分支与 c1 快照 |
| 第 10 章 合卷台 | 配置 base/head，比较变更，创建 Draft、标 Ready for review | PR #14 与正确合并方向 |
| 第 11 章 议事堂 | 阅读修改意见、再次编辑/暂存/提交/推送、解决讨论、请求复查；编辑冲突结果 | c2、NPC Approve、保留双方意图 |
| 第 12 章 百炼炉 | 执行检查、阅读失败日志、补发布草稿、重跑、Merge、Release、删分支 | 通过的 Checks、v1.0.1 发行记录 |
| 村口路标 | 为三种需求装配入口行囊 | 说明、安装包、源码入口分开 |
| 护身堂 | 精确核对域名、将凭据类型归入安全保管/拒绝渠道 | 无任何真实秘密输入 |
| 飞鸽分拣局 | 调整 Star/Follow/Watch 偏好并观察事件投递 | 收藏、关注人、订阅仓库相互独立 |
| 第 13 章 藏经院 | 将社区文书放入对应书架，再选择漏洞报告渠道 | 健康仓库文书与私密报告决定 |

六章每章都有成功、错误原因、立即重试、重复操作反馈；重复动作不制造重复 Issue/Commit/Release。地图与 reducer 双重依赖，藏经院在贡献链完成后解锁。区域回访在鉴宝后可用，未强行改写已审核的 A/B 起步路径。

存档包含事件日志、场景表单草稿、区域交付物；刷新、退出应用再打开可恢复。编辑工作区与暂存快照真正分离，不把它们变成一个布尔“正确答案”。

## 二、地图、人物与动效

新生成完整四区域地图和六场景图集，保留原 A/B 图片不覆盖。原创背景不含人物；三位主角均通过现有 CharacterArt 资产契约复用，衣着/配色/身份不变。地图拥有路线、逐区域迷雾、锁定/进行中/完成标记、视角控制和键盘地点列表。

驿站提交包、成功印记、百炼炉的运行/失败/通过有克制动效，遵守系统与行囊的减少动态设置。角色仍是立绘，位置补间不是逐帧行走动画。生成提示词、使用边界与参考记录见 [素材清单](../assets/PHASE_C_ASSETS.md)。

只参考 [Learn Git Branching](https://github.com/pcottle/learnGitBranching) 的操作后观察状态、可重试与任务结构，没有复制其代码或素材。

## 三、真实实践与内容覆盖

- 新增 /field-practice/ 和 [真实实践指南](../setup/FIELD_PRACTICE.md)，提供 Desktop 与 Git 命令双路线、逐条自查、本机恢复、错误排查。
- 明确“安装桌面应用不等于 Fork/Clone 源码”；在 GitHub 网页创建 PR 前，base 和 head 都核对为自己的 Fork。默认不向原项目提交毕业 PR。
- 不读取 GitHub 账号，不集成 API/OAuth，不收集凭据，不发送漏洞信息，不伪造真实操作验证。
- 现有词典共 102 项：P0 25、P1 58、P2 19。旧课程 P0/P1 主线结构覆盖均 100%；P0 25 项有结业题。此数字不是新小游戏的自动掌握认证。
- 六章明确引用 52 个术语，52 项均逐条更新操作说明/误区/官方来源与核验日期。所有关键按钮、状态与场景边界见 [教学审读与 UI 对照](../curriculum/PHASE_C_REVIEW.md)。
- 41 个唯一官方来源链接在线访问通过，并校验重定向仍处于官方域名。链接可访问不等于自动审稿。
- 非 C 词典解释与旧课程保留；不会声称 102 项都已重写。赞助仍默认关闭。

## 四、验收证据

| 验收 | 结果 |
| --- | --- |
| content:validate | 通过：词条、章节、引用、来源域名、C 六章与真实实践结构 |
| content:coverage | 通过：生成旧课程与 C 分开统计的覆盖报告 |
| CONTENT_SOURCE_LIVE=1 content:sources | 通过：41 个唯一官方链接 |
| typecheck / lint | 通过 |
| Vitest | 10 个测试文件、47 项通过 |
| Playwright 全量 | 15 项通过；保留原 14 项 A/B/旧课程回归，新增一条完整 C 六章及四支线流程 |
| 桌面协议单测 | 4 项通过 |
| npm run build | 通过：静态路由生成 |
| desktop:build / desktop:package | 静态导出、macOS ARM64 打包通过 |
| 打包后应用验收 | 离线鉴宝 → 六章 → 四支线 → 真实实践页；第 9 章和终章重启恢复；自查刷新保留 |
| 窗口与键盘 | 1440px / 1024px 桌面检查；无横向溢出；C 按钮使用焦点 + Enter 路线 |
| 页面与资源 | 页面错误、console error、失败资源、HTTP 4xx/5xx 均为空 |

浏览器脚本通过公开 UI 完成任务，不注入完成存档。桌面验证使用真实打包执行文件、仓库外 cwd、独立临时 userData、PATH 不含 Node，并开启离线模式；渲染器 sandbox/contextIsolation 开启，nodeIntegration 关闭。

已有 200 响应的非导航 HEAD 请求取消是已知 Chromium/RSC 行为，单独记入 completedHeadCancellations，未静默隐藏；其他失败仍使验收失败。不能把本机运行等同于 Windows、干净机器安装、签名公证或真实 GitHub 操作验收。

本次发现并修复：选择器对 select 标签匹配不精确；React 存储初始化 lint 问题；人物遮挡剧情文字；地图名称导致旧 B 断言失配；地图立绘挡住地点。没有跳过或删除失败测试。

本机可复查证据（artifacts 被 Git 忽略，不应提交庞大应用二进制）：

- artifacts/phase-c/browser-chapter-7.png 至 browser-chapter-12.png
- artifacts/phase-c/browser-full-map.png
- artifacts/phase-c/final/desktop-phase-c-verification.json
- artifacts/phase-c/final/desktop-chapter-7.png 至 desktop-chapter-12.png
- artifacts/phase-c/final/desktop-full-map.png
- artifacts/phase-c/final/desktop-field-practice.png
- artifacts/phase-c/ab-regression/desktop-packaged-verification.json（原默认桌面流程独立回归）

## 五、最终主要结构

    src/core/game/contribution.ts         事件重放与六章语义状态
    src/core/game/regions.ts              四区域交付物与校验
    src/core/game/adventure.ts            与 A/B 地图及存档增量整合
    src/core/persistence/practice-storage.ts  真实实践自查
    src/content/minigames/contribution-lessons.ts
    src/content/minigames/region-lessons.ts
    src/content/vocabulary/zh-CN/contribution-review.ts
    src/content/scenarios/field-practice.ts
    src/components/adventure/contribution-chain.tsx
    src/components/adventure/region-scene.tsx
    src/components/capstone/field-practice.tsx
    src/app/field-practice/page.tsx
    public/world/jianghu-full-v1.png
    public/world/contribution-scenes-v1.png
    tests/helpers/contribution-flow.mjs   浏览器与桌面共用公开 UI 流程
    tests/e2e/contribution.spec.ts
    tests/unit/{contribution-chain,regions,practice-storage}.test.ts

没有为了目录树新建空文件；纯静态内容仍与 UI 分离。状态兼容细节见 [C 状态架构](../architecture/PHASE_C_STATE.md)。

## 六、本地启动与复验

源码开发：

    npm install
    npm run dev

打开 http://localhost:3000/adventure 。本次验收服务器单独使用 127.0.0.1:3012，避免干扰其他服务器。

历史测试包已清理；当前候选包和验收状态见 [阶段 D 成品验收](../releases/PHASE_D_ACCEPTANCE_2026-09-14.md)。

可在 Finder 中打开。不要为了运行而关闭系统整体安全保护；正式分发需要后续签名/公证与干净系统测试。此目录已含运行资源，不需要用户另外安装 Node。

重新构建与验证：

    npm run desktop:build
    npm run desktop:package
    npm run desktop:verify:c -- --app "/实际新包路径/GitHubStarterVillage.app/Contents/MacOS/GitHubStarterVillage"

包装器每次输出新目录，必须使用本次返回的路径，不能一直验证旧包。

## 七、Skills、素材替换与限制

本次使用 Imagegen（同风格原创地图/场景）、Next.js（静态导出与客户端边界）、React Best Practices（状态/存储与组件复核）、agent-browser / agent-browser-verify / verification（启动后的截图、错误和完整链路核验）。未引入新的视觉规则与 A/B 竞争，也未安装新插件。

品牌名称、仓库/网站地址仍在 src/config；公开前替换占位配置。赞助无真实二维码、继续关闭，无需为了本阶段提供素材。新增原创地图与场景已入仓库，不依赖远程图源。

已知限制：

1. Mac ARM64 本机测试通过；Windows/Intel Mac、干净系统、签名公证与公开 Release 尚未完成。
2. 这是限定场景模拟，不是通用 Git 客户端或任意命令沙箱；冲突与 CI 草稿规则有明确简化说明。
3. 第 0—4 章的完整安装教学保留 README/指南，区域回访不替代全部安装实操。旧版 /play 与新 /adventure 仍并存，旧 P0 认证不与 C 自动混算。
4. 人物使用一致立绘与位置动画，尚无完整逐帧动作库；演示不读写正式进度，但 C 尚无各章预置快跳。
5. 未操作真实 GitHub 账号、Fork 或 PR；仅验证安全指南与自查记录。真实操作必须由学习者自行完成。

## 八、下一阶段最优先的三项

1. Windows 实机与干净系统安装验收，之后由维护者授权签名/公证及 Release 下载发布。
2. 让中文初学者盲测真实实践与六章操作，记录卡点；据此继续打磨任务反馈与非 C 词典解释。
3. 统一旧课程与武侠版结业证据，补齐录屏预置场景与一致角色动作帧，随后制作传播素材。
