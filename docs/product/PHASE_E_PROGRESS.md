# 阶段 E 实施记录

> **历史记录声明（2026-09-14）**：本文早于 C V2 最终复核，不能作为当前阶段状态或发布结论。A/B/C 当前交付以 [PHASE_ABC_BASELINE.md](PHASE_ABC_BASELINE.md) 为准；阶段 D 成品验收见本目录的 `PHASE_D_PROGRESS.md`。

日期：2026-09-11  
状态：阶段 E 代码实施完成；公开发布前仍需维护者进行真实用户走查与签名安装验收

## 已完成

- 第 7—12 章贡献链移除章节内互跳导航；完成后只能返回江湖地图。
- 顶部武侠品牌点击回到 `/adventure`，不再跳出到旧版首页。
- 地图主线节点按第 0—12 章从左到右排列，侧支线不再参与主线地图绘制。
- 新增第 0、1、2、3、4、6 章三步入门历练组件，分别覆盖仓库导览、安全、Fork/Clone/ZIP、本地运行、仓库证据和通知关注；每一步改为场景化路牌/机关选择，答错可立即重试并解释原因。
- 地图增加连续主线目标和前置提示；第 0 章可进入，其余章节按前置目标显示锁定原因。
- 统一角色地图定位的底部锚点、过渡方向和落地阴影；贡献链场景角色改用底部定位。
- 移除检查/庆祝姿态上的不透明灰色背景，保留透明素材渲染；场景角色统一使用底部锚点与落地阴影。
- 章节内不再出现其它章节入口；章节完成后仅回到地图，由地图按 0→12 的前置条件开放下一站。
- 地图、入门历练使用现有 Phosphor 图标的卷轴、罗盘、护符、飞鸽等语义映射，保持同一图标族并避免未经许可的 IP 素材。
- 桌面候选包已在本机生成并完成 SHA-256 清单，未签名、未公证、未发布。
- 新增本地存档中的 `foundations` 与 `foundationProgress`，每步操作可恢复，不把整章动画当作掌握。
- 保留旧版测试、阶段 C/D 演示和阶段 A 存档兼容性。

## 验证结果

```text
npm run typecheck       通过
npm run lint            通过
npm run content:validate 通过
npm run content:sources  通过（41 个官方链接）
npm run test             通过（11 个测试文件，53 个测试）
npm run build            通过（Next.js 16.3.4）
npm run assets:validate  通过（8 项；历史素材 provenance gap 已记录）
npm run desktop:test     通过（6 个桌面安全测试）
npm run desktop:verify   通过（macOS arm64，本机离线协议与重启恢复）
npm run desktop:build    通过（生成 out/build-info.json）
npm run desktop:package  通过（本机候选包，published=false）
npm run desktop:release-check 通过本地门禁（公开发布仍被配置/签名条件阻止）
```

浏览器检查（`http://127.0.0.1:4173/adventure`）：

- 角色选择、武侠导航和主线十二关地图正常渲染。
- 第 0 章可从地图进入独立任务页面。
- 第 0 章页面显示三步新手引导与返回地图按钮。
- 没有 Next.js 错误覆盖层，页面不是空白页。

## 尚未完成

- 尚未完成真实用户可用性研究、干净系统安装/升级/卸载测试、代码签名与公证；这些不能由本地自动化替代。
- 人物素材目前通过裁切、透明背景渲染和落地阴影处理；若维护者提供最终原图，应再做逐张像素级边缘复核。
- Windows 实机包、公开 Release、部署网站和真实 GitHub 操作均未执行。
- 地图与章节仍是本地模拟教学，不会验证真实登录、Fork、Push 或 Pull Request。
- 未上传 Release、未部署网站、未接入 GitHub OAuth/API，也未执行任何真实 GitHub 操作。
