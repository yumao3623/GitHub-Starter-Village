"use client";
import { useEffect, useRef, type Dispatch, type RefObject } from "react";
import type { AdventureAction } from "@/core/game/adventure";

export function useAdventurePresence(root: RefObject<HTMLDivElement | null>, enabled: boolean, dispatch: Dispatch<AdventureAction>) {
  useEffect(() => {
    let previous = performance.now();
    let active = document.visibilityState === "visible" && document.hasFocus();
    let lastInput = previous;
    const input = () => { lastInput = performance.now(); };
    const flush = () => {
      const now = performance.now();
      if (enabled && active && now - lastInput < 60000) dispatch({ type: "active-time", milliseconds: Math.min(5000, now - previous) });
      previous = now;
    };
    const visibility = () => {
      flush(); active = document.visibilityState === "visible" && document.hasFocus();
      if (root.current) root.current.dataset.paused = String(!active);
    };
    const timer = window.setInterval(flush, 5000);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("focus", visibility); window.addEventListener("blur", visibility);
    window.addEventListener("pointerdown", input); window.addEventListener("keydown", input);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", visibility); window.removeEventListener("focus", visibility); window.removeEventListener("blur", visibility); window.removeEventListener("pointerdown", input); window.removeEventListener("keydown", input); };
  }, [root, enabled, dispatch]);
}

// Original, synthesized feedback; opt-in and quiet. No downloaded audio assets.
export function useFeedbackSound(enabled: boolean) {
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => () => { void audio.current?.close(); }, []);
  useEffect(() => {
    const play = (event: MouseEvent) => {
    if (!(event.target instanceof Element) || !event.target.closest(".adventure button")) return;
    if (!enabled || document.hidden) return;
    try {
      const context = audio.current ?? (audio.current = new AudioContext());
      void context.resume().then(() => {
        const oscillator = context.createOscillator(); const gain = context.createGain();
        oscillator.type = "sine"; oscillator.frequency.setValueAtTime(660, context.currentTime);
        gain.gain.setValueAtTime(0.018, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
        oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.13);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      }).catch(() => {});
    } catch { /* Audio unavailable: all tasks remain usable. */ }
    };
    document.addEventListener("click", play);
    return () => document.removeEventListener("click", play);
  }, [enabled]);
}
