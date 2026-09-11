import type { VocabularyItem } from "@/content/schemas/vocabulary";
const git = "https://git-scm.com/docs/";
const pr = "https://docs.github.com/en/pull-requests/reference/pull-requests";
const reviews = "https://docs.github.com/en/pull-requests/reference/pull-request-reviews";
const actions = "https://docs.github.com/en/actions/get-started/understand-github-actions";
const issues = "https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue";
const releases = "https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases";
// Individually authored operation guidance and misconceptions, not a template sentence.
const rows: Array<[string, string, string, string, number]> = [
  ["issue","先查重，再写标题、复现步骤、实际与期望结果；提交后跟进讨论。","新建 Issue 不会改动代码，也不代表已经开始修复。",issues,7],
  ["open","查看仍然开放的议题，确认维护者是否还在处理。","Open 是状态，不是每条议题都有可领取任务。",issues,7],
  ["closed","查看关闭原因和关联 PR，判断是解决、重复还是不计划处理。","Closed 不必然意味着修复已发布。",issues,7],
  ["label","按仓库已有分类建议 bug 等标签；没有权限时请维护者处理。","标签名称可自定义，普通访客不一定能自行设置。",issues,7],
  ["assignee","查看负责人后协调工作，避免多人同时做重复修改。","被分配不等于拥有写权限，也不等于已经完成。",issues,7],
  ["milestone","将有关议题归入一个阶段目标，观察开放与关闭工作。","里程碑不是分支，也不自动发布版本。",issues,7],
  ["good-first-issue","寻找维护者认为适合入门的工作，并先阅读贡献说明。","这个标签不保证问题简单，也不意味着可以绕过沟通。",issues,7],
  ["local-repository","在自己的电脑查看工作区和提交历史，先分清未提交修改。","本地文件存在不代表 GitHub 已收到提交。",git+"gitglossary",8],
  ["remote-repository","检查远端地址和所指仓库，再进行取回或推送。","远端是另一个仓库，不是本地文件夹的别名。",git+"gitglossary",8],
  ["origin","用 git remote -v 确认 origin 是否指向自己的 Fork。","origin 是常用别名，不保证永远是自己的仓库。",git+"git-remote",8],
  ["upstream","添加或核对上游地址后，从 upstream 取得原项目更新。","upstream 名称本身不会赋予上游写权限。",git+"git-remote",8],
  ["fetch","取回远端记录后比较历史，再决定怎样整合。","Fetch 不自动把当前工作分支合并到新版本。",git+"git-fetch",8],
  ["pull","确认当前分支和工作区，再获取并整合远端变化。","Pull 可能需要合并或变基策略，不是所有情况都能自动无冲突。",git+"git-pull",8],
  ["push","确认 origin URL 与来源分支，将本地 Commit 发送过去。","Push 不上传未提交修改；拒绝推送时不要盲目加 force。",git+"git-push",9],
  ["sync-fork","在自己 Fork 页面同步上游，再单独更新本地仓库。","网页同步不会自动更新电脑的工作区。","https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork",8],
  ["branch","从 main 创建修复线路，切换后再编辑 README。","Branch 不是 Fork：它仍属于同一仓库的历史。",git+"git-branch",9],
  ["main","修改前确认 main 的作用，本练习从它创建修复分支。","默认分支可能不叫 main，不能忽略项目实际设置。",git+"git-branch",9],
  ["working-directory","编辑文件后查看状态；不要把私密便条混进练习。","工作区修改不是已保存到 Git 历史的快照。",git+"gitglossary",9],
  ["changes","逐个检查改动文件，区分本次修复和无关改动。","文件有 Changes 不代表已经 Stage。",git+"git-status",9],
  ["diff","对照新增与删除，确认只改变南门文字，保留标题和路线。","只看文件名不足以确认修改安全。",git+"git-diff",9],
  ["stage","把 README 当时的内容放进暂存区，再决定 Commit。","暂存后继续编辑不会自动更新暂存快照。",git+"git-add",9],
  ["commit","为暂存内容写意图明确的说明，保存为本地提交快照。","Commit 不等于 Push，也不是 Pull Request。",git+"git-commit",9],
  ["commit-message","写出修改目的，例如修复南门标签，帮助后来者理解历史。","只写 update 难以说明意图；不应写入凭据。",git+"git-commit",9],
  ["sha","在历史中用提交标识定位要讨论或比较的版本。","游戏的 c1/c2 是教学简写，不是真实 SHA。",git+"gitglossary",9],
  ["pull-request","推送修复后，提出从来源分支合入目标分支的变更提案。","Pull Request 不是 git pull，创建后也没有自动合并。",pr,10],
  ["base-branch","在比较页面选接收变更的 main，确认仓库 Owner。","Base 选反会提出与预期相反的合并方向。",pr,10],
  ["compare-branch","选择含修复提交的来源分支，与目标进行比较。","Compare branch 不是接收方的默认分支。",pr,10],
  ["new-pull-request","打开比较入口，先核对 base/head，再填写提案。","点击入口不等于 PR 已创建，更不是已合并。",pr,10],
  ["draft","尚未准备审阅时保留草稿，完成后标 Ready for review。","Draft 状态不是 Review 通过。",pr,10],
  ["files-changed","在 PR 中逐文件检查差异，确认练习只修改预定文件。","文件数量少也可能包含敏感内容，仍需逐行检查。",pr,10],
  ["conversation","阅读 PR 的说明、讨论和状态，再回应相关问题。","讨论区不等于提交历史列表。",pr,10],
  ["commits-tab","查看 PR 包含哪些提交，定位修订发生在哪个快照。","提交数量不直接证明质量，也不代表 Checks Passed。",pr,10],
  ["review","检查具体变更并给出评论、批准或修改请求。","Review 是审查过程，不是 Merge 的同义词。",reviews,11],
  ["comment","针对某一处改动写清问题或说明，引用足够上下文。","普通 Comment 不等于 Approve 或 Request changes。",reviews,11],
  ["approve","由有资格的审阅者确认变更可接受；仍检查合并条件。","自己不能批准自己的 PR；批准也不自动合并。",reviews,11],
  ["request-changes","读清审阅者要求，在来源分支修改并推送新的提交。","不能只把讨论关闭就当作意见处理完成。",reviews,11],
  ["resolve-conversation","确认对应问题已有修改或说明，再标记讨论已处理。","Resolve 不会替你改文件，也不会让失败检查变绿。",reviews,11],
  ["merge-conflict","比较两边意图，编辑组合结果并移除冲突标记。","盲目保留 ours 或 theirs 可能丢失另一方有效修改。",git+"git-merge",11],
  ["actions","进入自动化运行列表，找到与本次提交相关的执行。","Actions 不是保证所有仓库都设置 CI 的开关。",actions,12],
  ["workflow","阅读触发条件与工作定义，知道为什么会执行检查。","Workflow 是定义，不是一次具体的执行结果。",actions,12],
  ["workflow-run","按提交和时间找到那一次运行，再看 Job 和日志。","旧提交运行成功，不证明新提交也通过。",actions,12],
  ["job","在运行中检查失败的工作单元，再进入其中的 Step。","不同 Job 可有依赖或并行关系，不总是顺序执行。",actions,12],
  ["step","查看一个执行步骤的输出，定位具体失败原因。","有些步骤通过不等于整个 Workflow 成功。",actions,12],
  ["checks","确认最新提交的检查结果，再结合 Review 判断是否适合合并。","Passed 是检查通过，不证明软件没有任何缺陷。",actions,12],
  ["passed","查看通过的是哪次运行、哪个提交与哪些检查。","不要把旧提交的绿色状态当成当前提交的证明。",actions,12],
  ["failed","打开失败日志，修复对应问题后重新运行。","删除或隐藏失败记录不会修复代码。",actions,12],
  ["merge","条件满足时由有权限的人把来源变化整合进目标。","不能因为自己看到了按钮就假定拥有维护权限。",pr,12],
  ["release","选定版本标签，编写发行说明和需要的附件。","Release 不会自动包含所有构建产物。",releases,12],
  ["tag","给需要发布的版本位置一个稳定名称，核对所指提交。","Tag 不是会随新提交前进的工作分支。",releases,12],
  ["changelog","写出本版本对使用者有意义的新增、修复和不兼容变化。","变更日志不是逐条复制无意义的 Commit message。",releases,12],
  ["artifact","从对应运行下载测试报告或构建产物，留意保存期限。","Artifact 不等于已正式发布的 Release。","https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts",12],
  ["github-pages","发布静态项目说明或前端演示，核对仓库 Pages 设置。","Pages 不运行任意服务端数据库应用。","https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages",12],
];
const guidance = new Map(rows.map(row => [row[0], row]));
export function reviewContributionTerm(term: VocabularyItem): VocabularyItem {
  const row = guidance.get(term.id); if (!row) return term;
  return { ...term, officialMeaningSummary: term.beginnerMeaning, whenYouSeeIt: `第 ${row[4]} 章的操作台与 GitHub 对应协作流程。`, howToUseIt: row[1], currentStoryExample: row[1], commonMistakes: [row[2]], sourceTitle: row[3].includes("git-scm.com") ? "Git 官方命令参考" : "GitHub Docs 官方说明", sourceUrl: row[3], screenLocations: [...new Set([...term.screenLocations, `江湖历练第 ${row[4]} 章`])], lastVerifiedAt: "2026-09-11" };
}
export const contributionGuidanceIds = rows.map(row => row[0]);
