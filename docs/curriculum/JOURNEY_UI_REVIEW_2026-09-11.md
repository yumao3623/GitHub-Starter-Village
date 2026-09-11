# 新版操作与英文 UI 审读

核验日期：2026-09-11。下表通过本轮读取官方文档核对；游戏里的卷轴、机关、滑杆属于教学操作，不能声称是 GitHub 实际界面。未复制官方截图。

| 实际英文 / 概念 | 本地教学位置 | 官方依据 |
| --- | --- | --- |
| Code / Create branch / Commit changes / New pull request | 路标、分流竹林、合卷台、议事堂 | [Hello World](https://docs.github.com/en/get-started/using-github/hello-world) |
| Ready for review / Convert to draft | 议事堂草稿与审查 | [Changing the stage of a pull request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/changing-the-stage-of-a-pull-request) |
| Cancel workflow | 百炼炉取消一次运行，结果是 Cancelled | [Canceling a workflow run](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/cancel-a-workflow-run) |
| Re-run jobs / Re-run all jobs | 百炼炉重跑相同 SHA / REF 的运行 | [Re-running workflows and jobs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs) |
| Watch / Releases / 通知订阅 | 飞鸽风铃只演示三档；真实通知还受参与/提及/设置影响 | [Configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications) |
| npm install / Dependency | 营火工坊燃料、断线和日志 | [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/) |
| Remote / Branch / Working tree / Index / Commit | 拓印、驿站、竹径、暂存快照 | [Git glossary](https://git-scm.com/docs/gitglossary) |

新增宝典词条在 `src/content/vocabulary/zh-CN/index.ts` 保存官方来源、2026-09-11 核验日期和章节引用。新关卡的 117 条术语动作绑定由 content:validate 与专属测试检查，不以旧 14 章静态课程的覆盖率替代。

重要区分：GitHub UI 的 `Files changed` 与本地文件列表不同；`Code tab` 浏览文件，`Code button` 提供获取入口；公开、收藏数量与开源许可证不是同一类证据；本地 Commit 不等于 Push，Resolve conversation 不等于 Approve。

`content:sources` 默认只做官方域名与 URL 结构检查；本轮网页读取只对上述来源和案例入口提供直接证据，没有把全部链接都标成已实时网络检查。UI 截图为原创模拟工作台，位于 `artifacts/journey/`，与本审读同轮生成；官方截图未进入项目。
