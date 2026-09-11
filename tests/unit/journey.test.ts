import { describe, it, expect } from 'vitest';
import { initialWuxia, wuxiaReducer, nextChapter, earnedChapters } from '@/core/game/wuxia';
import { chapterLessons } from '@/content/minigames/chapters';
import { chapterScenes } from '@/content/scenarios/chapter-scenes';
import { parseWuxiaSave, WUXIA_STORAGE_KEY, writeWuxiaSave, loadWuxiaSave } from '@/core/persistence/chapter-storage';
import { replayChapter, runComplete } from '@/core/game/chapter-games';
import { vocabulary } from '@/content/vocabulary/zh-CN';
import { chapterSolution } from '../helpers/journey-solutions';
function start(demo = false) { let s = wuxiaReducer(initialWuxia(demo), { type: 'hydrate', save: null }); s = wuxiaReducer(s, { type: 'intro' }); return wuxiaReducer(s, { type: 'character', id: 'xingzhou' }); }
describe('approved thirteen-chapter journey', () => {
    it('requires intro and character before map; no future chapter bypass', () => { let s = wuxiaReducer(initialWuxia(), { type: 'hydrate', save: null }); expect(s.view).toBe('intro'); s = wuxiaReducer(s, { type: 'character', id: 'atuan' }); expect(s.character).toBeNull(); s = wuxiaReducer(s, { type: 'map' }); expect(s.view).toBe('intro'); s = wuxiaReducer(s, { type: 'intro' }); expect(s.view).toBe('choose'); s = wuxiaReducer(s, { type: 'character', id: 'atuan' }); s = wuxiaReducer(s, { type: 'map' }); s = wuxiaReducer(s, { type: 'enter', chapter: 12 }); expect(s.view).toBe('map'); expect(s.error).toBe(true); });
    it('all chapters have distinct mechanics, linked scene contract and monotonic map positions', () => { expect(chapterLessons.map(l => l.chapter)).toEqual(Array.from({ length: 13 }, (_, i) => i)); expect(new Set(chapterLessons.map(l => l.mechanic)).size).toBe(13); chapterScenes.forEach((s, i) => { expect(s.parentMapRegionId).toBe(`region-${i}`); expect(s.interactiveHotspots.length).toBeGreaterThanOrEqual(3); expect(s.walkableGround.length).toBeGreaterThan(0); expect(s.npcAnchors.length).toBeGreaterThan(0); if (i)
        expect(s.mapAnchor.x).toBeGreaterThan(chapterScenes[i - 1].mapAnchor.x); }); });
    it('every new term exists; all P0/P1 bind to chapter actions', () => { const ids = new Set(vocabulary.map(t => t.id)); const used = new Set(chapterLessons.flatMap(l => l.stages.flatMap(s => s.termIds))); for (const id of used)
        expect(ids.has(id), id).toBe(true); for (const t of vocabulary.filter(t => t.priority !== 'P2'))
        expect(used.has(t.id), t.id).toBe(true); });
    for (let chapter = 0; chapter < 13; chapter++)
        it(`chapter ${chapter}: causal operations, error recovery, undo, reward and restart`, () => { let s = start(true); s = wuxiaReducer(s, { type: 'enter', chapter }); const solutions = chapterSolution(chapter); expect(solutions.length).toBeGreaterThanOrEqual(3); s = wuxiaReducer(s, { type: 'act', event: { stage: 0, item: 'invalid', value: 'invalid' } }); expect(s.error).toBe(true); expect(s.runs[chapter].events).toHaveLength(0); for (const event of solutions) {
            s = wuxiaReducer(s, { type: 'act', event });
            expect(s.error, s.notice).toBe(false);
        } expect(runComplete(chapter, s.runs[chapter].events)).toBe(true); expect(earnedChapters(s)).toContain(chapter); s = wuxiaReducer(s, { type: 'undo' }); expect(runComplete(chapter, s.runs[chapter].events)).toBe(false); expect(earnedChapters(s)).toContain(chapter); s = wuxiaReducer(s, { type: 'act', event: solutions.at(-1)! }); expect(s.error).toBe(false); s = wuxiaReducer(s, { type: 'restart' }); expect(s.runs[chapter].events).toHaveLength(0); expect(earnedChapters(s)).toContain(chapter); });
    it('partial progress saves after every action, reload resumes and unlocks only next', () => { let s = start(); const memory = new Map<string, string>(); const storage = { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => { memory.set(k, v); } }; for (let chapter = 0; chapter < 13; chapter++) {
        expect(nextChapter(s)).toBe(chapter);
        s = wuxiaReducer(s, { type: 'enter', chapter });
        for (const event of chapterSolution(chapter)) {
            s = wuxiaReducer(s, { type: 'act', event });
            writeWuxiaSave(storage, s);
            const saved = loadWuxiaSave(storage).save;
            expect(saved).not.toBeNull();
            expect(saved?.runs[chapter].events).toEqual(s.runs[chapter].events);
        }
        s = wuxiaReducer(s, { type: 'map' });
        expect(s.rewardFrom).toBe(chapter);
    } expect(earnedChapters(s)).toHaveLength(13); const restored = wuxiaReducer(initialWuxia(), { type: 'hydrate', save: loadWuxiaSave(storage).save }); expect(restored.view).toBe('intro'); expect(earnedChapters(restored)).toHaveLength(13); expect(memory.has(WUXIA_STORAGE_KEY)).toBe(true); });
    it('corrupt, out of order and forged future progress cannot become formal saves', () => { const s = start(true); const future = { ...s, runs: { 12: { events: chapterSolution(12), archives: [], mistakes: 0 } } }; expect(parseWuxiaSave(future)).toBeNull(); expect(replayChapter(0, [{ stage: 2, item: '阅读中文 README', value: '' }])).toBeNull(); expect(loadWuxiaSave({ getItem: () => '{broken' }).issue).toBeTruthy(); });
    it('demonstration can enter any chapter while formal progress remains untouched', () => { const formal = start(); const before = JSON.stringify(formal); let demo = start(true); demo = wuxiaReducer(demo, { type: 'enter', chapter: 12 }); demo = wuxiaReducer(demo, { type: 'act', event: chapterSolution(12)[0] }); expect(demo.currentChapter).toBe(12); expect(JSON.stringify(formal)).toBe(before); });
    it('blank or irrelevant edit and unremoved conflict markers cannot pass', () => { for (const ch of [9, 10, 11, 12]) {
        const events = chapterSolution(ch);
        for (const [i, e] of events.entries())
            if (e.item === 'save') {
                expect(replayChapter(ch, [...events.slice(0, i), { ...e, value: '' }])).toBeNull();
            }
    } });
});
