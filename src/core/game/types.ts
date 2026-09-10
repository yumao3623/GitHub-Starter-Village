export type AssistMode = "full-chinese" | "bilingual" | "hover" | "challenge" | "free-explore";

export type TaskAttempt = {
  attempts: number;
  correct: boolean;
  selectedIndex: number;
};

export type GameState = {
  version: 1;
  assistMode: AssistMode;
  currentMissionId: string;
  completedMissionIds: string[];
  masteredP0TermIds: string[];
  taskAttempts: Record<string, TaskAttempt>;
  startedAt: string | null;
  elapsedSeconds: number;
};

export type GameAction =
  | { type: "hydrate"; state: GameState }
  | { type: "select-mission"; missionId: string }
  | { type: "set-assist-mode"; mode: AssistMode }
  | { type: "answer-task"; taskId: string; selectedIndex: number; correct: boolean; p0TermIds: string[] }
  | { type: "complete-mission"; missionId: string }
  | { type: "reset" };
