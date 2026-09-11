import { z } from "zod";
import { lessonByChapter } from "@/content/minigames/chapters";
export const chapterEventSchema = z.object({ stage: z.number().int().min(0).max(15), item: z.string().max(180), value: z.string().max(3000) });
export type ChapterEvent = z.infer<typeof chapterEventSchema>;
export const chapterRunSchema = z.object({ events: z.array(chapterEventSchema).max(200), archives: z.array(z.array(chapterEventSchema).max(200)).max(3), mistakes: z.number().int().nonnegative() });
export type ChapterRun = z.infer<typeof chapterRunSchema>;
export const freshChapter = (): ChapterRun => ({ events: [], archives: [], mistakes: 0 });
export type ChapterModel = {
    stage: number;
    placed: Record<string, string>;
    steps: string[];
    evidence: string[];
    history: ChapterEvent[];
};
export const freshModel = (): ChapterModel => ({ stage: 0, placed: {}, steps: [], evidence: [], history: [] });
export function applyChapterEvent(chapter: number, m: ChapterModel, e: ChapterEvent): {
    model: ChapterModel;
    error?: string;
} {
    const lesson = lessonByChapter.get(chapter);
    const s = lesson?.stages[m.stage];
    const fail = (reason: string) => ({ model: m, error: `${reason} 已完成的物件保留；改正后重试，或撤销上一步。` });
    if (!s || e.stage !== m.stage)
        return fail("当前机关尚未就绪，先完成高亮目标。");
    if (m.steps.includes(e.item))
        return fail("这件物件已经处理，不重复记功。");
    let needed = 1;
    if (s.mode === 'explore') {
        if (!s.items.includes(e.item))
            return fail("这是普通装饰，不是目标路标。请寻找带英文名称的物件。");
        needed = s.items.length;
    }
    if (s.mode === 'place') {
        if (!s.pairs?.[e.item] || s.pairs[e.item] !== e.value)
            return fail(`「${e.item || '尚未选择物件'}」不能送到「${e.value}」。先看物件上的用途线索；${s.evidence}`);
        needed = s.items.length;
    }
    if (s.mode === 'sequence') {
        if (s.order?.[m.steps.length] !== e.item)
            return fail(`线路还停在「${s.order?.[m.steps.length]}」。先完成它，后面的机关才有输入。`);
        needed = s.order!.length;
    }
    if (s.mode === 'edit') {
        if (e.item !== 'save' || (s.contains ?? []).some(part => !e.value.includes(part)) || (s.forbidden ?? []).some(part => e.value.includes(part)) || e.value.trim().length < (s.min ?? 0))
            return fail(s.instruction);
        if (chapter === 9 && !/^fix\/[a-z0-9-]{3,40}$/.test(e.value))
            return fail("分支名用 fix/ 加英文短名，例如 fix/south-gate。");
        if (chapter === 12 && m.stage === 4 && !/^v\d+\.\d+\.\d+$/.test(e.value))
            return fail("Tag 使用 v1.0.1 这样的版本格式。");
    }
    if (s.mode === 'slider' && (e.item !== 'deliver' || e.value !== '1'))
        return fail("委托只收 Releases；0 没有版本信，2 还会带来普通 Issue 信。把滑杆移到 1 后投递。");
    const steps = [...m.steps, e.item];
    const complete = steps.length >= needed;
    return { model: { stage: m.stage + Number(complete), placed: complete ? {} : { ...m.placed, [e.item]: e.value || e.item }, steps: complete ? [] : steps, evidence: complete ? [...m.evidence, s.evidence] : m.evidence, history: [...m.history, e] } };
}
export function replayChapter(chapter: number, events: ChapterEvent[]): ChapterModel | null { let m = freshModel(); for (const e of events) {
    const next = applyChapterEvent(chapter, m, e);
    if (next.error)
        return null;
    m = next.model;
} return m; }
export function runComplete(chapter: number, events: ChapterEvent[]) { return replayChapter(chapter, events)?.stage === lessonByChapter.get(chapter)?.stages.length; }
export function hasChapterAward(chapter: number, run?: ChapterRun) { return !!run && (runComplete(chapter, run.events) || run.archives.some(events => runComplete(chapter, events))); }
export function validChapterRun(chapter: number, run: ChapterRun) { return lessonByChapter.has(chapter) && replayChapter(chapter, run.events) !== null && run.archives.every(events => replayChapter(chapter, events) !== null); }
