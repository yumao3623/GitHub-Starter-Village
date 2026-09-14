# 阶段 D 成品验收记录（2026-09-14）

本次验收以 [阶段 A/B/C 当前交付基线](../product/PHASE_ABC_BASELINE.md) 和 [阶段 C V2 复核结果](../verification/PHASE_C_V2_REAUDIT_RESULT.md) 为输入。验收只覆盖本地构建与成品包，不代表 GitHub Release 已上传。

## 自动验收结果

| 检查 | 结果 |
| --- | --- |
| `npm run content:validate` | 通过：123 个术语、14 个旧课程章节、13 个武侠独立场景 |
| `npm run content:coverage` | 通过：旧课程 P0/P1 主线 100%，武侠主线 13 章单独统计 |
| `npm run content:sources` | 通过：43 个唯一官方链接的域名与 URL 检查 |
| `npm run assets:validate` | 通过：169 个运行资产；`starter-village-map.png` provenance gap 按既有规则排除分发 |
| `npm run typecheck` | 通过 |
| `npm run lint` | 通过；3 条 `docs/design` 样例 warning，无 error |
| `npm run test` | 通过：16 个文件、121 项 |
| `npm run desktop:test` | 通过：6 项桌面协议/安全测试 |
| `npm run build` / `npm run desktop:build` | 通过；静态路由和 Electron 构建指纹生成成功 |
| `npm run desktop:package` | 通过；生成 macOS arm64 候选包 |
| `npm run desktop:release-check -- --artifact …/artifact.json` | 通过本地门禁；`publicReleaseReady: false` |
| ZIP 完整性 / `codesign --verify --deep --strict` | 通过；包内 `.app` 为 ad-hoc 签名 |
| CUA 直接桌面验收 | 通过：成品包实际打开，首屏/菜单栏标识/入村引导/角色选择/地图/第 0 章可见；关闭重开显示“继续上次历练” |

## 本次候选包

- ZIP：[GitHubStarterVillage-0.1.0-darwin-arm64.zip](../../artifacts/desktop/darwin-arm64-1789378049043/GitHubStarterVillage-0.1.0-darwin-arm64.zip)
- SHA-256：`fdc80c0b7e6c71355c203edbbc4569677eca36c96eab50386e1fb64f5601f3ce`
- `app.asar` SHA-256：`6eadbd92304b1fb9992d689088e5f6aa149a383970f5ebe0ff53dffa15634aad`
- 源码提交：`30a78a2f9bc8e1e5bea7c08f799e6adde692a4c3`；构建时工作区有未提交变更
- 包内 `Info.plist` 的 `CFBundleIconFile` 为 `jianghu-manual-icon-v1.icns`；包内图标与 `public/brand/jianghu-manual-icon-v1.icns` SHA-256 相同；未保留 `electron.icns`
- `artifact.json`：`artifacts/desktop/darwin-arm64-1789378049043/artifact.json`

## 阻塞与未宣称项

Playwright 命令行启动仍会在受限 Shell 中报 `Process failed to launch!`，直接启动退出码 `-6`；这不是成品包结构错误。经用户授权后，CUA 已从同一最新 `.app` 实际打开窗口，确认菜单栏应用标识、首屏、引导、地图和关闭重开恢复，因此本轮桌面视觉与重启验收已补齐。Playwright 的受限 Shell 失败保留为环境诊断记录。

公开发布仍被以下条件阻止：Developer ID 签名与 Apple 公证、干净系统安装/升级/卸载、Windows/Intel 实机、真实 GitHub 下载复验，以及维护者对 Release 上传的单独授权。本轮没有推送、上传或修改真实 GitHub 数据。
