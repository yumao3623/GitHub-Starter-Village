import type {
  TermPriority,
  VocabularyItem,
  VocabularyKind,
} from "@/content/schemas/vocabulary";
import { officialSources, type OfficialSourceKey } from "@/content/sources/official";
import { reviewContributionTerm } from "./contribution-review";

type TermSeed = {
  id: string;
  english: string;
  chinese: string;
  meaning: string;
  use: string;
  kind: VocabularyKind;
  priority: TermPriority;
  lessons: string[];
  source?: OfficialSourceKey;
  confused?: string[];
  location?: string[];
  literal?: string;
};

const verifiedAt = "2026-09-10";

function makeTerm(seed: TermSeed): VocabularyItem {
  const source = officialSources[seed.source ?? "glossary"];
  return {
    id: seed.id,
    english: seed.english,
    chinese: seed.chinese,
    literalTranslation: seed.literal ?? seed.chinese,
    beginnerMeaning: seed.meaning,
    officialMeaningSummary: `${seed.english} 在官方语境中用于${seed.use}，具体权限和显示位置可能随仓库设置变化。`,
    purpose: seed.use,
    whenYouSeeIt: `当你进行“${seed.lessons.join("、")}”相关任务时，会在 GitHub 页面、GitHub Desktop 或终端中看到它。`,
    howToUseIt: `先确认当前仓库、分支和权限，再按任务目标使用 ${seed.english}，不要把游戏中的按钮当成 GitHub 已完成验证。`,
    currentStoryExample: `在 nightwalk-map 剧情中，你会用 ${seed.english} 完成一次安全练习。`,
    commonMistakes: [
      `只背“${seed.chinese}”的字面翻译，没有判断它在当前页面的实际作用。`,
      `没有确认对象和权限就直接操作 ${seed.english}。`,
    ],
    confusedWith: seed.confused ?? [],
    kind: seed.kind,
    priority: seed.priority,
    relatedLessonIds: seed.lessons,
    screenLocations: seed.location ?? ["GitHub 仓库页面"],
    sourceTitle: source.title,
    sourceUrl: source.url,
    lastVerifiedAt: verifiedAt,
    uiMayChange: ["navigation", "action", "status", "permission", "security"].includes(seed.kind),
  };
}

