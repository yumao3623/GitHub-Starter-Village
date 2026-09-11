import { writeFileSync } from "node:fs";
import { missions } from "../src/content/missions/zh-CN";
import { graduationQuiz } from "../src/content/quizzes/zh-CN/graduation";
import { vocabulary } from "../src/content/vocabulary/zh-CN";
import { contributionMissions } from "../src/content/minigames/contribution-lessons";
import { contributionGuidanceIds } from "../src/content/vocabulary/zh-CN/contribution-review";
import { regionLessons } from "../src/content/minigames/region-lessons";

import { chapterLessons } from "../src/content/minigames/chapters";
const journeyTerms=new Set(chapterLessons.flatMap(l=>l.stages.flatMap(s=>s.termIds)));
const mainline = new Set(missions.flatMap((item) => item.termIds));
const interactive = new Set(missions.flatMap((item) => item.tasks.flatMap((task) => task.termIds)));
const graduation = new Set(graduationQuiz.map((item) => item.termId));
const byPriority = (priority: "P0" | "P1" | "P2") => vocabulary.filter((item) => item.priority === priority);
const percent = (value: number, total: number) => `${total ? ((value / total) * 100).toFixed(1) : "100.0"}%`;
const covered = (priority: "P0" | "P1" | "P2", index: Set<string>) => byPriority(priority).filter((item) => index.has(item.id)).length;

const rows = (["P0", "P1", "P2"] as const).map((priority) => {
  const items = byPriority(priority);
  return `| ${priority} | ${items.length} | ${covered(priority, mainline)} | ${percent(covered(priority, mainline), items.length)} | ${covered(priority, interactive)} | ${covered(priority, graduation)} |`;
});

const report = `# 课程覆盖报告

> 由 \`npm run content:coverage\` 生成。内容版本日期：2026-09-11。

| 权重 | 术语总数 | 主线覆盖 | 主线覆盖率 | 互动覆盖 | 结业测试覆盖 |
| --- | ---: | ---: | ---: | ---: | ---: |
${rows.join("\n")}

## 结论

- P0 主线覆盖率：${percent(covered("P0", mainline), byPriority("P0").length)}。
- P1 主线覆盖率：${percent(covered("P1", mainline), byPriority("P1").length)}。
- P0 互动覆盖率：${percent(covered("P0", interactive), byPriority("P0").length)}。
- P0 结业测试覆盖率：${percent(covered("P0", graduation), byPriority("P0").length)}。
- 主线章节：${missions.length} 个，从第零章到第十三章。

## 未覆盖项

${vocabulary.filter((item) => item.priority !== "P2" && !mainline.has(item.id)).map((item) => `- ${item.priority} ${item.english}`).join("\n") || "无。"}

## 解释

“主线覆盖”表示术语出现在章节的明确学习范围中；“互动覆盖”表示术语至少由一道可操作的场景题覆盖；“结业测试覆盖”只对 P0 强制。P2 只要求进入可搜索词典，不阻塞毕业。

## 本次 13 章页游主线

- 独立章节：${chapterLessons.length}；操作绑定词条：${journeyTerms.size}。
- P0 操作覆盖：${percent(covered("P0",journeyTerms),byPriority("P0").length)}；P1 操作覆盖：${percent(covered("P1",journeyTerms),byPriority("P1").length)}。
- 以上仅表示内容存在操作绑定，不代表玩家掌握或真实新手验证。

## 武侠阶段 C：单独统计，不混算掌握率

- 连续操作场景：${contributionMissions.map(item => item.chapter).join("、")}。
- 场景明确引用词条：${new Set(contributionMissions.flatMap(item=>item.termIds)).size} 个。
- 逐条改写操作说明与误区：${contributionGuidanceIds.length} 个词条，全部具有官方来源。
- 区域支线：${Object.values(regionLessons).map(item=>item.title).join("、")}。
- 上方旧版 14 章结构覆盖率不代表武侠版 P0 独立掌握率。新小游戏记录操作结果，不自动给旧版结业题加分、不授予真实 GitHub 认证。
- UI 对照与模拟边界见 [阶段 C 教学审读](PHASE_C_REVIEW.md)，真正通关证据见 [阶段 C 验收](../product/PHASE_C_PROGRESS.md)。
`;

writeFileSync("docs/curriculum/COVERAGE_REPORT.md", report);
console.log(report);

if (covered("P0", mainline) !== byPriority("P0").length || covered("P1", mainline) !== byPriority("P1").length) process.exit(1);
