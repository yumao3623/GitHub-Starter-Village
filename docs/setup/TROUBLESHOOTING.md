# 运行故障排查

## `node` 或 `npm: command not found`

从 Node.js 官网安装 LTS，关闭并重新打开终端，再运行 `node --version` 和 `npm --version`。

## 找不到 `package.json`

你不在项目目录。用文件管理器找到 Clone 的文件夹，再在该目录打开终端。运行 `ls` 或 `dir` 应能看到 `package.json`。

## `npm install` 失败

先确认网络、Node.js 版本和错误第一行。不要使用管理员权限或删除系统目录来“碰运气”。运行 `npm run doctor` 查看基础环境。如果锁文件与依赖异常，请在 Issue 中附操作系统、Node/npm 版本和去除隐私后的错误文本。

## 3000 端口被占用

Next.js 可能自动选择 3001。使用终端最终显示的 Local 地址，不要固定照抄 3000。

## 浏览器打不开

确认 `npm run dev` 的终端仍在运行；地址使用 `http://localhost:端口`；不要关闭终端。停止服务器使用 `Ctrl + C`。

## Git 要求密码

不要输入 GitHub 账号密码。查看 [GitHub 官方认证说明](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)，或改用 GitHub Desktop。

## 仍然无法解决

使用 Bug report 模板，提供操作系统、Node.js/npm 版本、执行过的命令、完整但已脱敏的错误信息。不要附密码、Token、私钥、恢复代码或真实付款信息。
