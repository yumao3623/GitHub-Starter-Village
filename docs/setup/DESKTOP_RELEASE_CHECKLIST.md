# 桌面分发与系统验收清单

2026-09-11。阶段 D 的代码可以进入内部复测，公开发布仍有硬门禁。生成 ZIP ≠ 签名 ≠ 实机验收 ≠ 获准发布。

## 已核实的条件

本机 macOS 26.6.2 / arm64。只读 security find-identity -v -p codesigning 返回 **0 valid identities**；notarytool 与 stapler 均可找到。本次未读取/导出私钥、未创建证书、未登录 Apple、未上传公证请求。没有 Windows 或 Intel Mac 实机证据。

Apple 要求对外分发的 Developer ID 签名软件走公证流程；详见[Developer ID](https://developer.apple.com/developer-id/)与[公证流程](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)。Windows 验证使用微软[SignTool](https://learn.microsoft.com/en-us/windows/win32/seccrypto/signtool)的 /pa 策略及时间戳检查；不能承诺有签名就永无 SmartScreen 提示。Electron 的[签名指南](https://www.electronjs.org/docs/latest/tutorial/code-signing)提供工具接入方向。核验日期2026-09-11。

## 可复现内部打包

在仓库终端中逐条运行：

```sh
npm ci
npm run content:validate
npm run content:coverage
npm run assets:validate
npm run typecheck
npm run lint
npm run test
npm run desktop:test
npm run build
npm run desktop:build
npm run desktop:package -- darwin arm64
# Windows 上：
npm run desktop:package -- win32 x64
# Intel Mac 目标（仍需 Intel 系统验收）：
npm run desktop:package:mac-intel
```

打包输出到 artifacts/desktop/<平台-架构-时间戳>/，包含应用文件夹、版本化 ZIP、SHA256SUMS.txt 和 artifact.json。包内有项目和依赖许可证、资产来源及 START_HERE.txt。不会自动推送、上传或签名。跨系统 Windows 生成只算交叉打包，非 Windows 运行验证。

```sh
npm run desktop:release-check -- --artifact /绝对路径/artifact.json
npm run desktop:verify:d -- --app /绝对路径/GitHubStarterVillage.app/Contents/MacOS/GitHubStarterVillage
# Windows 把 --app 路径换成解压包的 GitHubStarterVillage.exe
```

请先用上述命令打印的真实路径替换示例。desktop:verify:d 会创建独立临时用户数据，不碰正式学习存档。记录协议隔离、断网、重启、六章链路/四支线、真实自查、分享图与录屏数据隔离。

## 公开门禁（须单独审批）

- [ ] 配置 brand.json 的真实仓库地址和 desktop.json 的正式应用身份；更改 appId 可能改变未来签名/存档行为，先做升级测试。
- [ ] 同一候选产物在干净 Windows/macOS 目标机、无 Node/Git 环境完成解压、启动、断网学习、重启、导入导出、升级、移除应用。
- [ ] 实测中文路径、普通权限账户、1024×720至1920×1080，以及 Windows 125%/150%缩放；记录硬件、启动耗时、内存峰值和包体。
- [ ] 经额外授权使用维护者 Developer ID 签名，提交 Apple 公证、staple 后重新打 ZIP；用 codesign --verify --deep --strict、xcrun stapler validate、spctl --assess --type execute 核验同一个 .app。
- [ ] Windows 正式签名和可信时间戳，signtool verify /pa /all /v 检查；记录下载后的 SmartScreen/杀毒实际结果。
- [ ] 签名改变文件后，重新生成 SHA-256 清单并对**最终 ZIP**重新验收；不得沿用未签名候选的哈希和通过记录。
- [ ] 审查 assets/manifest 与 THIRD_PARTY_NOTICES；确认历史来源不足的旧品牌图未引用且未进入包（当前打包器已排除）。
- [ ] 单独批准 Release 上传/标签推送。发布真实资产后，再设置 distribution.json status、releaseTag、已验收目标 public，并从 desktop:release-check --print-readme 更新 README 标记区。
- [ ] 从真实 GitHub 下载链接重新下载一次并核验 SHA；Source code(zip) 不是应用，下载成品不是 Fork/Clone。

npm run desktop:release-check -- --public 当前故意返回失败，防止把本地通过误作可公开发布。它不自动联机检查 Release，也不以人工填写 true 代替签名和系统检查。开放发布需另一次有真实证据的发布配置审查。

## 报告必须包含

版本、Git commit与未提交标记、app.asar 哈希、ZIP SHA-256、平台架构、系统版本、硬件/性能、签名与公证工具结果、验收脚本/人工步骤、执行日期、操作者和失败项。不要提交测试用户真实数据或证书。实际阶段 D 结果见 PHASE_D_PROGRESS.md；不把 C 的旧包报告当作 D 的新包验收。
