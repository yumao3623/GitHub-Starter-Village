import { adventureSchema, parseAdventure, type AdventureSave } from "@/core/game/adventure";
import type { AdventureSave as PhaseASave } from "@/core/game/appraisal";

export const PHASE_A_STORAGE_KEY = "gsv:adventure:phase-a:v1";
export const ADVENTURE_STORAGE_KEY = "gsv:adventure:v2";
export function loadAdventure(storage: Pick<Storage, "getItem">): { save: AdventureSave | null; issue?: string } {
  try {
    // Newer corrupt/future saves must not silently fall back to an older record.
    const raw = storage.getItem(ADVENTURE_STORAGE_KEY) ?? storage.getItem(PHASE_A_STORAGE_KEY);
    if (!raw) return { save: null };
    const save = parseAdventure(JSON.parse(raw));
    return save ? { save } : { save: null, issue: "存档版本或内容无法识别。原记录未覆盖；请先导出备份，或确认后重置样板存档。" };
  } catch { return { save: null, issue: "无法读取本地存档，或存档已损坏。原记录未覆盖。可继续临时体验并导出当前进度。" }; }
}
export function serializeAdventure(state: AdventureSave | PhaseASave) {
  const parsed = parseAdventure(state);
  if (!parsed) throw new Error("存档未通过结构和依赖校验");
  return JSON.stringify(adventureSchema.parse(parsed), null, 2);
}
export function saveAdventure(storage: Pick<Storage, "setItem">, state: AdventureSave | PhaseASave) {
  storage.setItem(ADVENTURE_STORAGE_KEY, serializeAdventure(state));
}

export function readOriginalAdventure(storage: Pick<Storage, "getItem">) {
  return storage.getItem(ADVENTURE_STORAGE_KEY) ?? storage.getItem(PHASE_A_STORAGE_KEY);
}
export function backupAdventure(storage: Pick<Storage, "getItem" | "setItem">, reason: "import" | "reset") {
  const raw = readOriginalAdventure(storage);
  if (raw === null) return;
  const base = `${ADVENTURE_STORAGE_KEY}:before-${reason}`;
  let key = base; let index = 1;
  while (storage.getItem(key) !== null) key = `${base}:${index++}`;
  storage.setItem(key, raw);
}
