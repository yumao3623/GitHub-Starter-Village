import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const url = new URL(process.env.GSV_TEST_URL ?? "http://localhost:3000");
if (!["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("只录制本地演示，不访问账号或线上用户数据。");
const directory = path.resolve("artifacts/phase-d/recording");
await mkdir(directory, { recursive:true });
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport:{width:1440,height:900}, recordVideo:{dir:directory,size:{width:1440,height:900}} });
  const page = await context.newPage();
  await page.goto(new URL("/adventure-demo/",url).href);
  await page.getByLabel("演示场景",{exact:true}).waitFor();
  for (const scene of ["choose","map","market","chapter-9","chapter-12","ending"]) {
    await page.getByLabel("演示场景",{exact:true}).selectOption(scene);
    await page.waitForTimeout(2500); // Deliberate shot hold for the recording, not test synchronization.
  }
  await context.close();
  const video = await page.video().path();
  await writeFile(path.join(directory,"recording.json"),JSON.stringify({video,fixture:true,realPlayer:false,uploaded:false,recordedAt:new Date().toISOString()},null,2));
  console.log(video);
} finally { await browser.close(); }
