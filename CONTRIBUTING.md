# 贡献指南

感谢参与 GitHub 新手村。请先阅读 [课程范围](docs/curriculum/SCOPE.md) 与 [内容审校政策](docs/curriculum/CONTENT_REVIEW_POLICY.md)。

## 开发流程

1. 在自己的 Fork 创建短生命周期分支。
2. 只做一个清晰主题的修改。
3. 课程结论附官方来源；界面词更新 `lastVerifiedAt`。
4. 不添加登录、OAuth、GitHub API、数据库、分析脚本或凭据收集。
5. 运行完整校验：

```bash
npm run content:validate
npm run content:coverage
npm run content:sources
npm run typecheck
npm run lint
npm run test
npm run build
```

Pull Request 说明应包含动机、影响章节、来源、测试结果和桌面/390px 截图。内容纠错请使用专用 Issue 模板。不要提交真实账号数据、凭据、收款二维码或未经许可的素材。
