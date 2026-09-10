import { p0TermIds, vocabularyById } from "@/content/vocabulary/zh-CN";

export const graduationQuiz = p0TermIds.map((termId) => {
  const term = vocabularyById.get(termId);
  if (!term) throw new Error(`Missing P0 term: ${termId}`);
  const correctIndex = [...termId].reduce((sum, character) => sum + character.codePointAt(0)!, 0) % 2;
  const correct = term.beginnerMeaning;
  const distractor = term.commonMistakes[0];
  return {
    id: `graduation-${termId}`,
    termId,
    prompt: `关于 ${term.english}，哪个理解更准确？`,
    options: correctIndex === 0 ? [correct, distractor] : [distractor, correct],
    correctIndex,
  };
});
