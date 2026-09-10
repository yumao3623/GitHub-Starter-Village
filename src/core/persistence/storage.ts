import { z } from "zod";
import { curriculumConfig } from "@/config/curriculum";
import type { GameState } from "@/core/game/types";

const stateSchema = z.object({
  version: z.literal(1),
  assistMode: z.enum(["full-chinese", "bilingual", "hover", "challenge", "free-explore"]),
  currentMissionId: z.string(),
  completedMissionIds: z.array(z.string()),
  masteredP0TermIds: z.array(z.string()),
  taskAttempts: z.record(z.string(), z.object({ attempts: z.number(), correct: z.boolean(), selectedIndex: z.number() })),
  startedAt: z.string().nullable(),
  elapsedSeconds: z.number(),
});

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(curriculumConfig.storageKey);
    if (!raw) return null;
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState) {
  localStorage.setItem(curriculumConfig.storageKey, JSON.stringify(state));
}

export function clearGameState() {
  localStorage.removeItem(curriculumConfig.storageKey);
}
