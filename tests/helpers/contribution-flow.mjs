import { expect } from "@playwright/test";
// Drive public controls only. Do not inject completed events or localStorage.
export async function winMarket(page) {
  await page.getByRole("button", { name: "选择女侠客沈知微" }).click();
  await page.getByRole("button", { name: "踏入江湖" }).click();
  await page.getByRole("button", { name: "集市鉴宝 可进入" }).click();
  for (const [project, verdict] of [["芦岸图", "适合当前委托"], ["云栈图", "不符合当前条件"], ["旧雾图", "信息不足，需核实"]]) {
    await page.getByRole("button", { name: `${project} 展开卷轴` }).click();
    for (const [tab, category] of [["Requirements 运行要求", "运行环境"], ["License 许可证", "使用条件"], ["Releases 发布版本", "维护线索"]]) {
      await page.getByRole("button", { name: tab, exact: true }).click();
      await page.getByRole("button", { name: "收集这条证据", exact: true }).click();
      await page.getByRole("button", { name: `放入${category}证据` }).click();
    }
    await page.getByRole("button", { name: verdict, exact: true }).click();
  }
  await page.getByRole("button", { name: "芦岸图 已鉴定" }).click();
  await page.getByRole("button", { name: "交付「芦岸图」作为推荐" }).click();
  await page.getByRole("button", { name: "查看解锁地图" }).click();
  await page.locator('[data-node-id="chapter-7"]').click();
}
export async function playChapter(page, chapter, { keyboard = false, reload = true } = {}) {
  const button = name => page.getByRole("button", { name, exact: true });
  const click = async name => { if (keyboard) { await button(name).focus(); await page.keyboard.press("Enter"); } else await button(name).click(); };
  const fill = (name, value) => page.getByLabel(name, { exact: true }).fill(value);
  const select = (name, value) => page.getByRole("combobox", { name, exact: true }).selectOption(value);
  const error = async name => { await click(name); await expect(page.locator(".chain-feedback")).toHaveClass(/error/); };
  const repeat = async name => { await click(name); await expect(page.locator(".chain-feedback")).toHaveClass(/info/); };
  const edit = async (text, message) => {
    await fill("README 工作区", text); await click("保存工作区修改"); await click("查看 Diff");
    await error("Stage notes.txt（无关便条）"); await click("Stage README.md");
    await fill("Commit message · 提交说明", message); await click("Commit 暂存快照"); await click("Push 修复分支");
  };
  await expect(page.locator(".chain-scene")).toHaveAttribute("data-chapter", String(chapter));
  if (chapter === 7) {
    await error("Submit new issue"); await click("Search 已有 Issues");
    await fill("Title · 议题标题", "修复南门入口标记"); await fill("实际结果", "README 写成北门"); await fill("期望结果", "应该显示南门");
    if (reload) { await page.reload(); await expect(page.getByLabel("Title · 议题标题", { exact:true })).toHaveValue("修复南门入口标记"); }
    await select("Label · 标签建议", "bug"); await click("Submit new issue"); await repeat("Submit new issue");
  } else if (chapter === 8) {
    await error("Pull 整合"); await select("目标远端", "upstream"); await click("Fetch 取信");
    await expect(page.locator(".postal-stations")).toContainText("u0"); await click("Pull 整合");
    await error("Push 送信"); await select("目标远端", "origin"); await click("Push 送信"); await repeat("Push 送信");
  } else if (chapter === 9) {
    await error("Commit 暂存快照"); await fill("Create branch · 修复分支名", "fix/south-gate"); await click("创建并切换 Branch");
    await edit("# 江湖夜行图\n安全入口：南门\n路线：沿溪水前往客栈。", "fix: correct south gate label"); await repeat("Push 修复分支");
  } else if (chapter === 10) {
    await error("Compare changes"); await select("Base · 接收方", "village/nightwalk-map:main"); await select("Head / Compare · 来源", "learner/nightwalk-map:fix/south-gate");
    await click("Compare changes"); await click("Create draft pull request"); await click("Ready for review"); await repeat("Ready for review");
  } else if (chapter === 11) {
    await error("Resolve conversation"); await click("打开 Review");
    await edit("# 江湖夜行图\n安全入口：南门\n路线：沿溪水前往客栈。\n夜间请结伴通行。", "docs: explain night route safety");
    await click("Resolve conversation"); await click("请求维护者复查");
    await fill("编辑合并结果", "安全入口：南门，18:00 开放"); await click("保存冲突处理结果"); await repeat("保存冲突处理结果");
  } else {
    await error("Merge pull request（模拟维护者）"); await click("Run workflow / Re-run");
    for (let i=0;i<3;i++) await click("执行下一 Step"); await expect(page.locator(".checks-result")).toContainText("failed");
    await click("查看失败日志"); await fill("Changelog · 发布草稿", "修复南门入口标记，并补充夜间通行的安全提示。"); await click("保存发布草稿");
    await click("Run workflow / Re-run"); for (let i=0;i<3;i++) await click("执行下一 Step");
    await expect(page.locator(".checks-result")).toContainText("passed"); await click("Merge pull request（模拟维护者）");
    await fill("Tag · 版本标签", "v1.0.1"); await fill("Release notes · 发布说明", "修复南门标记并补充夜间结伴通行说明。");
    await click("Publish release（模拟）"); await click("Delete branch"); await repeat("Delete branch");
  }
  await expect(page.locator(".chain-success")).toContainText(`第 ${chapter} 章交付完成`);
  if (reload) { await page.reload(); await expect(page.locator(".chain-success")).toContainText(`第 ${chapter} 章交付完成`); }
}
export async function playRegions(page) {
  const click = name => page.getByRole("button",{name,exact:true}).click();
  const fixtures = {
    guide: [["README","读项目说明"],["Release asset","安装桌面应用"],["Code → Clone","参与源码协作"]],
    safety: [["GitHub 密码","私人安全保管区"],["Recovery codes","私人安全保管区"],["陌生信件索要 2FA","拒绝并保留警惕"],["Sign in → github.com","只在官方站点继续"]],
    governance: [["README","入门说明"],["CONTRIBUTING","贡献步骤"],["LICENSE","使用授权"],["CODE_OF_CONDUCT","行为规范"],["SECURITY","漏洞报告渠道"]],
  };
  for(const id of ["guide","safety","follow","governance"]) {
    await click("返回江湖地图"); await page.locator(`[data-node-id="region-${id}"]`).click();
    await expect(page.locator('[data-region]')).toHaveAttribute('data-region',id);
    if(id==="safety") {
      await click("https://github.com.example.org/login"); await expect(page.locator('.chain-feedback')).toHaveClass(/error/);
      await click("https://github.com/login");
    }
    if(id==="follow") {
      await click("投递本批模拟信件"); await expect(page.locator('.chain-feedback')).toHaveClass(/error/);
      await page.getByRole('checkbox',{name:'Star · 收藏这个虚构项目'}).check(); await page.getByRole('checkbox',{name:'Follow · 关注虚构作者'}).check();
      await page.getByRole('combobox',{name:'Watch · 仓库订阅'}).selectOption('releases'); await click("投递本批模拟信件"); await click("投递本批模拟信件");
    } else {
      await click(fixtures[id][0][0]); await click(`放入${fixtures[id][1][1]}`);
      // Safety's first two cards share a safe destination; use an explicitly wrong channel there.
      if(id==='safety') await click('放入拒绝并保留警惕');
      await expect(page.locator('.chain-feedback')).toHaveClass(/error/);
      for(const [card,target] of fixtures[id]) { await page.getByRole('button',{name:new RegExp(`^${card.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}( · 已归位)?$`)}).click(); await click(`放入${target}`); }
      if(id==='governance') { await click('送往公开 Issue'); await expect(page.locator('.chain-feedback')).toHaveClass(/error/); await click('按 SECURITY 私密报告'); await click('按 SECURITY 私密报告'); }
      else await click(`放入${fixtures[id].at(-1)[1]}`);
    }
    await expect(page.locator('.chain-feedback')).toHaveClass(/info/);
    await expect(page.locator('.chain-success')).toContainText('历练完成'); await page.reload(); await expect(page.locator('.chain-success')).toContainText('历练完成');
  }
}
