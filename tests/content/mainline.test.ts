import { describe, expect, it } from 'vitest';
import { chapterLessons } from '@/content/minigames/chapters';
import { mainlineProfiles, mainlineProfileByChapter } from '@/content/minigames/mainline';

describe('Phase C mainline content', () => {
  it('maps every configured adventure chapter to a unique scene and mechanic', () => {
    expect(mainlineProfiles).toHaveLength(13);
    expect(mainlineProfiles.map(p => p.chapter)).toEqual(chapterLessons.map(l => l.chapter));
    expect(new Set(mainlineProfiles.map(p => p.sceneCell)).size).toBe(13);
    expect(new Set(mainlineProfiles.map(p => p.kind)).size).toBe(13);
    expect(mainlineProfiles.every(p => p.tagline && p.playPattern && p.clearLine)).toBe(true);
    expect(mainlineProfileByChapter.get(12)?.kind).toBe('release');
  });
});
