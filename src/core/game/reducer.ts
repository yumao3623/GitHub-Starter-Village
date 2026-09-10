import type { GameAction, GameState } from "@/core/game/types";

export const initialGameState: GameState = {
  version: 1,
  assistMode: "full-chinese",
  currentMissionId: "chapter-4",
  completedMissionIds: [],
  masteredP0TermIds: [],
  taskAttempts: {},
  startedAt: null,
  elapsedSeconds: 0,
};

const unique = (items: string[]) => [...new Set(items)];

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "select-mission":
      return {
        ...state,
        currentMissionId: action.missionId,
        startedAt: state.startedAt ?? new Date().toISOString(),
      };
    case "set-assist-mode":
      return { ...state, assistMode: action.mode };
    case "answer-task": {
      const previous = state.taskAttempts[action.taskId];
      return {
        ...state,
        startedAt: state.startedAt ?? new Date().toISOString(),
        taskAttempts: {
          ...state.taskAttempts,
          [action.taskId]: {
            attempts: (previous?.attempts ?? 0) + 1,
            correct: action.correct,
            selectedIndex: action.selectedIndex,
          },
        },
        masteredP0TermIds: action.correct
          ? unique([...state.masteredP0TermIds, ...action.p0TermIds])
          : state.masteredP0TermIds,
      };
    }
    case "complete-mission":
      return { ...state, completedMissionIds: unique([...state.completedMissionIds, action.missionId]) };
    case "reset":
      return initialGameState;
  }
}
