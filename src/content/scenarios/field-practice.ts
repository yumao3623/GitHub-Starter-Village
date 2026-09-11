export const practiceSteps = [
  { id: "fork", title: "确认自己的 Fork", detail: "在 github.com 登录。仓库左上角 Owner 必须是自己的 Username。下载桌面应用只得到应用，不会自动 Fork 或 Clone；若还没有源码副本，先按第零章 Fork，再在自己仓库的 Code 菜单选择 Open with GitHub Desktop。" },
  { id: "branch", title: "创建独立练习 Branch", detail: "Desktop 的 Current Repository 选择自己的副本，Current Branch 选择 main，先 Fetch origin，有更新再 Pull origin。Changes 必须为空；不为空就停下保留原修改。通过 Branch → New Branch 创建 practice/first-contribution，再 Publish branch。这个分支只用于本练习。" },
  { id: "file", title: "新增一份无个人信息的练习文件", detail: "用编辑器打开本地仓库。在 graduates/practice 内新建 my-first-contribution.md（存在则另取名字，不覆盖）。写入：我理解 Commit 是本地历史，Push 才会上传；本次练习只在自己的 Fork 中进行。不要填写姓名、邮箱、密码、密钥或任何个人资料。保存文件。" },
  { id: "commit", title: "审查 Diff，再 Commit", detail: "回到 Desktop 的 Changes。只勾选新建的练习文件，右侧 Diff 应只有预期的新文字。Summary 填 docs: add my first practice，点击 Commit to practice/first-contribution。若多出配置、锁文件或其他人的文件，先停止，不要全选提交。" },
  { id: "push", title: "Push 到自己的 origin", detail: "点击 Push origin（首次发布分支可能显示 Publish branch）。打开自己 Fork 的分支菜单，应能看到练习文件。认证只在 GitHub 官方页面或 Desktop 内完成；本应用不接收任何凭据。" },
  { id: "pr", title: "创建自己 Fork 内的 Pull Request", detail: "在自己 Fork 的 Pull requests → New pull request 打开比较页；必要时展开 compare across forks。务必把 base repository 和 head repository 都设为自己的 Fork，base 为 main，compare 为 practice/first-contribution。默认 base 可能是原项目！方向不对就不要提交。确认只有练习文件，填写标题，再 Create pull request。" },
  { id: "review", title: "检查 Files changed 和 Checks", detail: "打开 Files changed 再读一次。需要修改时继续编辑同一分支，Commit、Push，已有 PR 会更新，无需新建。作者不能给自己的 PR 提交 Approve；游戏里的青砚是模拟审阅者，不是你的真实账号。没有运行 Checks 不等于 Passed；Fork 的 Actions 可能未启用，本练习不要求启用工作流或添加 Secrets。" },
  { id: "merge", title: "在自己 Fork 内 Merge", detail: "再次核对 PR 顶部接收方是自己/main，再使用 Merge pull request 并确认。按钮不可用时先阅读具体原因（规则、检查或冲突），不要绕过保护或强制推送。遇到冲突应停下逐行比较双方意图；不盲目接受一方。完成后 PR 应为 Merged，自己 main 中有练习文件。" },
  { id: "cleanup", title: "删除练习 Branch，拉回本地", detail: "PR 的 Delete branch 只删除已合并的练习分支，不删除 main 或历史。回到 Desktop，切回 main，Fetch origin、Pull origin，确认文件仍在。可删除本地已合并练习分支；若提示有未合并内容，停止检查，不强制删除。" },
] as const;
export const practiceSources = [
  ["创建 Pull Request", "https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request"],
  ["从 Fork 创建 PR 与 base/head", "https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork"],
  ["Desktop 提交与审查修改", "https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop"],
  ["合并 Pull Request", "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request"],
  ["远程仓库与认证", "https://docs.github.com/en/get-started/git-basics/about-remote-repositories"],
] as const;
export const practiceCommands = `# 在自己 Fork 的本地源码目录打开终端；逐条执行并读结果
git status
git remote -v
# origin 必须指向自己的 Fork；有未提交修改就停下
git switch main
git fetch origin
git pull --ff-only origin main
git switch -c practice/first-contribution
# 此时用编辑器新建 graduates/practice/my-first-contribution.md
git status
git diff --no-index -- /dev/null graduates/practice/my-first-contribution.md
# 上一条显示新文件内容，差异存在时退出码 1 正常；Windows 可直接在编辑器审查
git add graduates/practice/my-first-contribution.md
git diff --cached
git commit -m "docs: add my first practice"
git push -u origin practice/first-contribution
# 接下来在 GitHub 网页完成自有 Fork 内 PR、审查和 Merge
# 网页合并后，确认工作区干净，再拉回 main
git switch main
git pull --ff-only origin main
git branch -d practice/first-contribution
# -d 拒绝删除时停止，不改用 -D；Squash 合并可能没有相同祖先记录`;
