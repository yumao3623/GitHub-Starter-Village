import { freshWuxiaSave, parseWuxiaSave, type WuxiaSave } from "@/core/persistence/chapter-storage";
import { chapterLessons } from "@/content/minigames/chapters";
import { applyChapterEvent, freshChapter, hasChapterAward, replayChapter, runComplete, type ChapterEvent } from "./chapter-games";
export type WuxiaState = WuxiaSave & {
    ready: boolean;
    view: 'intro' | 'choose' | 'map' | 'chapter';
    notice: string;
    error: boolean;
    storageIssue: string | null;
    rewardFrom: number | null;
    demo: boolean;
};
export const initialWuxia = (demo = false): WuxiaState => ({ ...freshWuxiaSave(), ready: false, view: 'intro', notice: '', error: false, storageIssue: null, rewardFrom: null, demo });
export type WuxiaAction = {
    type: 'hydrate';
    save: WuxiaSave | null;
    issue?: string;
} | {
    type: 'intro';
} | {
    type: 'character';
    id: WuxiaSave['character'];
} | {
    type: 'map';
} | {
    type: 'enter';
    chapter: number;
} | {
    type: 'act';
    event: ChapterEvent;
} | {
    type: 'undo' | 'restart';
} | {
    type: 'bookmark' | 'review';
    id: string;
} | {
    type: 'motion';
    reduced: boolean;
} | {
    type: 'storage-error';
    issue: string;
} | {
    type: 'show-intro' | 'reset-save';
};
export const earnedChapters = (s: Pick<WuxiaSave, 'runs'>) => chapterLessons.filter(l => hasChapterAward(l.chapter, s.runs[l.chapter])).map(l => l.chapter);
export const nextChapter = (s: Pick<WuxiaSave, 'runs'>) => chapterLessons.find(l => !hasChapterAward(l.chapter, s.runs[l.chapter]))?.chapter ?? 12;
export function wuxiaReducer(s: WuxiaState, a: WuxiaAction): WuxiaState {
    const error = (notice: string) => ({ ...s, notice, error: true });
    if (a.type === 'hydrate') {
        const saved = a.save ? parseWuxiaSave(a.save) : null;
        return { ...s, ...saved, ready: true, view: saved?.character ? 'intro' : saved?.introRead ? 'choose' : 'intro', storageIssue: a.issue ?? null, notice: saved?.character ? '继续上次历练，或重新查看入村指南。' : '本地教学模拟，所有真实 GitHub 操作由你自己完成。' };
    }
    if (!s.ready)
        return s;
    if (a.type === 'storage-error')
        return { ...s, storageIssue: a.issue };
    if (a.type === 'reset-save')
        return { ...initialWuxia(s.demo), ready: true };
    if (a.type === 'show-intro')
        return { ...s, view: 'intro' };
    if (a.type === 'intro')
        return { ...s, introRead: true, view: s.character ? 'map' : 'choose', currentChapter: null };
    if (a.type === 'character')
        return s.introRead ? { ...s, character: a.id } : s;
    if (a.type === 'motion')
        return { ...s, reducedMotion: a.reduced };
    if (a.type === 'bookmark' || a.type === 'review') {
        const key = a.type === 'bookmark' ? 'bookmarks' : 'review';
        return { ...s, [key]: s[key].includes(a.id) ? s[key].filter(id => id !== a.id) : [...s[key], a.id] };
    }
    if (a.type === 'map') {
        if (!s.character)
            return error('先选择同行角色。');
        const chapter = s.currentChapter;
        return { ...s, view: 'map', rewardFrom: chapter !== null && hasChapterAward(chapter, s.runs[chapter]) ? chapter : null, currentChapter: null, notice: chapter !== null && hasChapterAward(chapter, s.runs[chapter]) ? `${chapterLessons[chapter].reward} 已收入行囊。下一段道路已显现。` : '沿山道寻找当前地点。', error: false };
    }
    if (a.type === 'enter') {
        if (!s.character || !chapterLessons[a.chapter])
            return error('先选择角色并进入地图。');
        if (!s.demo && a.chapter > nextChapter(s))
            return error('前方仍有迷雾，先完成前一章。');
        return { ...s, view: 'chapter', currentChapter: a.chapter, rewardFrom: null, notice: chapterLessons[a.chapter].story, error: false };
    }
    const chapter = s.currentChapter;
    if (chapter === null || s.view !== 'chapter')
        return s;
    const run = s.runs[chapter] ?? freshChapter();
    if (a.type === 'undo' || a.type === 'restart') {
        const archives = runComplete(chapter, run.events) ? [...run.archives, run.events].slice(-3) : run.archives;
        return { ...s, runs: { ...s.runs, [chapter]: { ...run, archives, events: a.type === 'undo' ? run.events.slice(0, -1) : [] } }, notice: a.type === 'undo' ? '已撤销最后一个动作。已领取的奖励保留。' : '本章机关已复位，其他章节与历史奖励保留。', error: false };
    }
    if (a.type === 'act') {
        const m = replayChapter(chapter, run.events)!;
        const result = applyChapterEvent(chapter, m, a.event);
        if (result.error)
            return { ...error(result.error), runs: { ...s.runs, [chapter]: { ...run, mistakes: run.mistakes + 1 } } };
        return { ...s, runs: { ...s.runs, [chapter]: { ...run, events: result.model.history } }, notice: result.model.stage > m.stage ? result.model.evidence.at(-1)! : `${a.event.item} 已改变场景状态。继续观察下一件物件。`, error: false };
    }
    return s;
}
