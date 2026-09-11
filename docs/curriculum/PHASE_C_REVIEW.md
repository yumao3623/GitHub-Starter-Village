# 阶段 C 教学与 UI 审读

2026-09-11。不是只检查 URL 存在：六章故事、操作条件、错误原因与现实边界分别编写。52 个关联词条在 `contribution-review.ts` 中有逐条操作说明与常见误区，课程引用由 `content:validate` 校验。来源在线可用不等于每一句解释都已被自动审核。

## 核心 UI 对照

| 地点 | 关键 UI / 状态 | 中文解释和操作依据 |
| --- | --- | --- |
| 悬赏亭 | Search / Issues / Title / Submit new issue | 搜索已有议题、填写具体标题、提交新议题；创建后出现 Issue #13，不改文件 |
| 悬赏亭 | Open / Closed / bug / enhancement / duplicate | 开放/关闭状态，缺陷/增强/重复标签；标签由模拟维护者应用，普通访客不一定有权限 |
| 悬赏亭 | Assignee / Milestone / good first issue | 负责人、阶段目标、入门友好标签；不等于领取按钮或写权限 |
| 双城驿站 | Local / Remote / origin / upstream | 本地与远程；远端别名由配置决定，不是固定权限角色 |
| 双城驿站 | Fetch / Pull / Push / Sync fork | 取回跟踪记录、获取并整合、上传已提交历史、网页同步 Fork；三位置独立可见 |
| 分流竹林 | Create branch / Switch branch / main | 创建/切换分支，main 不跟随修复工作区变化 |
| 分流竹林 | Working directory / Changes / Diff / Stage / Staged changes | 工作区、改动、差异、暂存动作与暂存快照；暂存后编辑不会自动加入 Commit |
| 分流竹林 | Commit / Commit message / SHA / Push | 本地快照、说明、提交标识、上传历史；c1/c2 明示为游戏标记 |
| 合卷台 | Base / Head / Compare / Compare changes | 目标和来源、比较差异；本关虚构上游贡献，真实实践限定自己 Fork 内 |
| 合卷台 | Draft / Ready for review / Conversation / Commits / Files changed | 草稿/待审、讨论/提交/文件差异，不意味着已经批准或合并 |
| 议事堂 | Review / Comment / Approve / Request changes | 审查及三种结论；批准来自 NPC，不伪装作者自批 |
| 议事堂 | Resolve conversation / Merge conflict | 处理讨论与编辑冲突；不能用“关闭讨论”代替改文件 |
| 百炼炉 | Actions / Workflow / Workflow run / Job / Step | 自动化入口、定义、一次执行、工作单元、步骤；逐步执行按钮是游戏机制 |
| 百炼炉 | Checks / Passed / Failed / Cancelled | 检查及通过/失败/取消；当前界面 Passed/Failed 是教学状态，真实界面可能显示 Success 等结论；取消不是通过 |
| 百炼炉 | Changelog / Merge / Release / Tag / Delete branch | 变更说明、整合、发行、版本标记、删除来源分支；删分支不删除已合并历史 |
| 百炼炉 | Squash and merge / Rebase and merge / Artifact / Pages | 压缩/重放提交、运行产物、静态站点托管；在场景宝典说明，不冒充已操作 |
| 村口路标 | README / Release asset / Code → Clone / Download ZIP / Fork | 说明、发布附件、源码克隆、文件快照、账号副本；安装包不是 Git 仓库 |
| 护身堂 | Sign in / Sign up / 2FA / Passkey / Recovery codes | 官方登录/注册、第二重验证、通行密钥、恢复代码；仅类型卡片，无秘密输入框 |
| 飞鸽分拣局 | Star / Follow / Watch / Custom / All activity / Notifications | 收藏项目、关注人、仓库订阅、自定义/全部活动、通知；全部为模拟偏好，真实 Star 不参与解锁 |
| 藏经院 | README / CONTRIBUTING / LICENSE / CODE_OF_CONDUCT / SECURITY | 入门、贡献步骤、授权、行为规范、漏洞报告渠道；书架归位后再安全投递 |
| 藏经院 | Maintainer / Contributor / Collaborator / templates / Discussions / Wiki / Projects | 维护者、贡献者、授权协作者；模板组织信息，讨论/文档/工作管理各有边界 |

## 非模板式修订与来源

- Issue 的误区是“建条目不等于改代码”，而不是泛泛的“注意权限”。[创建 Issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue)
- 暂存的关键是**当时快照**；编辑后保持旧暂存内容，并有回归测试。[git add](https://git-scm.com/docs/git-add)
- Fetch 只更新跟踪记录；本关要求先 Fetch 是为了观察变化，不声称真实 Pull 必须另跑一次 Fetch。[git fetch](https://git-scm.com/docs/git-fetch)、[git pull](https://git-scm.com/docs/git-pull)
- PR 明确解释为“合并变更提案”；Base/Head 相反会被拒绝，不给“选对即提交成功”的空反馈。[PR 概念](https://docs.github.com/en/pull-requests/reference/pull-requests)
- Review 需要追加 Commit/Push 后才能处理讨论；作者不能给自己 Approve。[审阅说明](https://docs.github.com/en/pull-requests/reference/pull-request-reviews)
- 检查状态绑定当前模拟提交，失败需读日志、修复再跑。Checks Passed 后允许 Merge 是本关规则，不是 GitHub 所有仓库默认要求。[Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)
- Release 是发行记录，Tag 标记版本位置。[Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- 真实路线中 Fork、Clone 和文件下载区别另有官方依据。[下载文件](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-files-from-github)
- Star 与 Follow 的目的分开说明。[Star](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars)、[Follow](https://docs.github.com/en/get-started/exploring-projects-on-github/following-people)

## 诚实的范围边界

六章是限定情境的操作游戏，不是任意 Git 命令解释器：README 修复有明确目标文本；标题/说明只检查约束，不宣称语义理解。冲突练习单独保存双方意图，不改主线 PR 文件。百炼炉检查读取的是发布草稿；真实代码修复需要新 Commit/Push。学生可通过已解释的步骤操作，不需猜隐藏答案。

区域回访补充导览、安全、关注与治理，但第 0—4 章完整安装路径仍由 README / 第零章指南负责，尚未把每种操作系统安装过程都做成独立动画游戏。旧课程与 P0 结业题保留，结构覆盖率不自动转成新小游戏掌握率。

## 维护规则

修改英文 UI 时一起更新场景说明、词典引用、本表与操作测试。修改 Git 行为时增加状态机单元测试，不只改 UI 判断。官方来源的在线校验包括重定向后的官方域名。禁止把“链接能访问”写成“用户操作已验证”。
