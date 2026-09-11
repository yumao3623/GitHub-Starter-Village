# 阶段 D 实施与验收记录

日期：2026-09-11。状态：**本地开发修复与内部候选交付完成；公开下载版本的签名/公证、跨系统实机与干净系统验收仍未闭环，不宣称公开版已完成。** 本轮获准创建本地 Git 提交，没有推送或上传 Release。

## 基线与实施顺序

确认当前分支 phase-c-contribution-chain，起始 HEAD a19516f（阶段 C），父提交413adb2包含A/B。已读取 AGENTS、改版 PRD、A/B/C 记录；本次仅增量修改，保留旧进度和原画。阶段 A/B/C 已由用户审核，本文件不改写其历史证据。

Design Read：沿用淡彩水墨江湖与清晰现代操作区，新增动作只反馈状态，留影和录屏围绕同一角色，不把教学工作台改成商业游戏皮肤。

执行顺序：排查存档/分享回归 → 动作与纸面素材质检 → 真实统计与演示预设 → 下载配置/打包完整性 → 浏览器/解压桌面验收 → 本地提交。

## 修复与实现

| 范围 | 实际交付 |
| --- | --- |
| 存档测试 | 损坏存档用例先等待 hydration 和首次落盘再注入损坏值；之前“并行上下文隔离问题”的解释没有证据，已纠正为测试与初始保存的竞态。重复3轮通过。 |
| 分享上下文 | 冒险路由没有旧课程 GameProvider，不能直接复用依赖 useGame 的分享组件。新增独立 AdventureShareCard，直接使用冒险状态。 |
| 分享统计 | 从 simulation.events 重放取得6章贡献链成绩，不再读取已弃用 completedChapters。区域进度另列；P0只计已有独立评估证据；首答错误不能靠重试或切换卷轴洗掉。 |
| 用时/声音 | 向后兼容的 v2 metrics 默认零值；只计可见、有焦点且近60秒有操作的时间，5秒粒度。提示音为原创合成且默认关闭，无背景配乐。 |
| 美术/动效 | 新增三角色纸面动作图集与水墨纸面。读卷/拱手接入场景/结算，地图及分享坚持原角色身份。透明生成失败稿被淘汰，没有把棋盘格当透明。系统/应用减少动效均关闭动画，失焦暂停。 |
| 分享卡 | 1080×1920与1200×630 PNG，本地生成、不上传；显示角色、贡献链/区域数、P0评估、鉴宝首答、有效用时、称号、仓库占位与非官方声明。无评估显示未评估，不称毕业认证。 |
| 录屏 | 14个固定镜头入口（选角/地图/鉴宝/六章/四支线/留影）；通过同一规则重放，不篡改解锁。快跳、当前镜头复位、全局复位、竖版集中构图；独立内存，不读写正式存档。桌面增加演示菜单。 |
| 下载入口 | README标记区由集中配置生成/校验。未发布时没有可点击的 OWNER 假链接；说明平台、文件名、解压与 Source code ZIP 区别。新增中文下载手册。 |
| 打包 | Mac arm64 / Windows x64 / 实验 Intel Mac 命令；生成版本化ZIP、SHA256SUMS、artifact.json。构建输入指纹阻止打包过期 out；包含源码提交/dirty标记、asar哈希、资产及依赖许可证。 |
| 资产出处 | 8张图片登记哈希，其中7张进入成品。旧V1品牌图原记录不足：保留Git文件但首页改用已有C地图，打包明确排除旧图。无外部商业IP/二维码。 |
| 验收脚本 | 加入两种PNG的 Electron原生下载状态和文件尺寸、演示隔离、系统与内存/启动记录。原浏览器 download 事件不适用于该Electron验证，已修正，不忽略失败。 |

## 课程范围与覆盖

原课程14章、102术语：P0 25、P1 58、P2 19。P0/P1主线引用覆盖100%，P0互动/原结业题覆盖25/25。武侠版保留鉴宝、第7—12章六段操作链、四区域支线和自己Fork的真实自查。**这不等于武侠版所有P0都有独立评估**；本轮不扩展已经批准的阶段C课程判定，不虚增新版掌握率。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| content:validate / coverage | 通过；上列覆盖不变 |
| content:sources | 41个官方URL的域名/格式登记检查通过；不是本轮对41页逐一在线通读 |
| assets:validate | 8文件完整性通过；旧图历史来源缺口显式登记，打包排除已核验 |
| typecheck / lint | 通过 |
| Vitest | 11文件，53/53通过 |
| desktop:test | 6/6通过，含ZIP篡改/路径穿越和外链/协议边界 |
| build / desktop:build | 15个静态路由，通过；已消除仓库外锁文件导致的Next根目录警告 |
| Playwright开发页面 | 17/17通过 |
| 重点用例重复3轮 | 21/21通过，含损坏存档、键盘、保存、演示、两种PNG |
| Playwright静态成品 | 17/17通过；没有开发工具覆盖层 |
| agent-browser | 实际页面、导航、动作与卡片截图检查；无pageerror/console error |
| 最终Mac ZIP解压验收 | 通过：独立临时目录与新测试存档启动，PATH无Node；断网鉴宝、7—12章、四支线、重启恢复、真实自查持久化、两种PNG原生下载、演示快跳/复位/隔离 |
| Windows x64 | 交叉打包、ZIP与SHA通过；没有Windows运行验收 |
| 签名条件 | 0可用codesigning身份；notarytool/stapler存在。可执行文件仅Electron链接器ad-hoc，不是Developer ID签名；无公证，无Windows签名 |

