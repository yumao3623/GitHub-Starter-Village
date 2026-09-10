# 阶段 A 美术资产与来源

制作日期：2026-09-10。所有本轮图片由内置 imagegen 生成，无第三方武侠游戏资源输入；未调用项目内 AI API。角色、场景和文字 UI 分开，游戏运行离线读取图片。

| ID | 路径 | 用途 | 来源与状态 |
| --- | --- | --- | --- |
| cast-v1 | `public/characters/wuxia-cast-v1.png` | 男侠客、女侠客、练功小猫的统一设定联图 | 内置 imagegen，原创生成样板；同一图集在选角、地图、对话和结算中裁显复用 |
| river-valley-v1 | `public/world/river-valley-v1.png` | 云溪谷地图局部 | 内置 imagegen；建筑背景原创，节点、雾层、路径与玩家状态由代码叠加 |
| appraisal-market-v1 | `public/world/appraisal-market-v1.png` | 集市鉴宝场景 | 内置 imagegen；含青砚 NPC 的场景示意，项目文字和操作卷轴为真实 UI |

图片原始尺寸均为 1536×1024。角色图有透明通道；图集内三人占位并非严格等宽，`src/content/characters/index.ts` 按实际分区裁显，未改动原始图像。角色动作当前是位置补间、反馈印章与场景转换，不是已完成的走路精灵帧或表情库。

代码和图标沿用项目已有 MIT 代码及 Phosphor 图标库。本轮没有复制调研仓库的美术、音乐、UI 图集或关卡。字体使用操作系统中文字体栈，不下载远程字体；这保证断网不请求字体，但不同系统字形会有差异，统一随包字体留待后续选型。

项目维护者可在适用生成服务条款允许范围内分发这些生成资产；此记录不承诺生成输出具有排他版权或天然不存在第三方权利风险。正式公开前仍需复核。源代码 MIT 不自动替代生成服务条款或第三方权利。

## 一致性锚点

- 陆行舟：黑发束髻、靛青发带与外袍、浅色内衫、卷轴匣。
- 沈知微：黑发高髻、赭红发带与外袍、浅色内衫、卷轴匣。
- 阿团：奶油橙虎斑、绿色短褂、卷轴匣、较短尾巴。
- 无角色性能差异，没有套用 GitHub 吉祥物或现有武侠 IP。

后续动作和表情必须从该角色参考图编辑，不重新凭文字随机生成身份。当前样板允许更换角色但不清除学习进度。

## 最终生成提示词

以下记录实际使用的三个提示词，执行路径均为内置 imagegen，不是 CLI/API。

### cast-v1

```text
Use case: stylized-concept. Asset type: original wuxia game character selection atlas for GitHub Starter Village. Generate ONE wide transparent PNG character atlas, exactly three equal-width columns, each character centered within their column, full body visible from top of head to feet, ample clear gaps between characters, all three on the same baseline. NO text, NO labels, NO border, NO scenery, NO logo, genuinely transparent background. Left column: original young adult male Chinese wandering scholar-swordsman, black hair tied in a high knot with indigo ribbon, warm ivory tunic, muted indigo layered robe, charcoal boots, small wooden scroll case on his back, friendly assured expression. Middle column: original young adult female Chinese wandering scholar-swordswoman, black hair in neat high bun with muted vermilion ribbon, warm ivory tunic, muted terracotta layered robe, charcoal boots, same wooden scroll case, composed friendly expression. Right column: small anthropomorphic cream-and-orange tabby kung-fu kitten, round ears, short orange-striped tail, sage green short wuxia jacket, tiny belt and scroll case, standing upright with paws ready to learn. Human characters about 4.5-head tall stylized proportions, kitten about 70 percent human height. Unified elegant hand-painted 2D Chinese watercolor game art with ink contour lines, soft mineral pigment color, sophisticated and warm, not photorealistic, not pixel art, not glossy 3D. Each silhouette easy to read at 80 pixels. All are wholly original, no existing IP likeness, no octopus/cat hybrid or GitHub mascot. Atlas intended for code cropping each equal column as SAME identity in character select, map token, game scene and dialogue.
```

### river-valley-v1

```text
Use case: stylized-concept. Asset type: original 2D wuxia adventure game MAP BACKGROUND, landscape 1536x1024. Hand-painted Chinese watercolor with delicate ink contour, pale rice-paper ground, muted sage jade mountain slopes, indigo distant mountains, warm ochre paths, small vermilion details. Bird's-eye oblique overview of a compact mountain valley, all terrain authored and legible like an illustrated tabletop adventure map. Three primary distinctive places: small travelers' inn and bamboo grove at left lower quarter (25% x, 65% y), lively village marketplace with three ochre/indigo/red canopy stalls at center (50% x, 52% y), red-roof pigeon messenger pavilion on a hill on right (80% x, 35% y). A winding ochre walking trail connects these places across a beautiful small stone bridge over a pale jade stream. Distant upper mountain ridges and forest, bottom foreground reeds. Keep middle walking trails clear with no human figures; map buildings modest size, plenty of breathing room. No UI, no words, no labels, no markers, no compass, no logos, no borders, no existing copyrighted game assets, no 3D shading. Fog and paths that unlock will be rendered in code, so DO NOT paint opaque fog over the buildings. Entire image coherent soft elegant watercolor, sophisticated, inviting to adult beginner developers. Usable as a full-stage map with DOM node buttons overlay.
```

### appraisal-market-v1

```text
Use case: stylized-concept. Asset type: background for a playable Chinese wuxia market appraisal minigame. Original hand-painted Chinese watercolor and ink line art, muted sage bamboo, aged warm paper, indigo gray mountain silhouettes, ochre wooden architecture, vermilion cloth accents. Landscape 1536x1024. Camera: slightly elevated eye level looking into a quiet open-air mountain market. Three small wooden vendor stalls arranged across the UPPER TWO THIRDS at x25%,50%,75%, with respectively sage green, indigo blue and warm rust canopies. Shelves with rolled maps, books, ceramic jars, no readable writing. Lower third is a quiet open stone courtyard with space for a game character overlaid at lower left. Very small elderly scholarly mapkeeper NPC behind central stall, not a main hero. Gentle afternoon diffuse light, distant bamboo and tiled roofs, fine illustrative brush texture, airy rather than dark. Composition must allow three interactive scroll buttons to be overlaid near stalls, not a UI screenshot. NO text, no labels, no signage writing, no interface, no giant scroll in foreground, no logos, no copyrighted game characters. Consistent calm elegant watercolor adventure-game aesthetic, not 3D, not pixel art. All scene assets original.
```
