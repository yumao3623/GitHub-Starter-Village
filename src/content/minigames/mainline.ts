import { chapterLessons, type Mechanic } from './chapters';

export type MainlineKind = 'route' | 'security' | 'dispatch' | 'workshop' | 'archive' | 'market' | 'mail' | 'issue' | 'freight' | 'branch' | 'staging' | 'review' | 'release';
export type MainlineProfile = { chapter: number; kind: MainlineKind; sceneCell: number; tagline: string; playPattern: string; clearLine: string; accent: string };

const profiles: Record<number, Omit<MainlineProfile, 'chapter'>> = {
  0: { kind: 'route', sceneCell: 0, tagline: '把 GitHub 的入口铺成一条可走的山道', playPattern: '寻路连连看', clearLine: '四块路牌连成正确用途，入口即刻亮起。', accent: 'vermilion' },
  1: { kind: 'security', sceneCell: 1, tagline: '在护身机关里辨认账号与安全边界', playPattern: '灯笼节奏', clearLine: '只留下安全入口，秘密从不进入机关。', accent: 'jade' },
  2: { kind: 'dispatch', sceneCell: 2, tagline: '让 Fork、Clone 与 ZIP 各走自己的马车', playPattern: '资源调度', clearLine: '三种取得方式分工明确，旅人各得其所。', accent: 'ochre' },
  3: { kind: 'workshop', sceneCell: 3, tagline: '用日志把本地工坊重新点燃', playPattern: '连线修复', clearLine: '目录、终端、依赖和 localhost 串成火路。', accent: 'fire' },
  4: { kind: 'archive', sceneCell: 4, tagline: '在藏图阁按证据层层搜证', playPattern: '翻牌配对', clearLine: '文件、历史、许可与版本证据互相印证。', accent: 'sage' },
  5: { kind: 'market', sceneCell: 5, tagline: '用证据卡鉴定一件值得带走的工具', playPattern: '鉴宝组合', clearLine: '可运行、可授权、可维护三枚印同时落下。', accent: 'gold' },
  6: { kind: 'mail', sceneCell: 6, tagline: '把收藏、订阅、关注与副本分拣到不同信台', playPattern: '飞鸽分拣', clearLine: '每封信抵达正确对象，通知恰好不多不少。', accent: 'blue' },
  7: { kind: 'issue', sceneCell: 7, tagline: '把一张模糊事件单编排成可跟进的委托', playPattern: '揭榜排程', clearLine: '标签、负责人、里程碑与讨论形成闭环。', accent: 'vermilion' },
  8: { kind: 'freight', sceneCell: 8, tagline: '让 upstream、origin 与本地货运各守边界', playPattern: '驿站调度', clearLine: 'Fetch 看路、Pull 入城、Push 回自己的 Fork。', accent: 'river' },
  9: { kind: 'branch', sceneCell: 9, tagline: '从 main 旁分出一条安全修复小径', playPattern: '竹林分流', clearLine: '命名、切换、查看差异，主路保持完整。', accent: 'bamboo' },
  10: { kind: 'staging', sceneCell: 10, tagline: '把修改、暂存、提交和推送分成四张纸', playPattern: '合卷叠签', clearLine: '每一步都有可读证据，快照不会夹带私人物件。', accent: 'ink' },
  11: { kind: 'review', sceneCell: 11, tagline: '在议事堂完成一次有意见、有修订的合卷', playPattern: '评审牌局', clearLine: '修订意见被处理，冲突双方意图都被保留。', accent: 'cinnabar' },
  12: { kind: 'release', sceneCell: 12, tagline: '把通过检查的工艺铸成可交付版本', playPattern: '炉火连锁', clearLine: 'Workflow、Artifact、Tag 与 Release 串成发行卷。', accent: 'furnace' }
};

export const mainlineProfiles: MainlineProfile[] = chapterLessons.map(lesson => ({ chapter: lesson.chapter, ...profiles[lesson.chapter] }));
export const mainlineProfileByChapter = new Map(mainlineProfiles.map(profile => [profile.chapter, profile]));
export const mainlineKinds: MainlineKind[] = mainlineProfiles.map(profile => profile.kind);
export function mainlineProfile(chapter: number) { return mainlineProfileByChapter.get(chapter) ?? mainlineProfiles[0]; }
export function stageMechanicLabel(mechanic: Mechanic) { return ({ explore: '翻查物件', place: '配对归位', sequence: '按序点灯', edit: '落笔验印', slider: '调节风铃' })[mechanic]; }
