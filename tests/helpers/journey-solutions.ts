import { chapterLessons } from '../../src/content/minigames/chapters';
import type { ChapterEvent } from '../../src/core/game/chapter-games';
export function editSolution(chapter: number, index: number) {
    if (chapter === 9)
        return 'fix/south-gate';
    if (chapter === 12 && index === 4)
        return 'v1.0.1';
    if (chapter === 10 && index === 0)
        return '# 江湖夜行图\n安全入口：南门\n路线：沿溪水前往客栈。';
    if (chapter === 11 && index === 3)
        return '安全入口：南门\n夜间请结伴通行';
    if (chapter === 11 && index === 5)
        return '安全入口：南门，18:00 开放';
    if (chapter === 10)
        return '修复南门入口描述，保留路线';
    return '本次修复南门入口描述，保留原有安全路线。';
}
export function chapterSolution(chapter: number): ChapterEvent[] { return chapterLessons[chapter].stages.flatMap((s, stage) => s.mode === 'edit' ? [{ stage, item: 'save', value: editSolution(chapter, stage) }] : s.mode === 'slider' ? [{ stage, item: 'deliver', value: '1' }] : (s.order ?? s.items).map(item => ({ stage, item, value: s.pairs?.[item] ?? '' }))); }
