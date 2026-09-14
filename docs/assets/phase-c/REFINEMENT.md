# 人工验收 V2 · 独立素材与纸张

2026-09-14，使用内置 imagegen，未调用外部收费 API 或 CLI。原图未删除，运行资源位于 public/assets/phase-c/refined。

- 104 件物品来自现有 13 张生成图集。原来的 CSS 等格裁切把跨格物品切断、把邻格碎片带进来。改为按 alpha 连通物体定位并单独归一化到 480×480；精确来源与边界见 refined-extraction.json。
- 新 map-paper.png：旧中国桑皮纸，3:2，四边毛边、缺口、细纤维、折痕及右下卷角；空白中央供原地图原比例叠印。
- 新 inn-nodes.png：参照第四章卷轴生图，两格同形卷轴，分别闭锁和开锁，字样“客”，原山水、木轴、黄铜锁、朱红系带保持风格一致。
- 新 bone-die.png：正俯视旧骨骰，空白面，温暖乳白材质、磨损圆角、薄下斜面。点数由游戏代码按实际掷骰值绘制，不依赖模型生成点数。

## 提示词与透明处理

纸张提示：A large blank sheet of antique Chinese mulberry-fiber travel-map paper, exactly top-down, landscape 3:2; irregular torn deckled edges, visible fibers, browned worn edges, tiny notches, folded bottom-right corner, subtle folds; no writing or landscape; light blank center.

锁牌提示：Two isolated Chinese wuxia watercolor scroll sprites matching chapter four; same scale; left closed brass lock, right open lock; replace numeral with 客; sage cloth, wood rollers, red tassels and ink mountains; generous margin.

骨骰提示：One blank square ivory bone die face, exactly top-down, thin lower bevel, worn corners, fine grain; center blank for dynamic pips; watercolor/ink craft texture; no shiny plastic.

初次“透明背景”生成结果实测 alpha 全不透明，含烘焙底色，未直接投入运行。随后使用内置生图替换为统一洋红底，仅对专门生成的色键底执行透明化和边缘去溢色。没有把棋盘格当透明。绿底、深底和米色底用于验看提取轮廓。处理脚本 scripts/refine-campaign-assets.mjs 与原始生成路径记入 refined-extraction.json。

只核对项目内部来源与画面，不声明独占版权或法律权属认证。
