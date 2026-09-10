# 使用命令行

Terminal 是输入命令的工具，Directory 是文件所在目录。先安装 [Git](https://git-scm.com/downloads) 和 [Node.js LTS](https://nodejs.org/en/download)。

在自己的 Fork 打开 Code → HTTPS，复制地址：

```bash
git clone https://github.com/你的用户名/github-starter-village.git
cd github-starter-village
npm install
npm run dev
```

HTTPS 更容易开始；SSH 需要先生成密钥对，并把公钥添加到 GitHub。不要把账号密码当作 Git 命令密码。GitHub 已移除 Git 操作的账号密码认证，可使用 Git Credential Manager、GitHub CLI 浏览器授权、PAT 或配置好的 SSH。项目不会要求你创建或粘贴 PAT。

用 `pwd`（macOS/Linux）或 PowerShell 的 `Get-Location` 检查当前目录；用 `ls` 或 `dir` 确认能看到 `package.json`。
