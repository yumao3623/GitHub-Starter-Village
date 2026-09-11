# 阶段 A：桌面鉴宝样板

这是维护者的源码开发与桌面验证说明，不是普通玩家的安装步骤。macOS Apple 芯片的 `v0.1.0` 预发布包已放在 GitHub Release；本页只说明如何从源码构建和验证，不替代成品下载入口。桌面包未签名/公证，浏览器与桌面版不自动共享进度。

当前状态请先看[验收记录](../product/PHASE_D_PROGRESS.md)：macOS Apple Silicon 的 v0.1.0 预发布包已通过本机离线主流程验证。Windows、Intel Mac 和干净机器下载/安装未验证。下面是构建命令，不是普通玩家的下载入口。

## 用浏览器体验

在项目目录打开终端，执行：

```bash
npm install
npm run dev
```

打开 http://localhost:3000/adventure 。独立演示入口为 http://localhost:3000/adventure-demo ，不会读取或保存正式样板进度。

## 开发者构建桌面样板

以下命令只供维护者构建，需要 Node.js 22.13 或更高版本。未来下载成品的玩家不需要 Node.js、npm 或终端。

```bash
npm ci
npm run desktop:build
npm run desktop:open
```

首次启动可能下载 Electron 运行时。若官方源超时，可参考 [Electron 官方安装说明](https://www.electronjs.org/docs/latest/tutorial/installation) 中的镜像配置；不得关闭校验或使用来历不明的可执行文件。本机本次使用该文档列出的镜像，下载后经 `@electron/get` 对照 npm 包内置 SHA-256 校验值验证。源码安装和首次构建需要网络，玩家拿到完整成品后才可离线使用。

`desktop:build` 生成静态 `out/`。`desktop:open` 使用 Electron 自带运行环境，通过私有 `village://app` 协议打开本地静态内容；没有后台 Node 开发服务器，也不监听网络端口。

生成本机 macOS Apple Silicon 应用目录：

```bash
npm run desktop:package
```

输出路径由命令打印，位于 `artifacts/desktop/` 下的时间戳目录。找到 `GitHubStarterVillage.app` 双击打开。应用目录会带 Electron 运行时；不能只复制 `out/` 并声称它是桌面成品。

Windows x64 构建候选（可在 Windows CI/本机执行）：

```bash
npm run desktop:build
npm run desktop:package:windows
```

本阶段生成应用目录，不是已签名的安装器；Windows 输出整个文件夹需一起交付，不能只拷贝 exe。正式 DMG/安装器、签名/公证、干净机器下载测试在后续阶段完成。只有真正运行验证过的平台才会在验收记录中标为已验证。

维护者验收命令：

```bash
npm run desktop:test
npm run desktop:verify
```

`desktop:verify` 启动隔离测试存档，检查私有协议、安全设置、断网完成任务和关闭重开恢复，截图/结果写入 `artifacts/phase-a/`。测试可通过 `--app` 或 `GSV_DESKTOP_EXECUTABLE` 指定打包应用内可执行文件；未指定时只验证开发壳，不能代替成品验收。

```bash
npm run desktop:verify -- --app "/实际构建目录/GitHubStarterVillage.app/Contents/MacOS/GitHubStarterVillage"
```

开发壳与成品分别输出 `desktop-verification.json`、`desktop-packaged-verification.json`。成品测试从临时目录启动，PATH 不含开发 Node.js，页面脚本不具备 Node 权限；这仍不等于在全新系统卸载 Node 后做过安装测试。报告单独保留已收到 200 响应的 HEAD 预加载取消，不把它们与未响应、非 200、GET 或导航失败混在一起。

## 体验流程

1. 选陆行舟、沈知微或阿团，点击“踏入江湖”。
2. 在地图进入“集市鉴宝”。飞鸽台此时标明前置条件。
3. 点击摊位卷轴，查看 Requirements、License、Releases、Stars。
4. 收集一条资料，点击对应证据栏归档；不需要拖拽。
5. 每卷三项证据齐全后，给出符合资料的鉴定。
6. 三卷全部鉴定后，选择适合委托的一卷并交付，地图解锁飞鸽台剧情预告。
7. 可换一组条件重新练习，不能靠记住上一轮项目名字通关。

所有控件支持键盘 Tab / Enter，复选框用空格。宝典支持搜索、Escape 收起并返回触发位置。行囊可减少动效、导入导出和确认重置。

## 存档与边界

- 新存档键为 `gsv:adventure:phase-a:v1`，不覆盖旧版课程。
- 损坏/未知版本存档停止自动覆盖，并提示导出原始数据；可继续临时体验。
- 导入前备份为 `:before-import`，重置前备份为 `:before-reset`。它们是最近一次备份，不是无限版本历史。
- 新版证据和通关不计入旧版 P0 掌握率；不会授予真实 GitHub 毕业认证。
- 所有图片、课程和程序随静态包提供；官方来源链接与真实 GitHub 操作仍需网络。
- 阶段 A 使用系统字体，不需要在线字体服务；不同系统可能显示不同字形。
- 卸载/删除应用前建议在行囊导出 JSON。不要通过删除用户目录来“修复游戏”。

## 配置和素材

品牌名称/仓库地址在 `src/config/brand.ts`；桌面标识、尺寸、入口和外链白名单在 `src/config/desktop.json`；角色资产与名称在 `src/content/characters/index.ts`。桌面显示名应与品牌一致（测试校验）；正式仓库地址仍须维护者替换。

[素材、提示词与一致性记录](../assets/PHASE_A_ASSETS.md) · [阶段 A 验收记录](../product/PHASE_A_PROGRESS.md)
