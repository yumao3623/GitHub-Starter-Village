# 架构

应用采用 Next.js App Router 和静态优先渲染。页面与静态内容默认是 Server Components；`GameProvider`、任务交互、筛选和分享卡导出是隔离的 Client Components。

内容、状态和界面分层：`src/content` 是课程事实来源，`src/core` 负责 reducer、掌握度和持久化，`src/components` 负责展示，`src/config` 集中品牌、导航、课程与赞助配置。

相对需求目录树的调整：第一版把同一语言的术语放在一个 TypeScript 数据模块中，避免数十个小文件和重复导入；当协作者规模扩大时可按章节拆分。没有创建空目录或空资产文件。
