# 随包资源与第三方说明

本项目代码使用 MIT。该许可证不替代 Electron、Chromium、系统字体或其他依赖各自的许可证。

## 运行时与 UI

- Electron：MIT；其附带 Chromium/其他组件有独立许可。打包器保留 `LICENSE` 和 `LICENSES.chromium.html`，不要从 ZIP 删除。来源：https://github.com/electron/electron
- React、Next.js、Tailwind CSS、Zod：MIT；具体锁定版本见 `package-lock.json`，完整许可证保留于依赖分发。构建时将实际依赖许可收集为 `dependency-licenses/` 随包提供。
- Phosphor Icons：MIT，Copyright (c) 2020 Phosphor Icons。来源：https://github.com/phosphor-icons/react；许可副本随 `dependency-licenses/` 交付。
- 中文使用操作系统已有字体，项目没有复制或分发 PingFang / Microsoft YaHei 字体文件；不同系统字形可能略有差异。

## 美术与声音

本仓库 `public/` 的 PNG 是为本项目原创生成的插画，不是从商业武侠游戏或 GitHub 官方复制的素材。各文件哈希、用途和制作依据见 `docs/assets/manifest.json` 及相应阶段记录。生成图片的使用须遵守生成服务适用条款；不保证独占版权或绝对无第三方权利风险。后续人工替换、外部引用需重新审查授权。

新增短提示音为本项目 Web Audio 正弦波合成代码，不包含采样、音乐或第三方音频。默认关闭，无背景配乐。NPC 通过已有信件与台词表达，未引入未经审核的新 IP 头像。

GitHub 及相关商标归其权利人所有。本项目独立开发，与 GitHub, Inc. 无关联、授权或背书。
