import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { chapterLessons } from '../../src/content/minigames/chapters';
import { editSolution } from './journey-solutions';
/** Operates the public UI. Never seeds localStorage or dispatches reducer actions. */
export async function playJourneyChapter(page: Page, chapter: number) {
    const lesson = chapterLessons[chapter];
    await expect(page.locator('.chapter-canvas')).toHaveAttribute('data-chapter', String(chapter));
    for (const [index, stage] of lesson.stages.entries()) {
        await expect(page.locator('.chapter-operation h2')).toHaveText(stage.title);
        if (stage.mode === 'edit') {
            await page.getByRole('textbox', { name: stage.title, exact: true }).fill(editSolution(chapter, index));
            await page.getByRole('button', { name: '保存并验印', exact: true }).click();
        }
        else if (stage.mode === 'slider') {
            const slider = page.getByRole('slider', { name: 'Watch 通知风铃' });
            await slider.focus();
            await slider.press('Home');
            await slider.press('ArrowRight');
            await page.getByRole('button', { name: '投递并检查信箱' }).click();
        }
        else
            for (const item of stage.order ?? stage.items) {
                await page.getByRole('button', { name: item, exact: true }).click();
                if (stage.mode === 'place')
                    await page.getByRole('button', { name: `放入${stage.pairs![item]}`, exact: true }).click();
            }
        await expect(page.locator('.chapter-feedback')).not.toHaveClass(/error/);
    }
    await expect(page.locator('.scene-reward h2')).toHaveText(lesson.reward);
}
