import { z } from "zod";
import { practiceSteps } from "@/content/scenarios/field-practice";
export const PRACTICE_KEY = "gsv:field-practice:v1";
const schema = z.object({ version: z.literal(1), checked: z.array(z.string()).refine(ids => new Set(ids).size === ids.length && ids.every(id => practiceSteps.some(step => step.id === id))) });
export function readPractice(storage: Pick<Storage, "getItem">) {
  const raw = storage.getItem(PRACTICE_KEY);
  if (!raw) return [];
  return schema.parse(JSON.parse(raw)).checked;
}
export function writePractice(storage: Pick<Storage, "setItem">, checked: string[]) {
  storage.setItem(PRACTICE_KEY, JSON.stringify(schema.parse({ version: 1, checked })));
}
