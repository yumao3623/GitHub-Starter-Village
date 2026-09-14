# 阶段 E · GitHub 发布准备（2026-09-14）

本文件由 `npm run desktop:release-prepare` 生成，只记录本地候选发布门禁；脚本不会登录、上传 GitHub、推送标签或修改 Release。

- 仓库：https://github.com/yumao3623/GitHub-Starter-Village
- Release 标签：v0.2.0
- package.json 版本：0.2.0
- 候选产物：GitHubStarterVillage-0.2.0-darwin-arm64.zip
- publicReleaseReady：**false**

## 检查结果

- ✅ readme：与当前候选配置一致
- ✅ repository：https://github.com/yumao3623/GitHub-Starter-Village
- ✅ status：当前状态为 candidate
- ✅ versionTag：标签与版本一致：v0.2.0
- ✅ artifact：GitHubStarterVillage-0.2.0-darwin-arm64.zip
- ✅ artifactVersion：版本一致：0.2.0
- ✅ source：已通过
- ⛔ signing：签名状态为 adhoc；公开 macOS 分发需要 Developer ID。
- ⛔ notarization：公证状态为 not-performed；需对同一最终产物完成公证并 staple。
- ⛔ systemAcceptance：干净系统验收状态为 pending。
- ✅ publishedFlag：产物仍标记为未发布
- ⛔ worktree：当前工作树仍有未提交变更；发布候选必须记录对应提交并由维护者审核。
- ✅ targets：所有目标平台公开开关均已关闭
- ✅ githubAuth：GitHub CLI 已登录

## 发布动作边界

只有完成 Developer ID/公证、干净系统与目标平台实机验收、最终 SHA 复核，并得到维护者单独批准后，才可以在 GitHub 创建或更新 Release。当前没有执行任何 GitHub 写入。

## 阻塞项

- 签名状态为 adhoc；公开 macOS 分发需要 Developer ID。
- 公证状态为 not-performed；需对同一最终产物完成公证并 staple。
- 干净系统验收状态为 pending。
- 当前工作树仍有未提交变更；发布候选必须记录对应提交并由维护者审核。

机器可读证据：[PHASE_E_RELEASE_READINESS_2026-09-14.json](PHASE_E_RELEASE_READINESS_2026-09-14.json)