最终Mac启动到可交互角色选择为1725ms；测试机Apple M5 Pro / 24GiB，系统sw_vers为macOS26.6.2，Node内核版本25.6.0。末次进程工作集采样合计约903MiB，包含Browser/GPU/Utility/Tab；不是低配性能承诺或严格整机峰值。完整采样见[去个人路径的验收摘要](../releases/PHASE_D_VALIDATION.json)。

桌面记录 errors、consoleErrors、failedRequests、4xx/5xx均为空；已收到200的HEAD取消另行记录（Next静态路由探测），不伪称所有网络事件都为空。

## 交付包与证据位置

最终候选（不要使用其他较早时间戳目录）：

- Mac：artifacts/desktop/darwin-arm64-1789092061717/GitHubStarterVillage-0.1.0-darwin-arm64.zip，152897538字节（约145.8MiB）。
- Mac SHA-256：257ab3fb4bd42f48d9164b571eb568b6ff269e612de763181a457f41ba9347e3。
- Windows：artifacts/desktop/win32-x64-1789092139865/GitHubStarterVillage-0.1.0-win32-x64.zip，181536041字节（约173.1MiB）。
- Windows SHA-256：f2595a55063aea62b3e99c21c2412c378e541e3b66b35580ca4940918e52f52d。
- 最终Mac解压目录：artifacts/phase-d/final-unpacked/；实际报告 desktop-phase-d-verification.json，截图 desktop-*.png。
- 录屏样片：artifacts/phase-d/recording/（WebM与recording.json），明确固定演示，非用户实绩。
- 分享图：artifacts/phase-d/desktop-share-1080.png、desktop-share-1200.png。
- 产物清单记录构建时HEAD a19516f和dirty=true；sourceDigest固定本次输入，appAsarSha256固定实际应用。Git提交发生在验收之后，因此不把提交前构建虚称为干净提交构建。

Windows下载官方运行时曾超时，使用[Electron官方安装说明](https://www.electronjs.org/docs/latest/tutorial/installation)列出的npmmirror镜像重试成功，仍采用锁定Electron包自带SHA-256校验，不使用远程替代哈希、不关闭校验。二进制、视频与本机原始报告不进入Git；去个人路径摘要随源码提交。

## 最终结构与本地使用

延续src/content、core、components、config与desktop。新增share-summary、demo预设、presence hook，scripts/lib构建指纹/分发校验、录屏/静态预览，docs/assets与docs/releases证据；没有数据库、OAuth、GitHub API、账号或AI运行服务。

普通用户：由维护者交付内部ZIP，解压打开应用；正式公开前不要散发为稳定发行版。
源码体验：npm install → npm run dev → /adventure/。
录屏：npm run desktop:build → npm run desktop:preview；另终端设置GSV_TEST_URL=http://127.0.0.1:3015后运行npm run demo:record。
再次验收：见[平台清单与命令](../setup/DESKTOP_RELEASE_CHECKLIST.md)。

## Skills与边界

- design-taste-frontend：沿用水墨纸面、清晰层级和克制动效，不支配游戏状态机。
- imagegen：原创纸面/角色图集生成与失败稿质检；未安装或调用项目内AI服务。
- nextjs及本地Next文档：静态导出、客户端边界、构建根目录。
- shadcn：沿用现有Button和可访问控件组合，不引入另一套默认主题。
- react-best-practices：状态派生、兼容字段、事件清理、分享组件独立性。
- agent-browser / agent-browser-verify / verification：实际浏览器、静态输出、解压后桌面完整流程；没有把开发服务器成功当成桌面验收。
- 未安装新Skill，未使用并行子代理。

## 仍不能宣称完成的公开门禁与限制

1. Windows/Intel Mac实机、干净系统安装/升级/卸载、真实下载后安全提示仍需设备与人员复测；本机独立目录不等于干净操作系统。
2. Developer ID、公证、Windows签名需要维护者条件与单独授权。没有登录、证书使用或发布权限，不能替你完成或捏造；--public门禁仍失败。
3. 品牌OWNER/website占位、正式发布身份由维护者替换；赞助默认关闭，未生成二维码。
4. 美术为稳定立绘、纸面关键姿势与程序补间；不是完整六表情/转面/连续精灵动画生产库，也没有背景音乐。未把这些扩展规划包装为已制作。
5. 武侠版独立P0评估仍有范围限制，分享卡如实显示；真实Fork/PR等仍是玩家自查，无外部验证。
6. 本次不包含专业读屏器、全部Windows缩放、低配机器或真实新手招募测试。

下一阶段优先：先由你复测实际Mac/Windows包并收集具体问题；随后完成签名和干净系统发布门禁；最后再根据反馈扩充角色细节与独立评估。是否开启E阶段由你决定，本轮没有擅自开新阶段或上传GitHub。
