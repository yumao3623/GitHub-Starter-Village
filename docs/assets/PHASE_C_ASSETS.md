# 阶段 C 原创美术与引用记录

> 资产历史记录已统一到 [阶段 A/B/C 当前交付基线](../product/PHASE_ABC_BASELINE.md) 与 [C V2 复核结果](../verification/PHASE_C_V2_REAUDIT_RESULT.md)。较早的 62 项登记只用于追溯，不代表当前 104 件独立对象/运行资产验收口径。

生成日期：2026-09-11。使用本环境 Imagegen 工具生成；不增加运行时 AI 依赖、不调用用户密钥、不下载或复制第三方游戏图片。用户授权生成项目素材。生成结果的使用仍受生成服务适用条款和当地法律约束，不作独占版权保证。

## 美术方向

继承 A/B 的细墨线、淡宣纸、青灰山体、赭石山道与少量朱砂屋顶；不重设视觉体系。新增背景不画人物，人物始终复用 `src/content/characters/assets.ts` 的三套原角色裁切。NPC 青砚以信件出现，不新造可能不一致的肖像。角色目前是立绘与位置变化，不声称已制作逐帧行走动画。

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `public/world/jianghu-full-v1.png` | 1536×1024 | 四区域完整地图；路径、地点、迷雾、玩家标记为独立 DOM/SVG 层 |
| `public/world/contribution-scenes-v1.png` | 1536×1024 | 3×2 环境图集：悬赏、驿站、竹林、合卷、议事、百炼 |

两次生成均以已审核的 `public/world/river-valley-v1.png` 为风格参考。原文件未修改。地图文字与交互不烘焙入图片；小窗口仍用可读 DOM。地图美术不是实际 GitHub 界面。

## 实际生成提示词

### 地图

Use case: stylized-concept. Create ONE new wide 1536x1024 original Chinese wuxia game WORLD MAP background, using the attached existing map only as a style reference. Same delicate ink contours, pale rice paper, muted jade/sage/indigo mountains, ochre paths, vermilion roof accents. Oblique bird's eye, one coherent authored map with FOUR distinct regions and many small buildings: lower-left camp and inn, upper-left market and pigeon pavilion, central bamboo and river ferry stations, right highland guild court, forge and library. Winding paths and bridges join all four regions. Clear open areas for UI overlay, buildings distributed through x15-85%, y25-75%. No people, no text, no UI, no labels, no logos. No dense fog painted over landmarks: game adds fog. Unlike input, show the whole region with about 12 distinctive compact landmarks, not just three giant buildings. Same hand painted color and style as reference, not 3D. Output a project-ready illustration.

### 场景图集

Use case: stylized-concept. One production asset: six-panel 3 columns by 2 rows landscape environment atlas, equal cells, no gutters, 1536x1024. Style reference is attached original Chinese watercolor wuxia valley: same fine ink, paper grain, muted sage, indigo, ochre and terracotta. Each cell distinct scene with lower foreground open for reusable character overlay and DOM game objects. Row1 col1 wooden notice board courtyard (Issues); col2 two postal river piers (remote/local); col3 bamboo grove with forked footpath and writing desk (Branch editor). Row2 col1 two scroll lecterns facing a meeting bridge (PR); col2 scholarly guild review hall with round table (Review); col3 warm copper forge with three inspection stations (Checks). NO people or cats anywhere: main characters reused separately. No letters, no text, no logos, no UI, no borrowed IP, no glossy 3D. All six landscapes share coherent light and detail. Whole artwork exactly six equal rectangular scene cells.

## GitHub 项目参考

只研究了 [pcottle/learnGitBranching](https://github.com/pcottle/learnGitBranching) 的“操作后看状态变化、允许重试、由小步骤构成任务”方法。没有复制它的代码、图片、角色或 CSS，也未把它加入依赖。不能把开源仓库存在等同于其中每张素材都有可复用授权。

动效为项目自写 CSS：驿站提交包进入、交付物出现、炉火运行、失败和成功状态；尊重系统与行囊的减少动效设置。动作是教学状态反馈，不制造等待焦虑。

## Phase C mainline atlas (2026-09-12)

- `public/assets/phase-c/mainline-atlas-v1.png` is a 4×4 generated scene atlas (16 equal cells, 1254×1254 RGB). Cells cover chapters 0–12 plus a quiet continuation tile; the runtime crops one cell per chapter and places accessible HTML controls above the art.
- Creator: Built-in Imagegen using the existing `jianghu-full-v1.png` and `contribution-scenes-v1.png` visual direction as references. No readable text, logos, or third-party characters are baked into the atlas.
- Distribution: bundled project artwork; generation-service terms apply; no exclusivity claim. Prompt/output provenance is recorded in this document and the image remains a local static asset.
- `public/assets/phase-c/map-lock-closed-v1.png`, `map-lock-open-v1.png`, and `map-lock-complete-v1.png` are the approved Phase A generated map-node states copied into the runtime asset set. The chapter number remains an accessible DOM label rendered with the bundled brush type, while the lock and scroll artwork are raster assets.

## 阶段 C 实际运行资产补充（2026-09-12）

阶段 C 主线不再依赖单张通用 atlas 作为玩法主体。实际运行资产包括：

- `public/assets/phase-c/nodes/chapter-0.png` 至 `chapter-12.png`：13 张独立三态卷轴图集，分别绘制对应章数；运行时按锁定、可进入、完成裁切。
- `public/assets/phase-c/props/chapter-0.png` 至 `chapter-12.png`：13 张独立四乘二道具图集，物件与章节知识语境对应；RGB 导出已转为真实 RGBA 透明，避免棋盘格背景进入画面。
- `public/assets/phase-c/action-wood.png`、`book-page.png`、`tea-thanks.png`、`coin-pouch.png`、`silver-note.png`、`travel-pass.png`：木牌动作、翻书、结尾茶席和经济系统素材。
- `docs/assets/manifest.json`：所有 62 项运行时图片均登记尺寸、哈希、来源和分发说明；`node-generation.json`、`prop-generation.json`、`alpha-repairs.json`、`alpha-regeneration.json`、`ui-generation.json`、`sidequest-generation.json`、`chapter-12-regeneration.json` 保存生成与复核记录。

图片中的章数只用于视觉锚点；可访问的章名和状态仍由 DOM 文本提供。所有素材均为本项目内置 Imagegen 生成或阶段 A/B 已审阅资产，不复制第三方项目图片。
