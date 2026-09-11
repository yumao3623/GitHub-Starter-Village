# 在哪里下载，下载后怎么打开

当前已发布 `v0.1.0` 预发布桌面包。README 的 macOS Apple 芯片按钮会直接下载成品；Windows x64 和 Intel Mac 仍在后续验收中。不要把 `Code → Download ZIP` 或 Release 附带的源码 ZIP 当成应用。

推荐在电脑浏览器打开维护者提供的真实仓库地址：

```text
仓库首页（Repository）
  └─ 下方 README「下载桌面应用」
       ├─ macOS · Apple 芯片：M 系列 Mac（当前 v0.1.0 预发布）
       ├─ Windows · x64：后续验收
       ├─ macOS · Intel：后续验收
       └─ 版本说明与校验值 → Release → Assets（成品文件列表）
```

这是一张位置示意，不是 GitHub 官方界面截图。GitHub 窄窗口中 Releases 入口可能移到页面下方；README 下载区优先。Windows ARM 和 Linux 只有经过实际验收并列入支持列表后才可以推荐。

## 打开成品

1. 看文件名中的系统与芯片类型，再看 Release 说明。Mac 在苹果菜单 → 关于本机查看芯片；Windows 在设置 → 系统 → 系统信息查看系统类型。
2. 下载 `.zip`，在下载文件夹里**先完整解压**。不要直接在压缩包内部运行。
3. Mac 打开解压文件夹里的 `GitHubStarterVillage.app`，可拖到“应用程序”。Windows 打开文件夹内的 `GitHubStarterVillage.exe`，不要单独移走 exe；它需要同目录的运行时文件。
4. 成品不需要 Node.js/npm/Git。选角色 → 踏入江湖 → 集市鉴宝；断网可进行模拟学习，官方文档、登录与 Fork 需要网络。
5. 系统警告“无法验证开发者”或杀毒告警时先停止，向维护者核实对应版本、签名和 SHA-256。**不要关闭 Gatekeeper、SmartScreen、杀毒软件，也不要执行网上的解除隔离命令。**

`Code → Download ZIP` 和 Release 自动附带的 `Source code (zip)` 都是源码，不是应用。安装成品也不等于 Fork 或 Clone；真实练习还要回到[从这里开始](../START_HERE.md)，取得自己 Fork 的源码。

## 可选：核对文件完整性

与同一 Release 发布的 `SHA256SUMS.txt` 比较完整的 64 位值，而不是只看开头。SHA-256 只证明文件是否一致，不证明发布者身份。

Mac：在 ZIP 所在目录打开终端，用 `shasum -a 256 文件名.zip`。Windows：在该文件夹打开 PowerShell，用 `Get-FileHash -Algorithm SHA256 .\文件名.zip`。不会使用终端的新手可以请维护者协助；不需要粘贴任何账号秘密。

## 存档、升级与卸载

行囊 → 导出当前进度，保存 JSON 到自己选择的位置。升级前先导出并关闭旧应用，再解压新版本到新的文件夹；不要把不同版本文件混放。启动后确认角色与任务仍在。异常时保留原始存档，通过导入恢复，不要反复重置。

删除/移至废纸篓应用文件夹即可移除便携应用，存档不会自动删除。若需清空学习记录，用应用内“重置样板”并确认；这会保存重置前备份。不要手工删除整个系统应用数据目录。
