# 阶段 C 原创美术与引用记录

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
