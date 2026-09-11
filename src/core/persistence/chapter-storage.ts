import { z } from "zod";
import { chapterRunSchema, validChapterRun, hasChapterAward } from "@/core/game/chapter-games";
import { journeyConfig } from "@/config/journey";
export const WUXIA_STORAGE_KEY = journeyConfig.storageKey;
export const wuxiaSaveSchema = z.object({ version: z.literal(3), introRead: z.boolean(), character: z.enum(['xingzhou', 'zhiwei', 'atuan']).nullable(), runs: z.record(z.string(), chapterRunSchema), bookmarks: z.array(z.string()).max(500), review: z.array(z.string()).max(500), reducedMotion: z.boolean(), currentChapter: z.number().int().min(0).max(12).nullable() });
export type WuxiaSave = z.infer<typeof wuxiaSaveSchema>;
export const freshWuxiaSave = (): WuxiaSave => ({ version: 3, introRead: false, character: null, runs: {}, bookmarks: [], review: [], reducedMotion: false, currentChapter: null });
export function parseWuxiaSave(value: unknown): WuxiaSave | null { const result = wuxiaSaveSchema.safeParse(value); if (!result.success)
    return null; const s = result.data; if (s.character && !s.introRead)
    return null; if ((Object.keys(s.runs).length || s.currentChapter !== null) && !s.character)
    return null; for (const [id, run] of Object.entries(s.runs)) {
    if (!/^(?:[0-9]|1[0-2])$/.test(id) || !validChapterRun(Number(id), run))
        return null;
    for (let earlier = 0; earlier < Number(id); earlier++)
        if (!hasChapterAward(earlier, s.runs[earlier]))
            return null;
} return s; }
export function loadWuxiaSave(storage: Pick<Storage, 'getItem'>) { try {
    const raw = storage.getItem(WUXIA_STORAGE_KEY);
    if (!raw)
        return { save: null };
    const save = parseWuxiaSave(JSON.parse(raw));
    return { save, issue: save ? undefined : "存档校验失败，原记录保留。请导出原存档后检查。" };
}
catch {
    return { save: null, issue: "无法读取本项目存档；可以临时体验并导出进度。" };
} }
export function writeWuxiaSave(storage: Pick<Storage, 'setItem'>, save: WuxiaSave) { const valid = parseWuxiaSave(save); if (!valid)
    throw new Error('章节操作记录校验失败'); storage.setItem(WUXIA_STORAGE_KEY, JSON.stringify(valid)); }
