import type { Page } from "@playwright/test";
export function winMarket(page: Page): Promise<void>;
export function playRegions(page: Page): Promise<void>;
export function playChapter(page: Page, chapter: number, options?: { keyboard?: boolean; reload?: boolean }): Promise<void>;
