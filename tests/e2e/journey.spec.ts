import { test, expect } from '@playwright/test';
import { chapterLessons } from '../../src/content/minigames/chapters';
import { playJourneyChapter } from '../helpers/journey-flow';

async function waitForVisualAssets(page: import('@playwright/test').Page) {
    await page.evaluate(async () => {
        const images = Array.from(document.images);
        await Promise.all(images.map(image => image.decode?.().catch(() => undefined)));
        if (document.fonts?.ready) await document.fonts.ready;
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
}

test('all thirteen chapters, persistence, animated map, keyboard, book and demo isolation', async ({ page }) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error')
        errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '先读路标，再入江湖。' })).toBeVisible();
    await page.screenshot({ path: 'artifacts/journey/01-intro.png', fullPage: true });
    await page.getByRole('button', { name: '开始选角' }).click();
    await expect(page.getByRole('button', { name: '踏入江湖' })).toBeDisabled();
    await page.getByRole('button', { name: '选择沈知微', exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.screenshot({ path: 'artifacts/journey/02-character.png', fullPage: true });
    await page.getByRole('button', { name: '踏入江湖' }).click();
    await expect(page.locator('.jianghu-fog')).toHaveCount(1);
    await waitForVisualAssets(page);
    await page.screenshot({ path: 'artifacts/journey/03-locked-map.png', fullPage: true });
    for (let chapter = 0; chapter < 13; chapter++) {
        await page.getByRole('button', { name: `第 ${chapter} 章 · ${chapterLessons[chapter].title}`, exact: true }).click();
        if (chapter === 0) {
            await page.getByRole('button', { name: '调查普通石灯' }).click();
            await expect(page.locator('.chapter-feedback')).toHaveClass(/error/);
            await page.getByRole('button', { name: 'README', exact: true }).focus();
            await page.keyboard.press('Enter');
            await page.getByRole('button', { name: '撤销', exact: true }).click();
            const actor = page.locator('.scene-actor');
            const before = await actor.boundingBox();
            await page.locator('.chapter-panorama').focus();
            await page.keyboard.press('ArrowRight');
            await expect.poll(async () => (await actor.boundingBox())!.x).toBeGreaterThan(before!.x);
        }
        await expect.poll(async () => page.locator('.scene-actor img').evaluate(e => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0)).toBe(true);
        await waitForVisualAssets(page);
        await page.screenshot({ path: `artifacts/journey/chapter-${chapter}.png`, fullPage: true });
        await playJourneyChapter(page, chapter);
        if (chapter === 5) {
            await page.getByRole('button', { name: '武林宝典', exact: true }).click();
            await page.getByPlaceholder('例如 License、许可证').fill('Fork');
            await expect(page.locator('.book-entry')).toContainText('非字面理解');
            await expect(page.locator('.book-entry')).toContainText('易混淆');
            await page.getByRole('button', { name: '加入书签', exact: true }).click();
            await page.getByRole('button', { name: '加入待复习', exact: true }).click();
            await page.screenshot({ path: 'artifacts/journey/book.png', fullPage: true });
            await page.keyboard.press('Escape');
            await expect(page.getByRole('button', { name: '武林宝典', exact: true })).toBeFocused();
        }
        await page.getByRole('button', { name: `领取${chapterLessons[chapter].reward}，返回地图`, exact: true }).click();
        if (chapter === 0) {
            await expect(page.locator('.jianghu-fog.revealing')).toHaveCount(1);
            await expect(page.locator('.map-traveller')).toHaveCSS('animation-name', 'walk-road');
            await page.screenshot({ path: 'artifacts/journey/04-revealing.png', fullPage: true });
            await expect.poll(async () => page.locator('.jianghu-fog.revealing').evaluate(e => Number(getComputedStyle(e).opacity))).toBeLessThan(.02);
            await waitForVisualAssets(page);
        }
        if (chapter === 7) {
            await page.reload();
            await page.getByRole('button', { name: '继续上次历练', exact: true }).click();
            await expect(page.locator('.place-pin.earned')).toHaveCount(8);
        }
    }
    await expect(page.locator('.place-pin.earned')).toHaveCount(13);
    await waitForVisualAssets(page);
    await page.screenshot({ path: 'artifacts/journey/05-full-map.png', fullPage: true });
    await expect(page.locator('.storage-warning')).toHaveCount(0);
    const saved = await page.evaluate(() => localStorage.getItem('gsv:wuxia:v3'));
    await page.goto('/adventure-demo/');
    await page.getByRole('button', { name: '准备演示角色' }).click();
    const names = await page.getByRole('combobox', { name: '自由探索章节' }).locator('option').allTextContents();
    expect(names.slice(1)).toEqual(chapterLessons.map(l => `第 ${l.chapter} 章 · ${l.title}`));
    for (let i = 0; i < 13; i++) {
        await page.getByRole('combobox', { name: '自由探索章节' }).selectOption(String(i));
        await expect(page.locator('.chapter-hud h1')).toHaveText(chapterLessons[i].title);
        await expect(page.getByRole('combobox', { name: '自由探索章节' })).toHaveCount(0);
        await page.getByRole('button', { name: '返回地图', exact: true }).click();
    }
    expect(await page.evaluate(() => localStorage.getItem('gsv:wuxia:v3'))).toBe(saved);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.getByRole('combobox', { name: '自由探索章节' }).selectOption('11');
    await expect(page.locator('.chapter-operation h2')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1024);
    await page.screenshot({ path: 'artifacts/journey/06-desktop-1024.png', fullPage: true });
    await page.getByRole('button', { name: '行囊', exact: true }).click();
    await page.getByLabel('减少动态效果').check();
    await expect(page.locator('.wuxia-v3')).toHaveAttribute('data-reduced-motion', 'true');
    expect(errors).toEqual([]);
});
