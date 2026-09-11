import { describe, it, expect } from "vitest";
import { PRACTICE_KEY, readPractice, writePractice } from "@/core/persistence/practice-storage";
describe("own-Fork self-check persistence", () => {
  it("round trips only known self-reported items, never GitHub verification", () => {
    const map = new Map<string,string>();
    const storage = { getItem: (key:string) => map.get(key) ?? null, setItem: (key:string,value:string) => { map.set(key,value); } };
    expect(readPractice(storage)).toEqual([]); writePractice(storage,["fork","branch"]);
    expect(readPractice(storage)).toEqual(["fork","branch"]);
    expect(() => writePractice(storage,["verified-by-github"])).toThrow();
    const saved = map.get(PRACTICE_KEY); expect(() => writePractice(storage,["fork","fork"])).toThrow(); expect(map.get(PRACTICE_KEY)).toBe(saved);
    storage.setItem(PRACTICE_KEY,'{"version":99,"checked":[]}'); expect(() => readPractice(storage)).toThrow(); expect(map.get(PRACTICE_KEY)).toContain('99');
  });
});
