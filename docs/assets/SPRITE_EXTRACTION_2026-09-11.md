# 独立角色素材提取与透明验证

更新：2026-09-11，revision 2。来源是本仓库已有原创角色 `wuxia-cast-transparent-final.png` 与 `wuxia-actions-transparent-final.png`，没有引入第三方角色。原图保留。

旧矩形裁切会截断相邻人物；动作图还存在低 alpha 彩色残点。最终管线为 `scripts/extract-character-sprites.mjs`：每格取最大连通轮廓、剔除低 alpha 背景与红/蓝/黄色污染像素、保留相邻抗锯齿像素，再等比放入独立画布。最终素材只由上述脚本重建。

交付陆行舟、沈知微、阿团各 standing / walking / inspecting / celebrating，共 12 张独立 420×640、8-bit RGBA PNG。统一足底坐标 y=632；四边保留透明空间。人类有效高度最多 600px，小猫 350px，维持相对比例。左右为独立文件，不靠 CSS atlas 横移隐藏邻角色。

逐文件的来源矩形、有效轮廓、足底基线、视觉中心、方向、左上光照、版本和内部审核状态见 `character-sprites-v2.json`；内容哈希和分发记录见 `manifest.json`。`CharacterPlacement` 统一 groundY / footOffset / scale / shadow，阴影在脚下 4px。

验证包括 PNG 元数据与四角 alpha、浅底 `#eee7d5` / 深底 `#213d37` 联系表，以及浏览器选角和场景截图。联系表：`artifacts/character-contact-sheet.png`。本轮可见比例下没有棋盘背景、相邻角色碎片或原先的彩色杂点；原图为生成插画，放大到超出使用尺寸时仍可能见到插画边缘的抗锯齿，不能把元数据测试称作艺术质量认证。

尝试过一次内置 Imagegen 清理动作图，返回图带烘焙棋盘格且为 RGB，**未集成也未计为合格素材**。最终素材由上述确定性 RGBA 管线产生，没有调用外部图像 API。

青砚使用从本仓库原创角色动作图派生、只调整衣袍色板的独立 RGBA NPC 文件；桥/马车/书架/灯笼/炉火等机关由 `scene-environment.tsx` 原创 SVG 绘制，图标来自统一 Phosphor 图标族。它们属于项目代码资产，不复制参考游戏素材。13 个局部场景复用大画卷对应镜头，并叠加各自空间机关，保留相同的墨、纸、玉色体系。

历史 `public/brand/starter-village-map.png` 仍有既存来源缺口，未改动它，不用于新版画卷或候选桌面分发；不是本轮新增角色素材。
