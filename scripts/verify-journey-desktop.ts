import { _electron as electron, expect, type ElectronApplication, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { playJourneyChapter } from '../tests/helpers/journey-flow';
import { buildInputDigest } from './lib/build-inputs.mjs';
import { chapterLessons } from '../src/content/minigames/chapters';
const buildInfo = JSON.parse(await readFile('out/build-info.json', 'utf8'));
if (buildInfo.sourceDigest !== await buildInputDigest(process.cwd()))
    throw new Error('Desktop export is stale; run npm run desktop:build first.');
const require = createRequire(import.meta.url);
const appIndex = process.argv.indexOf('--app');
const executablePath = appIndex >= 0 ? path.resolve(process.argv[appIndex + 1]) : require('electron') as string;
const dir = path.resolve(process.env.GSV_VERIFICATION_DIR ?? 'artifacts/journey-desktop');
await mkdir(dir, { recursive: true });
const userData = await mkdtemp(path.join(tmpdir(), 'gsv-v3-desktop-'));
const started = Date.now();
const errors: string[] = [];
const requests: string[] = [];
let app: ElectronApplication | undefined;
let startupMs = 0;
let completed = 0;
const options = { executablePath, args: appIndex >= 0 ? [] : [path.resolve('desktop/main.mjs')], cwd: appIndex >= 0 ? userData : process.cwd(), env: { ...process.env, NODE_ENV: 'test', GSV_TEST_USER_DATA: userData, PATH: '/usr/bin:/bin' }, timeout: 30000 };
function observe(page: Page) { page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error')
    errors.push(m.text()); }); page.on('response', r => { if (r.status() >= 400)
    requests.push(`${r.status()} ${r.url()}`); }); }
try {
    app = await electron.launch(options);
    let page = await app.firstWindow();
    observe(page);
    await expect(page.getByRole('heading', { name: '先读路标，再入江湖。' })).toBeVisible();
    startupMs = Date.now() - started;
    assert.equal(await page.evaluate(() => location.protocol), 'village:');
    assert.equal(await page.evaluate(() => typeof (window as unknown as {
        require?: unknown;
    }).require), 'undefined');
    const preferences = await app.evaluate(({ BrowserWindow }) => { const web = BrowserWindow.getAllWindows()[0].webContents as unknown as {
        getLastWebPreferences: () => {
            sandbox: boolean;
            contextIsolation: boolean;
            nodeIntegration: boolean;
        };
    }; const p = web.getLastWebPreferences(); return { sandbox: p.sandbox, contextIsolation: p.contextIsolation, nodeIntegration: p.nodeIntegration }; });
    assert.deepEqual(preferences, { sandbox: true, contextIsolation: true, nodeIntegration: false });
    await app.context().setOffline(true);
    await page.screenshot({ path: path.join(dir, 'intro.png'), fullPage: true });
    await page.getByRole('button', { name: '开始选角' }).click();
    await page.getByRole('button', { name: '选择陆行舟', exact: true }).click();
    await page.getByRole('button', { name: '踏入江湖' }).click();
    for (let chapter = 0; chapter < 13; chapter++) {
        await page.getByRole('button', { name: `第 ${chapter} 章 · ${chapterLessons[chapter].title}`, exact: true }).click();
        await playJourneyChapter(page, chapter);
        completed++;
        await page.screenshot({ path: path.join(dir, `chapter-${chapter}.png`), fullPage: true });
        await expect(page.locator('.storage-warning')).toHaveCount(0);
        await page.getByRole('button', { name: `领取${chapterLessons[chapter].reward}，返回地图`, exact: true }).click();
        if (chapter === 0 || chapter === 7) {
            await app.close();
            app = await electron.launch(options);
            page = await app.firstWindow();
            observe(page);
            await app.context().setOffline(true);
            await page.getByRole('button', { name: '继续上次历练' }).click();
            await expect(page.locator('.place-pin.earned')).toHaveCount(chapter + 1);
        }
    }
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1024, 768));
    await page.screenshot({ path: path.join(dir, 'window-1024.png'), fullPage: true });
    await page.getByRole('button', { name: '武林宝典', exact: true }).click();
    await page.getByPlaceholder('例如 License、许可证').fill('Fork');
    await expect(page.locator('.book-entry')).toContainText('官方来源');
    await page.screenshot({ path: path.join(dir, 'book-1024.png'), fullPage: true });
    await page.keyboard.press('Escape');
    const before = await page.evaluate(() => localStorage.getItem('gsv:wuxia:v3'));
    await page.goto('village://app/adventure-demo/');
    await page.getByRole('button', { name: '准备演示角色' }).click();
    for (let chapter = 0; chapter < 13; chapter++) {
        await page.getByRole('combobox', { name: '自由探索章节' }).selectOption(String(chapter));
        await expect(page.locator('.chapter-hud h1')).toHaveText(chapterLessons[chapter].title);
        await page.getByRole('button', { name: '返回地图', exact: true }).click();
    }
    assert.equal(await page.evaluate(() => localStorage.getItem('gsv:wuxia:v3')), before);
    await page.goto('village://app/field-practice/');
    await expect(page.getByRole('heading', { name: '出师实战，只在自己的 Fork' })).toBeVisible();
    await page.getByRole('checkbox').first().check();
    await page.reload();
    await expect(page.getByRole('checkbox').first()).toBeChecked();
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    const result = { passed: true, platform: process.platform, arch: process.arch, packaged: appIndex >= 0, executablePath, userData, startupMs, completedChapters: completed, offline: true, restartRestoredAfter: [0, 7], demoIsolated: true, window1024: true, fieldPracticeSelfCheck: true, rendererIsolated: true, errors, requests, verifiedAt: new Date().toISOString(), note: '本机技术验证；未签名、公证、发布，未经过真实新手测试。' };
    await writeFile(path.join(dir, 'verification.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
}
catch (error) {
    await writeFile(path.join(dir, 'verification.json'), JSON.stringify({ passed: false, error: String(error), completedChapters: completed, errors, requests, verifiedAt: new Date().toISOString() }, null, 2));
    if (app) {
        const page = app.windows()[0];
        if (page)
            await page.screenshot({ path: path.join(dir, 'error.png'), fullPage: true }).catch(() => { });
    }
    throw error;
}
finally {
    if (app)
        await app.close().catch(() => { });
}
