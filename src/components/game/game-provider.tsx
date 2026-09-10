"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gameReducer, initialGameState } from "@/core/game/reducer";
import type { GameAction, GameState } from "@/core/game/types";
import { loadGameState, saveGameState } from "@/core/persistence/storage";

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<GameAction> } | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const persistsProgress = pathname !== "/demo";
  return <GameStateProvider key={persistsProgress ? "persistent" : "demo"} persistsProgress={persistsProgress}>{children}</GameStateProvider>;
}

function GameStateProvider({ children, persistsProgress }: { children: ReactNode; persistsProgress: boolean }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const hydrationFinished = useRef(false);

  useEffect(() => {
    if (persistsProgress) {
      const stored = loadGameState();
      if (stored) dispatch({ type: "hydrate", state: stored });
    }
    queueMicrotask(() => {
      hydrationFinished.current = true;
    });
  }, [persistsProgress]);

  useEffect(() => {
    if (hydrationFinished.current && persistsProgress) saveGameState(state);
  }, [persistsProgress, state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside GameProvider");
  return context;
}
