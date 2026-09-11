# GitHub 新手村

一款打开就能玩的武侠风 GitHub 学习游戏。

如果你是从抖音链接第一次来到这里，不需要先学 Git，也不需要配置 Node.js、npm 或命令行。按下面三步即可开始：

## 下载并开始

### 1. 下载适合你电脑的桌面版

<!-- BEGIN GENERATED DOWNLOADS -->
## 下载桌面应用

- [下载 macOS · Apple 芯片](https://github.com/yumao3623/GitHub-Starter-Village/releases/download/v0.1.1/GitHubStarterVillage-0.1.0-darwin-arm64.zip)；文件名：`GitHubStarterVillage-0.1.0-darwin-arm64.zip`
- Windows · x64：**暂未开放公开下载**；文件名：`GitHubStarterVillage-0.1.0-win32-x64.zip`
- macOS · Intel（实验构建）：**暂未开放公开下载**；文件名：`GitHubStarterVillage-0.1.0-darwin-x64.zip`

[版本说明与 SHA-256 校验值](https://github.com/yumao3623/GitHub-Starter-Village/releases/tag/v0.1.1)

成品包自带运行环境，不需要安装 Node.js、npm 或 Git。下载后按电脑类型解压并打开应用（保留 Windows 解压文件夹内的运行时文件）。第一次打开若被系统阻止，请停止并联系维护者，不要关闭系统安全保护。

[下载位置、解压和校验图解](docs/setup/DOWNLOAD_APP.md) · [源码运行指南](docs/setup/DESKTOP_PREVIEW.md)
<!-- END GENERATED DOWNLOADS -->

macOS Apple 芯片版本已经发布为预发布 Release；Windows x64 和 Intel Mac 仍在后续验收中。请不要把 `Code → Download ZIP` 或 Release 附带的源码 ZIP 当成游戏安装包。下载成品的方式是：选择电脑类型 → 下载 ZIP → 完整解压 → 打开应用。

打开时遇到系统安全提示，请先停止并核对 Release 页面中的版本和 SHA-256，不要关闭系统安全保护，也不要运行来历不明的解除隔离命令。

[下载位置与打开说明](docs/setup/DOWNLOAD_APP.md)

### 2. 打开应用

解压后：

- Mac：打开 `GitHubStarterVillage.app`；
- Windows：打开解压文件夹中的 `GitHubStarterVillage.exe`，不要单独移动 exe 文件。

第一次进入会看到：入村引导 → 选择陆行舟、沈知微或阿团 → 江湖地图。游戏支持断网游玩；官方 GitHub 页面、Fork 和源码练习仍需联网。

### 3. 开始游戏

沿着地图从第 0 章走到第 12 章：

村口路标 → 护身堂 → 拓印坊 → 营火工坊 → 藏图阁 → 集市鉴宝 → 飞鸽传书 → 悬赏亭 → 双城驿站 → 分流竹林 → 合卷台 → 议事堂 → 百炼炉。

每章都有独立场景、角色对话、可操作机关、错误反馈、撤销/重试和地图奖励。武林宝典可以随时解释英文术语和当前任务。

## 这个项目教什么

游戏中的操作是安全的本地模拟，帮助你理解真实 GitHub 的概念：Repository、README、Fork、Clone、Branch、Commit、Pull Request、Review、Actions 和 Release。

真正的 GitHub 学习路线是：

官方仓库 → 阅读中文 README → Fork → Clone / GitHub Desktop / Codespaces → 本地运行 → 回到自己的 Fork → 完成安全毕业练习。

游戏不会替你登录 GitHub，也不会收集密码、Token、SSH 私钥、2FA 或 Recovery codes。不会调用 OAuth、GitHub API，也不会要求 Star、分享、赞助或向原仓库提交无意义的 PR。

## 想学习 GitHub 操作？

下载应用和学习 GitHub 是两件事：你可以先玩游戏，再按需要学习真实仓库操作。

- [从 GitHub 找到自己的 Fork](docs/START_HERE.md)
- [GitHub Desktop 路线](docs/setup/GITHUB_DESKTOP.md)
- [命令行路线](docs/setup/COMMAND_LINE.md)
- [Codespaces 路线](docs/setup/CODESPACES.md)
- [出师实战：只在自己的 Fork 中练习](docs/setup/FIELD_PRACTICE.md)

这些页面是给想继续学习 GitHub 的人准备的，不是第一次打开游戏前的安装要求。

## 给维护者和开发者

源码仍是 Next.js App Router、严格 TypeScript 和静态优先架构。开发者需要 Node.js LTS，普通玩家不需要。

```bash
npm install
npm run dev
```

完整检查：

```bash
npm run content:validate
npm run content:coverage
npm run content:sources
npm run typecheck
npm run lint
npm run test
npm run build
npm run desktop:test
npm run desktop:verify
```

产品审计与实施记录保留在 [`docs/product/`](docs/product/)，不放在普通玩家的首屏路径中。

## 独立项目声明

GitHub Starter Village 是独立开发的开源学习项目，不是 GitHub 官方产品，与 GitHub, Inc. 无关联、授权或背书。GitHub 及相关商标归其权利人所有。

## License

[MIT](LICENSE)
