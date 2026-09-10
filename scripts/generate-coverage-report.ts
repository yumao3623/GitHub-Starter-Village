import { writeFileSync } from "node:fs";
import { missions } from "../src/content/missions/zh-CN";
import { graduationQuiz } from "../src/content/quizzes/zh-CN/graduation";
import { vocabulary } from "../src/content/vocabulary/zh-CN";

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

> 由 \`npm run content:coverage\` 生成。生成日期：2026-09-10。

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
`;

writeFileSync("docs/curriculum/COVERAGE_REPORT.md", report);
console.log(report);

if (covered("P0", mainline) !== byPriority("P0").length || covered("P1", mainline) !== byPriority("P1").length) process.exit(1);
