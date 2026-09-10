# GitHub 新手村

> 从登录、Fork、Clone 到提交第一个 Pull Request，用一场完整的新手村冒险学会 GitHub。

## 武侠改版 · 阶段 A

现已提供本地样板：三位角色、局部迷雾地图、一关完整的“集市鉴宝”和独立本机存档。启动开发版后访问 **http://localhost:3000/adventure**。

**桌面成品尚未公开发布，暂时没有 GitHub 下载按钮。** 当前是本地打包验证阶段，不是十四章桌面正式版。不要把 `Code → Download ZIP` 或 Release 的 `Source code (zip)` 当作可双击的应用。

[阶段 A 的本地体验、打包和限制说明 →](docs/setup/DESKTOP_PREVIEW.md)

## 第一次使用 GitHub？

# [从这里开始 →](docs/START_HERE.md)

你不需要先会 Git，也不需要先看懂所有英文。第零章就是：在真实 GitHub 找到这个项目，把它安全地复制到自己的账号和电脑，再成功运行。

> **安全提醒：** 本项目不会制作 GitHub 登录页，不会要求你输入 GitHub 密码、Personal Access Token、SSH 私钥、2FA 代码或 Recovery codes。注册、登录、2FA、Fork 与 Clone 均发生在 GitHub 官方网站或 GitHub Desktop。

## 先看懂当前仓库页面

- **Repository**：仓库，保存项目文件、版本历史与协作记录。
- **README**：你正在读的项目说明，也是第零章入口。
- **Public**：任何人可以查看，不代表任何人都有写入权限。
- **Star**：可选收藏。**不 Star 也能使用和通关。**
- **Fork**：在你的 GitHub 账号下创建有关联的仓库副本。
- **Code 页签**：查看文件与 README。
- **绿色 Code 按钮**：打开 Clone、Codespaces 和 Download ZIP 菜单。

## 四步进入游戏

### 1. 注册或登录 GitHub

只使用 [GitHub 官方注册页](https://github.com/signup) 或 [GitHub 官方登录页](https://github.com/login)。验证邮箱后，建议阅读 [GitHub 账号安全指南](docs/setup/GITHUB_ACCOUNT.md)，设置 2FA 或 Passkey，并把 Recovery codes 安全保存到密码管理器。

### 2. Fork 到自己的账号

1. 回到本仓库首页。
2. 在页面右上方找到 **Fork**。
3. 点击 **Create fork**。
4. 等待页面跳转，确认地址中的 Owner 已变成你的 GitHub 用户名。

Fork 不会修改原项目。它与 Clone 不同：Fork 在 GitHub 账号之间复制仓库，Clone 把仓库复制到电脑。

### 3. 选择一种复制方式

#### 路线 A：GitHub Desktop，新手推荐

1. 安装 [GitHub Desktop](https://desktop.github.com/)。
2. 在浏览器中登录 GitHub 并打开你自己的 Fork。
3. 点击 **Code → Open with GitHub Desktop**。
4. 选择容易找到的本地目录，点击 **Clone**。

[查看逐步说明](docs/setup/GITHUB_DESKTOP.md)

#### 路线 B：命令行

1. 安装 [Git](https://git-scm.com/downloads)。
2. 在你自己的 Fork 中点击 **Code → HTTPS**，复制 URL。
3. 打开 Terminal（终端），进入准备存放项目的目录。
4. 执行：

```bash
git clone https://github.com/你的用户名/github-starter-village.git
cd github-starter-village
```

GitHub 已移除 Git 操作的账号密码认证。终端要求认证时，不要输入 GitHub 账号密码；优先使用 GitHub Desktop、Git Credential Manager、GitHub CLI 的浏览器授权，或按照 [GitHub 官方认证说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github) 配置 HTTPS/SSH。

[查看命令行说明](docs/setup/COMMAND_LINE.md)

#### 路线 C：Codespaces

在自己的 Fork 中选择 **Code → Codespaces → Create codespace**。Codespaces 是云端开发环境，个人账号的计算与存储有额度限制，请在使用前查看 [GitHub 官方额度说明](https://docs.github.com/en/codespaces/troubleshooting/troubleshooting-included-usage)。

[查看 Codespaces 说明](docs/setup/CODESPACES.md)

#### Download ZIP 是什么？

Download ZIP 可以获得当前文件快照，但它不是完整 Git Clone，不包含正常的 Git 历史和远程同步关系。可以临时查看文件，不推荐用于完整课程。

### 4. 安装并运行

先从 [Node.js 官网](https://nodejs.org/en/download) 安装 LTS 版本。Node.js 安装包通常会一起安装 npm。

在包含 `package.json` 的项目目录中运行：

```bash
npm run doctor
npm install
npm run dev
```

终端会显示本地地址，通常是：

```text
http://localhost:3000
```

把它复制到浏览器打开。`localhost` 指你的电脑自己，不是公开网站。停止开发服务器时，回到终端按 `Ctrl + C`。

如果出现 `command not found`、端口占用、依赖安装失败或打开空白页，请看 [故障排查](docs/setup/TROUBLESHOOTING.md)。

## 开始第一章

游戏运行后打开 `/play`。首次默认使用“全中文辅助”，可以随时切换中英对照、悬停翻译、挑战模式或自由探索。

课程包含 14 章：

- 0-3：真实进入、账号安全、复制和运行项目。
- 4-6：仓库地图、判断项目、关注方式。
- 7-13：Issue、本地与远程、Branch、Commit、Pull Request、Review、Actions、Release 和社区健康。
- 毕业任务：只在你自己的 Fork 内完成一次真实 Branch → Commit → Push → Pull Request → Merge。

默认不要向原仓库提交毕业 PR，避免制造大量无意义贡献。

## 开发者入口

```bash
npm install
npm run content:validate
npm run content:coverage
npm run content:sources
npm run typecheck
npm run lint
npm run test
npm run build
```

- [课程范围](docs/curriculum/SCOPE.md)
- [课程路径](docs/curriculum/LEARNING_PATH.md)
- [设计方向](docs/design/DESIGN_DIRECTION.md)
- [架构说明](docs/architecture/ARCHITECTURE.md)
- [贡献指南](CONTRIBUTING.md)
- [安全政策](SECURITY.md)

## 品牌与赞助配置

品牌名称、仓库地址和网站地址集中在 `src/config/brand.ts`。正式发布前请替换其中的 `OWNER` 与 `example.com`。

赞助默认关闭。只有在维护者提供真实二维码后，才把图片放入 `public/sponsor/` 并更新 `src/config/sponsor.ts`。个人收款二维码可能暴露真实姓名，启用前请确认隐私风险。本仓库不会生成虚假二维码或验证支付。

## 独立项目声明

GitHub Starter Village 是一个独立开发的开源学习项目，不是 GitHub 官方产品，与 GitHub, Inc. 无关联、授权或背书。GitHub 及相关商标归其权利人所有。

## License

[MIT](LICENSE)
