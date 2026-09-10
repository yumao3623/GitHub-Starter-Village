import { missionSchema } from "../src/content/schemas/mission";
import { vocabularyItemSchema } from "../src/content/schemas/vocabulary";
import { missions } from "../src/content/missions/zh-CN";
import { graduationQuiz } from "../src/content/quizzes/zh-CN/graduation";
import { p0TermIds, vocabulary } from "../src/content/vocabulary/zh-CN";
import { validateAdventureContent } from "../src/core/validation/adventure-content";

const officialHosts = new Set(["docs.github.com", "git-scm.com", "nodejs.org", "docs.npmjs.com"]);
const errors: string[] = validateAdventureContent();

function duplicates(values: string[]) {
  const seen = new Set<string>();
  return [...new Set(values.filter((value) => (seen.has(value) ? true : (seen.add(value), false))))];
}

for (const [index, item] of vocabulary.entries()) {
  const parsed = vocabularyItemSchema.safeParse(item);
  if (!parsed.success) errors.push(`vocabulary[${index}]: ${parsed.error.message}`);
}
for (const [index, item] of missions.entries()) {
  const parsed = missionSchema.safeParse(item);
  if (!parsed.success) errors.push(`missions[${index}]: ${parsed.error.message}`);
  for (const task of item.tasks) {
    if (task.correctIndex >= task.options.length) errors.push(`${task.id}: correctIndex 越界`);
  }
}

for (const id of duplicates(vocabulary.map((item) => item.id))) errors.push(`重复术语 ID: ${id}`);
for (const id of duplicates(missions.map((item) => item.id))) errors.push(`重复课程 ID: ${id}`);
for (const id of duplicates(missions.flatMap((item) => item.tasks.map((task) => task.id)))) errors.push(`重复任务 ID: ${id}`);

const termIds = new Set(vocabulary.map((item) => item.id));
const missionIds = new Set(missions.map((item) => item.id));
for (const term of vocabulary) {
  for (const lessonId of term.relatedLessonIds) {
    if (!missionIds.has(lessonId) && lessonId !== "capstone") errors.push(`${term.id}: 失效课程引用 ${lessonId}`);
  }
  if (["P0", "P1"].includes(term.priority) && !officialHosts.has(new URL(term.sourceUrl).hostname)) {
    errors.push(`${term.id}: P0/P1 来源不是认可的官方域名`);
  }
}
for (const item of missions) {
  for (const id of item.termIds) if (!termIds.has(id)) errors.push(`${item.id}: 未知术语 ${id}`);
  for (const task of item.tasks) for (const id of task.termIds) if (!termIds.has(id)) errors.push(`${task.id}: 未知术语 ${id}`);
}

const vocabularyEnglish = new Set(vocabulary.map((item) => item.english.toLocaleLowerCase("en")));
const uiAliases: Record<string, string> = {
  code: "code button",
  "two-factor authentication": "two-factor authentication (2fa)",
  tags: "tag",
  contributor: "contributor",
  "pull request": "pull request",
};
for (const item of missions) {
  for (const uiTerm of item.uiTerms) {
    const normalized = uiTerm.toLocaleLowerCase("en");
    const target = uiAliases[normalized] ?? normalized;
    if (!vocabularyEnglish.has(target)) errors.push(`${item.id}: UI 英文未解释 ${uiTerm}`);
  }
}

const interactiveTermIds = new Set(missions.flatMap((item) => item.tasks.flatMap((task) => task.termIds)));
for (const id of p0TermIds) if (!interactiveTermIds.has(id)) errors.push(`P0 缺少互动任务: ${id}`);
const graduationTermIds = new Set(graduationQuiz.map((item) => item.termId));
for (const id of p0TermIds) if (!graduationTermIds.has(id)) errors.push(`P0 未进入结业测试: ${id}`);

if (errors.length) {
  console.error(`内容校验失败，共 ${errors.length} 项：\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(`内容校验通过：${vocabulary.length} 个术语、${missions.length} 个章节、${graduationQuiz.length} 道 P0 结业题。`);
