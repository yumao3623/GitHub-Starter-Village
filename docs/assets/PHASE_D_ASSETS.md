# 阶段 D 素材与动效登记

日期：2026-09-11。原 A/B/C 资产保持不变；新增图像由内置 Imagegen 根据本项目原画生成，未复制第三方游戏资产。机器可校验清单见 manifest.json，逐项 SHA-256 防止替换后漏审。

## 实际采用

| 文件 | 尺寸 / 形式 | 用途 |
| --- | --- | --- |
| public/characters/wuxia-actions-v1.png | 1620×971 RGB，纸面图集 | 三角色各待机、两张行走关键姿势、阅读卷轴、拱手庆祝；不是透明精灵 |
| public/world/ink-mist-overlay-v1.png | 1536×1024 RGBA，但视觉为不透明宣纸 | 分享卡山水纸面；不覆盖地图地标 |
| 原 A/C 角色、地图、场景 | 原文件不变 | 站姿和分享卡坚持复用原始三人身份；地点场景见对应阶段记录 |
| UI 道具 | 项目 CSS/DOM | 卷轴、证据托盘、印章、驿站信包、分支竹简、合卷台、审阅便条、三炉检查、治理文书；各有真实状态，不靠图片文字教学 |
| 轻提示音 | Web Audio 正弦波，0.13秒，低增益 | 用户主动开启后按钮反馈；默认关闭，无背景配乐 |

新增动作图以原版 cast 为身份参考：陆行舟靛青衣/黑发束带/书筒，沈知微赭红衣/红发带/书筒，阿团橘色虎斑/白口鼻/青绿短衣。裁切按实际行高而非假定等分。阅读与庆祝进入场景及结算，行走关键姿势作为纸面资产保留；地图小标记继续用原立绘，避免不透明纸片遮挡地形。不是连续步行动画或完整六表情转面库，扩展库不伪装为已制作。

## 生成与质检记录

初次提示词：以原三角色联图为参考，3行5列角色动作图，每列依次为站姿、左脚行走、右脚行走、读卷、庆祝；保留脸型、衣服、毛色和配饰，不要文字/Logo。要求透明背景。

质检：生成器把灰白棋盘画进了 RGB。再次请求真正透明背景仍得到 RGB。两张失败稿不作为发布素材。最终改为明确的不透明纸面插画，已目视检查无棋盘；没有用抠图算法伪造透明验收。

最终编辑提示词：
“Edit this original character action sheet. Preserve exactly these three character identities, clothes, expressions, 5 columns and three rows and all poses. Replace the ENTIRE gray-white checkerboard background with a flat opaque warm ivory paper background color #f5f1e5. Absolutely no checkerboard anywhere, no grid, no text, no new decoration, no transparency illusion. Intended for opaque paper-panel vignettes, not transparent sprites. Keep all figures fully visible, margins between them. Do not change clothes, hair, tabby coat markings. 5 columns each: idle / walking left leg / walking right leg / inspecting scroll / happy respectful clasped hands.”

纸面背景提示方向：原创淡彩水墨宣纸，灰绿远山、低对比薄雾、大面积留白，不含人物/文字/标志。用途经检查改为分享纸面，不声称 alpha 雾图层。

图像工具不提供可复用随机种子，不能保证再次生成像素相同。原始 A/C 参考来源与提示词保留在对应文件；源码 MIT 不替代生成服务条款，不承诺独占版权。V1 品牌地图原提示词未留存在仓库，manifest 明确记为历史来源记录不足。已将首页改为有记录的阶段 C 地图，打包脚本排除旧品牌图；原文件留在 Git 历史基线中，不擅自删掉、不补造出处。

## 低干扰反馈

- 角色拱手轻补间 600ms；地图、信件、炉火反馈保持现有教学因果顺序。
- 行囊减少动效和系统 prefers-reduced-motion 都关闭动画/过渡，游戏完成判定不依赖动画回调。
- 窗口失焦或隐藏暂停动画；声音隐藏时不播放，不采样任何第三方音乐。
- 英文、错误原因、焦点与目标始终是真实 DOM，不烘焙进图片。
- 分享卡只从当前角色与本地记录生成，两种尺寸，不上传。证据判定见 share-summary.ts。
