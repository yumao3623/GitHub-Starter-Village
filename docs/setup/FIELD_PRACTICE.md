# 出师实战：在自己的 Fork 内完成一个 Pull Request

对应应用 `/field-practice/`，正文数据在 `src/content/scenarios/field-practice.ts`。应用清单可离线阅读、逐条自查，并在本机保存；不验证 GitHub 状态。

## 先明确两种下载

Release 桌面安装包只是学习应用，不会自动创建 GitHub 账号、Fork 或本地 Git 仓库。真实实践需要另外取得**自己 Fork 的源码**。回到 [从这里开始](../START_HERE.md)，在 GitHub 官方网站登录、Fork，检查左上角所有者是自己，再通过 Code → Open with GitHub Desktop Clone。不要把桌面应用安装目录当成源码目录。

## Desktop 路线

1. Current Repository 选择自己 Fork 的本地副本。Current Branch 选 main。查看 Changes；有其他未提交修改先停下，不丢弃。Fetch origin，有更新才 Pull origin。
2. Branch → New Branch，名称 `practice/first-contribution`。创建后检查 Current Branch，再 Publish branch。已存在同名分支时换名，并在后续比较中使用同一个名字。
3. 用编辑器打开仓库，在 `graduates/practice/` 新建 `my-first-contribution.md`，已存在就另取名字，不覆盖。内容只写学习体会，例如“Commit 保存本地提交；Push 上传提交；我的练习只在自己的 Fork 中进行。”不要写个人信息、凭据或私密数据。
4. 保存，回 Desktop 的 Changes，只选新文件，右侧 Diff 逐行看。Summary 填 `docs: add my first practice`，Commit to 当前练习分支。不要夹带环境文件或无关配置。
5. Push origin。打开自己 Fork 的这个分支，检查文件已出现。网页没有文件时检查是否仅 Commit、尚未 Push。
6. 在自己 Fork 的 Pull requests → New pull request。必要时选择 compare across forks。**base repository 与 head repository 都选自己的 Fork**，base branch 是 main，compare 是练习分支。GitHub 默认有时把上游作为 base，必须改回自己！
7. 比较页只应包含预定练习文件。填写标题、描述，再 Create pull request。进入 Files changed，再读一次。需要修改则在同一分支编辑、Commit、Push，原 PR 随之更新。
8. 查看 Checks；未运行不等于 Passed。本练习不要求开启 Fork Actions、不配置 Secrets。作者不能 Approve 自己的 PR；游戏 NPC 的批准只是教学模拟。
9. 再核对接收方为自己的 main。Merge pull request，确认合并。按钮不可用时读原因，不绕过仓库保护；出现冲突则停止、比较双方意图，不直接覆盖。
10. 确认 Merged 后 Delete branch，只删除练习分支。Desktop 切回 main，Fetch/Pull origin，确认练习文件仍在。删除本地分支遇到未合并警告应停下，不强制删除。

不向项目原仓库提交毕业 PR。误提交上游时关闭该 PR，重新在自己的 Fork 内建立，不重复刷屏。

## Git 命令路线

在文件管理器找到 Clone 后的仓库，用编辑器的终端打开**该目录**。逐条运行、读结果；不是整段粘贴。`git status` 检查工作区，`git remote -v` 核对 origin 指向自己。若有陌生修改或地址不符先停下。

```sh
git switch main
git fetch origin
git pull --ff-only origin main
git switch -c practice/first-contribution
```

现在用编辑器新建上述练习文件并保存。`git status` 会把新文件显示为 untracked，普通 `git diff` 不展示未跟踪文件内容，所以先在编辑器审查，再只暂存这一个文件：

```sh
git add graduates/practice/my-first-contribution.md
git diff --cached
git commit -m "docs: add my first practice"
git push -u origin practice/first-contribution
```

在 GitHub 网页完成上面第 6—9 步。回本地，确认工作区干净后：

```sh
git switch main
git pull --ff-only origin main
git branch -d practice/first-contribution
```

若使用 Squash 合并，`-d` 可能拒绝，因为本地提交不是 main 的同一祖先；保留分支并检查，不直接改 `-D`。不需要配置 upstream 就能完成这次练习；不使用 force push。

## 遇到问题

- 找不到差异：确认改在练习分支、保存、Commit 并 Push，比较方向不是 main 对 main。
- 认证失败：只在 GitHub 官方页面或 Desktop 处理登录，参照官方 HTTPS/SSH 说明。GitHub 账号密码不是 HTTPS Git 操作密码；应用不接收 token。
- 检查失败：找当前提交对应的运行，读失败 Job/Step 日志，不凭旧绿色记录合并。不明白就停下。
- 误提交秘密：立即撤销或轮换相应秘密；仅删除文件不能使历史和已有副本中的秘密失效。不要把秘密贴到 Issue 求助。
- 分支或合并权限限制：保持数据不变，读提示与仓库规则；不要为练习放宽组织安全策略。

## 核验依据

核验日期：2026-09-11；以下是规则来源，不意味着本项目验证了你的真实操作。

- [Desktop 提交和检查差异](https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop)
- [创建 PR](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request)
- [Fork PR 的接收与来源](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork)
- [远程仓库与认证](https://docs.github.com/en/get-started/git-basics/about-remote-repositories)
- [审阅规则](https://docs.github.com/en/pull-requests/reference/pull-request-reviews)
- [Git 暂存](https://git-scm.com/docs/git-add)、[分支删除](https://git-scm.com/docs/git-branch)
