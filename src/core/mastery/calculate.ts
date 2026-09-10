import { p0TermIds } from "@/content/vocabulary/zh-CN";
import type { GameState } from "@/core/game/types";

export function getP0Mastery(state: GameState) {
  const mastered = new Set(state.masteredP0TermIds);
  const count = p0TermIds.filter((id) => mastered.has(id)).length;
  return { count, total: p0TermIds.length, ratio: p0TermIds.length ? count / p0TermIds.length : 1 };
}

export function isGraduate(state: GameState) {
  return state.completedMissionIds.length === 14 && getP0Mastery(state).ratio === 1;
}