const seeds: TermSeed[] = [
  { id: "repository", english: "Repository", chinese: "仓库", meaning: "保存项目文件、版本历史与协作记录的项目空间。", use: "集中保存代码、文档、历史和协作信息", kind: "concept", priority: "P0", lessons: ["chapter-0", "chapter-4"], source: "repository", confused: ["directory"] },
  { id: "readme", english: "README", chinese: "项目说明", meaning: "仓库的入口说明书，通常告诉你项目用途、安装方法和规则。", use: "帮助访客快速理解和使用项目", kind: "file", priority: "P0", lessons: ["chapter-0", "chapter-4", "chapter-5"], source: "community", confused: ["documentation"] },
  { id: "sign-up", english: "Sign up", chinese: "注册", meaning: "创建一个新的 GitHub 账号，不是登录已有账号。", use: "创建个人 GitHub 账号", kind: "action", priority: "P0", lessons: ["chapter-1"], source: "account", confused: ["sign-in"], location: ["GitHub 首页右上角"] },
  { id: "sign-in", english: "Sign in", chinese: "登录", meaning: "使用已有账号进入 GitHub，项目不会代替 GitHub 接收凭据。", use: "进入已有 GitHub 账号", kind: "action", priority: "P0", lessons: ["chapter-1"], source: "account", confused: ["sign-up"], location: ["GitHub 官方登录页"] },
  { id: "fork", english: "Fork", chinese: "派生副本", literal: "分叉", meaning: "在自己的 GitHub 账号下创建与原仓库有关联的仓库副本。", use: "在不影响原项目的前提下独立修改并可提出贡献", kind: "action", priority: "P0", lessons: ["chapter-0", "chapter-2", "chapter-6"], source: "repository", confused: ["clone", "download-zip"] },
  { id: "clone", english: "Clone", chinese: "克隆", meaning: "把包含版本历史和远程关系的完整仓库复制到本地。", use: "建立可提交、拉取和推送的本地仓库", kind: "git-command", priority: "P0", lessons: ["chapter-2", "chapter-8"], source: "repository", confused: ["fork", "download-zip"] },
  { id: "branch", english: "Branch", chinese: "分支", meaning: "同一仓库中的独立开发线路，可安全修改后再合并。", use: "隔离一组修改，避免直接影响主线", kind: "concept", priority: "P0", lessons: ["chapter-4", "chapter-9", "capstone"], source: "glossary", confused: ["fork"] },
  { id: "commit", english: "Commit", chinese: "提交记录", meaning: "为一组已暂存修改保存带说明的版本快照。", use: "记录修改内容、作者、时间和唯一标识", kind: "git-command", priority: "P0", lessons: ["chapter-9", "capstone"], source: "git", confused: ["push", "pull-request"] },
  { id: "push", english: "Push", chinese: "推送", meaning: "把本地已经提交的变更发送到远程仓库。", use: "让 GitHub 上的远程分支获得本地提交", kind: "git-command", priority: "P0", lessons: ["chapter-8", "chapter-9", "capstone"], source: "gitGlossary", confused: ["commit", "pull"] },
  { id: "pull", english: "Pull", chinese: "拉取并整合", meaning: "先获取远程变化，再把它整合进当前本地分支。", use: "更新当前本地分支", kind: "git-command", priority: "P0", lessons: ["chapter-8"], source: "gitGlossary", confused: ["fetch", "pull-request"] },
  { id: "pull-request", english: "Pull Request", chinese: "合并变更提案", literal: "拉取请求", meaning: "完成一组修改后，邀请他人检查、讨论并决定是否合并。", use: "提出、讨论和审查一组仓库变更", kind: "concept", priority: "P0", lessons: ["chapter-10", "capstone"], source: "glossary", confused: ["pull", "issue"] },
  { id: "issue", english: "Issue", chinese: "议题", meaning: "用于记录缺陷、想法、任务或讨论的协作条目，不等于代码修改。", use: "跟踪工作、问题和讨论", kind: "concept", priority: "P0", lessons: ["chapter-7"], source: "issues", confused: ["pull-request"] },
  { id: "diff", english: "Diff", chinese: "差异", meaning: "逐行显示修改前后有哪些新增、删除或替换。", use: "在提交或审查前检查实际改动", kind: "concept", priority: "P0", lessons: ["chapter-9", "chapter-10"], source: "git", confused: ["changes"] },
  { id: "stage", english: "Stage", chinese: "暂存", meaning: "选择哪些修改要进入下一次 Commit，而不是永久保存。", use: "精确组织下一次提交包含的修改", kind: "git-command", priority: "P0", lessons: ["chapter-9"], source: "git", confused: ["commit"] },
  { id: "merge", english: "Merge", chinese: "合并", meaning: "把一个分支中的变更整合到另一个分支。", use: "让经过审查的修改进入目标分支", kind: "action", priority: "P0", lessons: ["chapter-11", "capstone"], source: "glossary", confused: ["rebase"] },
  { id: "review", english: "Review", chinese: "审查", meaning: "检查 Pull Request 的变更并给出评论、批准或修改要求。", use: "在合并前发现问题并形成协作结论", kind: "action", priority: "P0", lessons: ["chapter-11"], source: "reviews", confused: ["comment"] },
  { id: "approve", english: "Approve", chinese: "批准", meaning: "审查者表示这组修改在自己看来已经适合合并。", use: "记录正向审查结论", kind: "status", priority: "P0", lessons: ["chapter-11"], source: "reviews", confused: ["comment", "merge"] },
  { id: "request-changes", english: "Request changes", chinese: "请求修改", meaning: "审查者指出合并前仍需处理的问题，是否阻止合并取决于规则。", use: "明确要求作者继续修改", kind: "status", priority: "P0", lessons: ["chapter-11"], source: "reviews", confused: ["comment"] },
  { id: "actions", english: "Actions", chinese: "自动化", meaning: "GitHub 用来自动构建、测试和执行工作流程的功能入口。", use: "让仓库事件自动触发预先定义的任务", kind: "navigation", priority: "P0", lessons: ["chapter-12"], source: "actions", confused: ["checks"] },
  { id: "workflow", english: "Workflow", chinese: "工作流", meaning: "由 YAML 文件定义、被事件触发的一组自动化任务。", use: "组织一个或多个自动化 Job", kind: "concept", priority: "P0", lessons: ["chapter-12"], source: "actions", confused: ["job"] },
  { id: "checks", english: "Checks", chinese: "检查结果", meaning: "提交或 Pull Request 上显示的自动检查状态与结果。", use: "判断测试、构建等是否通过", kind: "status", priority: "P0", lessons: ["chapter-10", "chapter-12"], source: "actions", confused: ["actions"] },
  { id: "license", english: "License", chinese: "开源许可证", meaning: "说明他人可以怎样使用、修改和分发项目的法律文件。", use: "明确项目代码的授权范围和条件", kind: "file", priority: "P0", lessons: ["chapter-4", "chapter-5", "chapter-13"], source: "community", confused: ["code-of-conduct"] },
  { id: "local-repository", english: "Local repository", chinese: "本地仓库", meaning: "位于自己电脑上的 Git 仓库，可离线修改和提交。", use: "在电脑上保存工作区和完整版本信息", kind: "concept", priority: "P0", lessons: ["chapter-8"], source: "remote", confused: ["remote-repository"] },
  { id: "remote-repository", english: "Remote repository", chinese: "远程仓库", meaning: "位于 GitHub 等远端位置、可与本地同步的仓库。", use: "共享提交并与他人协作", kind: "concept", priority: "P0", lessons: ["chapter-8"], source: "remote", confused: ["local-repository"] },
  { id: "main", english: "main", chinese: "默认主分支", meaning: "许多仓库用作默认开发基线的分支名称，但仓库可改成别的名称。", use: "作为新分支和合并的常用基线", kind: "concept", priority: "P0", lessons: ["chapter-4", "chapter-9", "capstone"], source: "glossary", confused: ["default-branch"] },

  { id: "code-tab", english: "Code tab", chinese: "代码与文件页签", meaning: "仓库中查看文件树、README 和提交入口的导航页签。", use: "浏览仓库代码与文件", kind: "navigation", priority: "P1", lessons: ["chapter-0", "chapter-4"], source: "repository", confused: ["code-menu"] },
  { id: "code-menu", english: "Code button", chinese: "复制与下载菜单", meaning: "绿色 Code 按钮打开 Clone、Codespaces 和 Download ZIP 等入口。", use: "选择获取仓库的方式", kind: "action", priority: "P1", lessons: ["chapter-0", "chapter-2"], source: "repository", confused: ["code-tab"] },
  { id: "public", english: "Public", chinese: "公开", meaning: "任何人通常都能查看的仓库可见性，不代表可随意获得写权限。", use: "标识仓库的公开可见性", kind: "permission", priority: "P1", lessons: ["chapter-0", "chapter-4"], source: "repository", confused: ["private"] },
  { id: "private", english: "Private", chinese: "私有", meaning: "只有被授权的人才能访问的仓库可见性。", use: "限制仓库内容的访问范围", kind: "permission", priority: "P1", lessons: ["chapter-4"], source: "repository", confused: ["public"] },
  { id: "star", english: "Star", chinese: "收藏", meaning: "给仓库加星以便以后找到，也可表达关注，但不是下载或复制。", use: "保存感兴趣的仓库", kind: "action", priority: "P1", lessons: ["chapter-0", "chapter-6"], source: "glossary", confused: ["watch", "fork"] },
  { id: "watch", english: "Watch", chinese: "订阅仓库通知", meaning: "按选择的活动类型接收仓库通知，不等于收藏。", use: "控制对仓库活动的通知订阅", kind: "action", priority: "P1", lessons: ["chapter-6"], source: "account", confused: ["star", "follow"] },
  { id: "follow", english: "Follow", chinese: "关注用户", meaning: "关注另一个用户的公开活动，不是订阅某个仓库。", use: "在个人动态中关注用户活动", kind: "action", priority: "P1", lessons: ["chapter-6"], source: "glossary", confused: ["watch"] },
  { id: "notifications", english: "Notifications", chinese: "通知", meaning: "汇总你订阅、参与或被提及的 GitHub 活动更新。", use: "查看并管理相关活动提醒", kind: "navigation", priority: "P1", lessons: ["chapter-6", "chapter-7"], source: "account", confused: ["watch"] },
  { id: "download-zip", english: "Download ZIP", chinese: "下载压缩包", meaning: "下载当前文件快照，没有正常 Git 历史和远程同步关系。", use: "快速查看当前文件但不进行完整 Git 学习", kind: "action", priority: "P1", lessons: ["chapter-2"], source: "repository", confused: ["clone", "fork"] },
  { id: "codespaces", english: "Codespaces", chinese: "云端开发环境", meaning: "在云端容器中提供浏览器编辑器、终端与端口转发的开发环境。", use: "无需本地完整配置即可运行项目", kind: "concept", priority: "P1", lessons: ["chapter-2"], source: "codespaces", confused: ["clone"] },
  { id: "two-factor-authentication", english: "Two-factor authentication (2FA)", chinese: "双重身份验证", meaning: "在密码之外增加另一种验证因素以保护账号。", use: "降低仅凭密码被盗导致的账号风险", kind: "security", priority: "P1", lessons: ["chapter-1"], source: "security", confused: ["passkey"] },
  { id: "passkey", english: "Passkey", chinese: "通行密钥", meaning: "使用设备或密码管理器安全登录，可同时满足密码和 2FA 要求。", use: "提供抗钓鱼、便捷的账号登录方式", kind: "security", priority: "P1", lessons: ["chapter-1"], source: "security", confused: ["ssh-key"] },
  { id: "recovery-codes", english: "Recovery codes", chinese: "恢复代码", meaning: "无法使用 2FA 设备时用于恢复登录的一次性代码，必须安全保存。", use: "在失去主要验证方式时恢复账号访问", kind: "security", priority: "P1", lessons: ["chapter-1"], source: "recovery", confused: ["password"] },
  { id: "username", english: "Username", chinese: "用户名", meaning: "GitHub 上唯一标识个人账号的名称，会出现在个人页和仓库路径。", use: "识别账号和构成个人仓库地址", kind: "concept", priority: "P1", lessons: ["chapter-1"], source: "account" },
  { id: "profile", english: "Profile", chinese: "个人主页", meaning: "展示个人资料、贡献和公开仓库的页面。", use: "呈现账号身份和公开活动", kind: "navigation", priority: "P1", lessons: ["chapter-1"], source: "account" },
  { id: "settings", english: "Settings", chinese: "设置", meaning: "管理账号、仓库、安全或通知配置的入口，具体范围取决于当前页面。", use: "调整账号与仓库配置", kind: "navigation", priority: "P1", lessons: ["chapter-1", "chapter-4"], source: "account" },
  { id: "owner", english: "Owner", chinese: "所有者", meaning: "拥有仓库的个人账号或组织，出现在仓库路径最前面。", use: "判断仓库归属和地址", kind: "permission", priority: "P1", lessons: ["chapter-4"], source: "repository", confused: ["maintainer"] },
  { id: "contributors", english: "Contributors", chinese: "贡献者", meaning: "对仓库历史产生过被计入贡献的人员列表。", use: "了解项目的贡献参与情况", kind: "community", priority: "P1", lessons: ["chapter-4", "chapter-13"], source: "glossary", confused: ["collaborator"] },
  { id: "releases", english: "Releases", chinese: "发行版本", meaning: "围绕标签打包的软件版本，可包含说明和下载文件。", use: "向使用者发布可识别的软件版本", kind: "navigation", priority: "P1", lessons: ["chapter-4", "chapter-5", "chapter-12"], source: "releases", confused: ["tag"] },
  { id: "tag", english: "Tag", chinese: "标签版本标记", meaning: "指向某个特定 Git 提交的命名标记，Release 常基于 Tag。", use: "稳定标记一个历史位置或版本", kind: "concept", priority: "P1", lessons: ["chapter-4", "chapter-12"], source: "releases", confused: ["release", "label"] },
  { id: "search", english: "Search", chinese: "搜索", meaning: "查找仓库、代码、Issue、用户等 GitHub 内容的入口。", use: "发现项目和定位信息", kind: "navigation", priority: "P1", lessons: ["chapter-5"], source: "account" },
  { id: "archived", english: "Archived", chinese: "已归档", meaning: "仓库处于只读归档状态，通常表示不再积极开发。", use: "提醒用户项目维护状态发生变化", kind: "status", priority: "P1", lessons: ["chapter-5"], source: "repository" },
  { id: "open", english: "Open", chinese: "进行中", meaning: "Issue 或 Pull Request 尚未关闭或合并的状态。", use: "标识协作事项仍在处理", kind: "status", priority: "P1", lessons: ["chapter-7", "chapter-10"], source: "issues", confused: ["closed"] },
  { id: "closed", english: "Closed", chinese: "已关闭", meaning: "Issue 或 Pull Request 已结束处理，但不一定表示代码已合并。", use: "标识协作事项已经结束", kind: "status", priority: "P1", lessons: ["chapter-7", "chapter-10"], source: "issues", confused: ["merged"] },
  { id: "label", english: "Label", chinese: "分类标签", meaning: "用于给 Issue、PR 或 Discussion 分类和筛选的彩色文字标记。", use: "表示类型、优先级或处理状态", kind: "concept", priority: "P1", lessons: ["chapter-7"], source: "issues", confused: ["tag"] },
  { id: "assignee", english: "Assignee", chinese: "负责人", meaning: "被指定负责跟进某个 Issue 或 Pull Request 的人。", use: "明确谁在处理当前事项", kind: "permission", priority: "P1", lessons: ["chapter-7"], source: "issues" },
  { id: "comment", english: "Comment", chinese: "评论", meaning: "在 Issue、PR 或代码行下发表的讨论内容，不自动代表批准。", use: "提问、解释和反馈", kind: "action", priority: "P1", lessons: ["chapter-7", "chapter-11"], source: "reviews", confused: ["review", "approve"] },
  { id: "origin", english: "origin", chinese: "默认远程名", meaning: "Clone 时 Git 通常为来源远程仓库设置的简称，不是固定网站名。", use: "在 Git 命令中简短引用默认远程", kind: "concept", priority: "P1", lessons: ["chapter-8"], source: "remote", confused: ["upstream"] },
  { id: "upstream", english: "upstream", chinese: "上游", meaning: "Fork 语境中通常指原始仓库，命令行里也可作为自定义远程名。", use: "获取原项目的新变化并同步 Fork", kind: "concept", priority: "P1", lessons: ["chapter-8"], source: "glossary", confused: ["origin"] },
  { id: "fetch", english: "Fetch", chinese: "获取", meaning: "从远程下载新的提交和引用，但不自动整合进当前分支。", use: "先查看远程变化再决定如何整合", kind: "git-command", priority: "P1", lessons: ["chapter-8"], source: "gitGlossary", confused: ["pull"] },
  { id: "working-directory", english: "Working directory", chinese: "工作目录", meaning: "当前检出文件所在的目录，你直接编辑的文件位于这里。", use: "承载尚未提交的文件修改", kind: "concept", priority: "P1", lessons: ["chapter-8", "chapter-9"], source: "gitGlossary", confused: ["stage"] },
  { id: "sha", english: "SHA", chinese: "提交标识", meaning: "用于唯一识别某次 Commit 的哈希值，界面常显示缩写。", use: "准确定位某个提交版本", kind: "concept", priority: "P1", lessons: ["chapter-9"], source: "glossary", confused: ["tag"] },
  { id: "draft", english: "Draft", chinese: "草稿", meaning: "表示 Pull Request 暂未准备好接受正式审查或合并。", use: "提前共享尚未完成的变更", kind: "status", priority: "P1", lessons: ["chapter-10"], source: "glossary", confused: ["ready-for-review"] },
  { id: "files-changed", english: "Files changed", chinese: "已更改文件", meaning: "Pull Request 中集中查看所有文件差异的页签。", use: "逐文件审查本次提案的实际修改", kind: "navigation", priority: "P1", lessons: ["chapter-10", "chapter-11", "capstone"], source: "reviews", confused: ["commits-tab"] },
  { id: "merge-conflict", english: "Merge conflict", chinese: "合并冲突", meaning: "两组变更无法被 Git 自动安全整合，需要人判断保留哪种结果。", use: "阻止不确定的自动合并并要求人工解决", kind: "status", priority: "P1", lessons: ["chapter-11"], source: "git", confused: ["failed-check"] },
  { id: "job", english: "Job", chinese: "作业", meaning: "Workflow 中在指定运行环境执行的一组 Step。", use: "组织可并行或有依赖关系的自动化任务", kind: "concept", priority: "P1", lessons: ["chapter-12"], source: "actions", confused: ["step"] },
  { id: "step", english: "Step", chinese: "步骤", meaning: "Job 内按顺序执行的一项命令或 Action。", use: "组成自动化作业的最小展示步骤", kind: "concept", priority: "P1", lessons: ["chapter-12"], source: "actions", confused: ["job"] },
  { id: "passed", english: "Passed", chinese: "已通过", meaning: "某项自动检查成功完成，但不保证整个改动绝对正确。", use: "表示检查得到成功结果", kind: "status", priority: "P1", lessons: ["chapter-12"], source: "actions", confused: ["approved"] },
  { id: "failed", english: "Failed", chinese: "失败", meaning: "某项自动检查没有成功，需要查看日志定位原因。", use: "提示自动化任务需要处理", kind: "status", priority: "P1", lessons: ["chapter-12"], source: "actions", confused: ["merge-conflict"] },
  { id: "contributing", english: "CONTRIBUTING", chinese: "贡献指南", meaning: "告诉贡献者如何报告问题、修改代码和提交贡献的文件。", use: "统一贡献流程和质量预期", kind: "file", priority: "P1", lessons: ["chapter-5", "chapter-13"], source: "community" },
  { id: "code-of-conduct", english: "CODE_OF_CONDUCT", chinese: "行为准则", meaning: "说明社区互动标准以及不当行为处理方式的文件。", use: "建立安全、尊重的协作环境", kind: "file", priority: "P1", lessons: ["chapter-13"], source: "community" },
  { id: "security-policy", english: "SECURITY", chinese: "安全政策", meaning: "说明应如何私下报告安全漏洞以及支持范围的文件。", use: "避免公开泄露未修复漏洞细节", kind: "file", priority: "P1", lessons: ["chapter-13"], source: "community" },
  { id: "nodejs", english: "Node.js", chinese: "JavaScript 运行环境", meaning: "让项目中的开发工具和服务端 JavaScript 能在电脑上运行。", use: "提供运行 Next.js 和 npm 工具所需环境", kind: "concept", priority: "P1", lessons: ["chapter-3"], source: "node", confused: ["npm"] },
  { id: "npm-install", english: "npm install", chinese: "安装项目依赖", meaning: "读取 package.json 和锁文件，把项目需要的软件包安装到本地。", use: "准备运行项目所需依赖", kind: "git-command", priority: "P1", lessons: ["chapter-3"], source: "npmInstall", confused: ["npm-run-dev"] },
  { id: "npm-run-dev", english: "npm run dev", chinese: "启动开发服务器", meaning: "执行 package.json 中名为 dev 的脚本，启动本地开发环境。", use: "在本机启动可访问的游戏网站", kind: "git-command", priority: "P1", lessons: ["chapter-3"], source: "npmRun", confused: ["npm-install"] },
  { id: "localhost", english: "localhost", chinese: "本机地址", meaning: "指向当前电脑自身的网络主机名，只在本机或端口转发范围内访问。", use: "在浏览器打开本地开发服务器", kind: "concept", priority: "P1", lessons: ["chapter-3"], source: "node" },
  { id: "installation", english: "Installation", chinese: "安装说明", meaning: "README 或文档中说明如何把项目依赖和运行环境准备好的章节。", use: "帮助使用者完成项目安装", kind: "navigation", priority: "P1", lessons: ["chapter-5"], source: "community" },
  { id: "requirements", english: "Requirements", chinese: "环境要求", meaning: "运行项目前必须具备的软件版本、系统或其他条件。", use: "提前确认项目能否在当前环境运行", kind: "navigation", priority: "P1", lessons: ["chapter-5"], source: "community" },
  { id: "changes", english: "Changes", chinese: "修改", meaning: "GitHub Desktop 中显示尚未提交文件变化的区域。", use: "查看和选择本地工作目录中的变化", kind: "navigation", priority: "P1", lessons: ["chapter-9"], source: "desktop", confused: ["diff"] },
  { id: "commit-message", english: "Commit message", chinese: "提交说明", meaning: "概括本次提交为什么修改、修改了什么的简短文字。", use: "让版本历史可读且便于追踪", kind: "concept", priority: "P1", lessons: ["chapter-9"], source: "glossary" },
  { id: "new-pull-request", english: "New pull request", chinese: "新建合并提案", meaning: "开始选择 Base 与 Compare 并创建 Pull Request 的入口。", use: "发起一份新的变更合并提案", kind: "action", priority: "P1", lessons: ["chapter-10"], source: "glossary" },
  { id: "base-branch", english: "Base branch", chinese: "目标分支", meaning: "Pull Request 准备接收变更的分支。", use: "指定变更最终要合入哪里", kind: "concept", priority: "P1", lessons: ["chapter-10"], source: "glossary", confused: ["compare-branch"] },
  { id: "compare-branch", english: "Compare branch", chinese: "来源分支", meaning: "Pull Request 中提供待合入变更的分支。", use: "指定这次提案的变更来自哪里", kind: "concept", priority: "P1", lessons: ["chapter-10"], source: "glossary", confused: ["base-branch"] },
  { id: "conversation", english: "Conversation", chinese: "对话", meaning: "Pull Request 中集中显示描述、评论、审查与事件的页签。", use: "跟踪变更提案的讨论与状态", kind: "navigation", priority: "P1", lessons: ["chapter-10"], source: "reviews" },
  { id: "commits-tab", english: "Commits", chinese: "提交列表", meaning: "Pull Request 中列出本次提案包含哪些 Commit 的页签。", use: "检查提案包含的提交历史", kind: "navigation", priority: "P1", lessons: ["chapter-10"], source: "glossary" },
  { id: "workflow-run", english: "Workflow run", chinese: "工作流运行记录", meaning: "某个 Workflow 被一次事件触发后产生的具体执行实例。", use: "查看本次自动化的状态、作业和日志", kind: "concept", priority: "P1", lessons: ["chapter-12"], source: "actions", confused: ["workflow"] },
  { id: "release", english: "Release", chinese: "发行版", meaning: "基于某个 Tag 发布的软件版本，可带发布说明和附件。", use: "向用户交付一个明确的软件版本", kind: "concept", priority: "P1", lessons: ["chapter-12"], source: "releases", confused: ["tag"] },
  { id: "contributor", english: "Contributor", chinese: "贡献者", meaning: "通过代码、文档、问题或其他方式为项目做出贡献的人。", use: "描述参与项目建设的社区成员", kind: "community", priority: "P1", lessons: ["chapter-13"], source: "community", confused: ["collaborator", "maintainer"] },

  { id: "milestone", english: "Milestone", chinese: "里程碑", meaning: "把多个 Issue 和 PR 归入同一个阶段目标。", use: "跟踪阶段进度", kind: "concept", priority: "P2", lessons: ["chapter-7"], source: "issues" },
  { id: "good-first-issue", english: "good first issue", chinese: "适合首次贡献", meaning: "维护者标注为适合新贡献者入门的常用 Label。", use: "帮助新贡献者寻找合适任务", kind: "community", priority: "P2", lessons: ["chapter-7"], source: "issues" },
  { id: "subscribe", english: "Subscribe", chinese: "订阅讨论", meaning: "接收某个 Issue 或 Pull Request 的后续通知。", use: "持续关注单个协作事项", kind: "action", priority: "P2", lessons: ["chapter-7"], source: "issues" },
  { id: "sync-fork", english: "Sync fork", chinese: "同步派生仓库", meaning: "把上游仓库的新变化更新到自己的 Fork。", use: "减少自己的副本与原项目之间的差距", kind: "action", priority: "P2", lessons: ["chapter-8"], source: "glossary" },
  { id: "squash-merge", english: "Squash and merge", chinese: "压缩后合并", meaning: "把 PR 的多个提交压成一个提交后合入目标分支。", use: "让目标分支历史更简洁", kind: "action", priority: "P2", lessons: ["chapter-11"], source: "glossary" },
  { id: "rebase-merge", english: "Rebase and merge", chinese: "变基后合并", meaning: "把提交重新应用到目标分支顶端，形成线性历史。", use: "保持线性提交历史", kind: "action", priority: "P2", lessons: ["chapter-11"], source: "git" },
  { id: "resolve-conversation", english: "Resolve conversation", chinese: "解决对话", meaning: "把已处理的代码审查讨论标记为解决。", use: "整理已回应的审查线程", kind: "action", priority: "P2", lessons: ["chapter-11"], source: "reviews" },
  { id: "artifact", english: "Artifact", chinese: "工作流产物", meaning: "Workflow Run 产生并保存的文件或文件集合。", use: "保存测试报告、构建包或日志", kind: "concept", priority: "P2", lessons: ["chapter-12"], source: "artifacts" },
  { id: "changelog", english: "Changelog", chinese: "变更日志", meaning: "按版本记录新增、修复和不兼容变化的文档。", use: "帮助使用者理解版本差异", kind: "file", priority: "P2", lessons: ["chapter-12"], source: "releases" },
  { id: "github-pages", english: "GitHub Pages", chinese: "静态网站托管", meaning: "从 GitHub 仓库内容发布静态网站的服务。", use: "发布文档、项目主页或静态站点", kind: "concept", priority: "P2", lessons: ["chapter-12"], source: "account" },
  { id: "discussions", english: "Discussions", chinese: "社区讨论", meaning: "用于公告、问答和开放讨论的仓库社区空间。", use: "承载不适合作为 Issue 的社区交流", kind: "navigation", priority: "P2", lessons: ["chapter-13"], source: "community" },
  { id: "wiki", english: "Wiki", chinese: "协作文档站", meaning: "仓库可启用的独立协作文档区域。", use: "维护较长的项目知识文档", kind: "navigation", priority: "P2", lessons: ["chapter-13"], source: "community" },
  { id: "maintainer", english: "Maintainer", chinese: "维护者", meaning: "负责项目方向、审查、发布和社区治理的人。", use: "维护项目质量和协作秩序", kind: "community", priority: "P2", lessons: ["chapter-13"], source: "community", confused: ["contributor"] },
  { id: "collaborator", english: "Collaborator", chinese: "协作者", meaning: "被授予仓库特定访问权限、可直接协作的人。", use: "在授权范围内管理或修改仓库", kind: "permission", priority: "P2", lessons: ["chapter-13"], source: "glossary", confused: ["contributor"] },
  { id: "community-standards", english: "Community standards", chinese: "社区标准", meaning: "GitHub 用来检查公开仓库是否具备关键社区健康文件的清单。", use: "评估开源仓库的协作准备度", kind: "community", priority: "P2", lessons: ["chapter-13"], source: "community" },
  { id: "directory", english: "Directory", chinese: "目录", meaning: "文件系统中用于组织文件和子目录的位置，终端命令通常在项目目录执行。", use: "组织项目文件并确定命令执行位置", kind: "concept", priority: "P2", lessons: ["chapter-3"], source: "gitGlossary" },
  { id: "terminal", english: "Terminal", chinese: "终端", meaning: "输入并运行命令的文本界面，本身不是 GitHub 登录页。", use: "执行 Git、npm 和项目脚本命令", kind: "concept", priority: "P2", lessons: ["chapter-2", "chapter-3"], source: "git" },
  { id: "https", english: "HTTPS", chinese: "加密网页协议", meaning: "GitHub 提供的一种远程仓库 URL 协议，通常更容易开始使用。", use: "通过加密连接访问或克隆远程仓库", kind: "security", priority: "P2", lessons: ["chapter-2"], source: "remote", confused: ["ssh"] },
  { id: "ssh", english: "SSH", chinese: "安全外壳协议", meaning: "可使用密钥对访问 GitHub 远程仓库的安全协议，需要额外配置。", use: "通过 SSH 密钥认证访问远程仓库", kind: "security", priority: "P2", lessons: ["chapter-2"], source: "remote", confused: ["https"] },
  {"id": "remote", "english": "Remote", "chinese": "远端别名", "meaning": "为远程仓库地址起的本地简称，常用 origin 和 upstream；别名不是权限。", "use": "为远程仓库地址起的本地简称，常用 origin 和 upstream；别名不是权限。", "kind": "concept", "priority": "P2", "lessons": ["chapter-2"], "source": "remote", "confused": ["origin", "remote-repository"]},
  {"id": "npm", "english": "npm", "chinese": "包管理工具", "meaning": "管理项目依赖并执行 package.json 里的脚本；不是 GitHub。", "use": "管理项目依赖并执行 package.json 里的脚本；不是 GitHub。", "kind": "concept", "priority": "P2", "lessons": ["chapter-3"], "source": "npmInstall", "confused": ["nodejs"]},
  {"id": "dependency", "english": "Dependency", "chinese": "项目依赖", "meaning": "项目需要的外部包。缺少或版本不匹配时，开发服务器可能无法启动。", "use": "项目需要的外部包。缺少或版本不匹配时，开发服务器可能无法启动。", "kind": "concept", "priority": "P2", "lessons": ["chapter-3"], "source": "npmInstall", "confused": ["requirements"]},
  {"id": "files", "english": "Files", "chinese": "文件", "meaning": "保存代码或文档的单个条目；查看前应确认所在分支。", "use": "保存代码或文档的单个条目；查看前应确认所在分支。", "kind": "file", "priority": "P2", "lessons": ["chapter-4"], "source": "repository", "confused": ["folders"]},
  {"id": "folders", "english": "Folders", "chinese": "文件夹", "meaning": "组织文件的目录结构，文件夹本身不是远程仓库。", "use": "组织文件的目录结构，文件夹本身不是远程仓库。", "kind": "concept", "priority": "P2", "lessons": ["chapter-4"], "source": "gitGlossary", "confused": ["directory", "repository"]},
  {"id": "commit-history", "english": "Commit history", "chinese": "提交历史", "meaning": "记录一条开发线路上的提交，可以追溯变化；新日期不保证项目可靠。", "use": "记录一条开发线路上的提交，可以追溯变化；新日期不保证项目可靠。", "kind": "concept", "priority": "P2", "lessons": ["chapter-4"], "source": "gitGlossary", "confused": ["commit", "commits-tab"]},
  {"id": "language", "english": "Language", "chinese": "编程语言", "meaning": "仓库使用的语言线索，帮助筛选项目；不证明运行环境已满足。", "use": "仓库使用的语言线索，帮助筛选项目；不证明运行环境已满足。", "kind": "concept", "priority": "P2", "lessons": ["chapter-5"], "source": "repository", "confused": ["requirements"]},
  {"id": "topics", "english": "Topics", "chinese": "主题标签", "meaning": "维护者为仓库标注的分类，便于发现项目。", "use": "维护者为仓库标注的分类，便于发现项目。", "kind": "navigation", "priority": "P2", "lessons": ["chapter-5"], "source": "repository", "confused": ["label"]},
  {"id": "stars", "english": "Stars", "chinese": "收藏数量", "meaning": "给仓库加星的人数线索；高星不代表安全、兼容或授权充分。", "use": "给仓库加星的人数线索；高星不代表安全、兼容或授权充分。", "kind": "concept", "priority": "P2", "lessons": ["chapter-5"], "source": "glossary", "confused": ["star", "forks"]},
  {"id": "forks", "english": "Forks", "chinese": "派生仓库", "meaning": "由此仓库派生的副本或其数量；数量不能替代质量判断。", "use": "由此仓库派生的副本或其数量；数量不能替代质量判断。", "kind": "concept", "priority": "P2", "lessons": ["chapter-5"], "source": "repository", "confused": ["fork", "stars"]},
  {"id": "documentation", "english": "Documentation", "chinese": "使用与开发文档", "meaning": "说明安装、使用和协作方法的一组文档；README 常是其中的入口。", "use": "说明安装、使用和协作方法的一组文档；README 常是其中的入口。", "kind": "file", "priority": "P2", "lessons": ["chapter-5"], "source": "community", "confused": ["readme"]},
  {"id": "updated", "english": "Updated", "chinese": "更新时间", "meaning": "表示最近更新的时间线索；需要结合具体提交和维护响应理解。", "use": "表示最近更新的时间线索；需要结合具体提交和维护响应理解。", "kind": "status", "priority": "P2", "lessons": ["chapter-5"], "source": "repository", "confused": ["commit-history"]},
  {"id": "mention", "english": "Mention", "chinese": "提及", "meaning": "用 @用户名 把相关人员带入讨论，是否收到通知还受设置影响。", "use": "用 @用户名 把相关人员带入讨论，是否收到通知还受设置影响。", "kind": "action", "priority": "P2", "lessons": ["chapter-7"], "source": "issues", "confused": ["comment", "subscribe"]},
  {"id": "create-branch", "english": "Create branch", "chinese": "创建分支", "meaning": "从一个已有提交位置创建新线路，原分支保持原状。", "use": "从一个已有提交位置创建新线路，原分支保持原状。", "kind": "action", "priority": "P2", "lessons": ["chapter-9"], "source": "gitGlossary", "confused": ["switch-branch", "fork"]},
  {"id": "switch-branch", "english": "Switch branch", "chinese": "切换分支", "meaning": "改变当前开发线路；切换前可能要处理未提交改动。", "use": "改变当前开发线路；切换前可能要处理未提交改动。", "kind": "action", "priority": "P2", "lessons": ["chapter-9"], "source": "gitGlossary", "confused": ["create-branch"]},
  {"id": "uncommitted-changes", "english": "Uncommitted changes", "chinese": "未提交改动", "meaning": "工作区或暂存区中尚未记入提交历史的改动；Push 不会直接发送它们。", "use": "工作区或暂存区中尚未记入提交历史的改动；Push 不会直接发送它们。", "kind": "status", "priority": "P2", "lessons": ["chapter-10"], "source": "gitGlossary", "confused": ["commit", "push"]},
  {"id": "cancelled", "english": "Cancelled", "chinese": "已取消", "meaning": "工作流被取消执行，不等于检查通过；可以修正原因后重跑。", "use": "工作流被取消执行，不等于检查通过；可以修正原因后重跑。", "kind": "status", "priority": "P2", "lessons": ["chapter-12"], "source": "actions", "confused": ["passed", "failed"]},
  {"id": "version", "english": "Version", "chinese": "版本号", "meaning": "帮助识别交付批次的编号；标签、产物和发布说明承担不同作用。", "use": "帮助识别交付批次的编号；标签、产物和发布说明承担不同作用。", "kind": "concept", "priority": "P2", "lessons": ["chapter-12"], "source": "releases", "confused": ["tag", "release"]},
  {"id": "ready-for-review", "english": "Ready for review", "chinese": "准备审查", "meaning": "将草稿提案转为可审查状态；不是批准或合并。", "use": "将草稿提案转为可审查状态；不是批准或合并。", "kind": "action", "priority": "P2", "lessons": ["chapter-11"], "source": "reviews", "confused": ["draft", "approve"]},
  {"id": "base-repository", "english": "Base repository", "chinese": "目标仓库", "meaning": "将接收变更的仓库，本项目毕业练习必须选择自己的 Fork。", "use": "将接收变更的仓库，本项目毕业练习必须选择自己的 Fork。", "kind": "concept", "priority": "P2", "lessons": ["chapter-11"], "source": "repository", "confused": ["head-repository", "base-branch"]},
  {"id": "head-repository", "english": "Head repository", "chinese": "来源仓库", "meaning": "提供修改的仓库，与来源分支共同确定比较范围。", "use": "提供修改的仓库，与来源分支共同确定比较范围。", "kind": "concept", "priority": "P2", "lessons": ["chapter-11"], "source": "repository", "confused": ["base-repository", "compare-branch"]},
];

const journeyTerms = new Set(["remote", "npm", "dependency", "files", "folders", "commit-history", "language", "topics", "stars", "forks", "documentation", "updated", "mention", "create-branch", "switch-branch", "uncommitted-changes", "cancelled", "version", "ready-for-review", "base-repository", "head-repository"]);
export const vocabulary = seeds.map(makeTerm).map(reviewContributionTerm).map(term => journeyTerms.has(term.id) ? {...term, lastVerifiedAt: "2026-09-11"} : term);
export const vocabularyById = new Map(vocabulary.map((term) => [term.id, term]));
export const p0TermIds = vocabulary.filter((term) => term.priority === "P0").map((term) => term.id);
export const p1TermIds = vocabulary.filter((term) => term.priority === "P1").map((term) => term.id);
