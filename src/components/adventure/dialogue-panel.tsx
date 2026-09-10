import { dialogueById } from "@/content/story";
import type { AdventureState, AdventureAction } from "@/core/game/adventure";
import { Button } from "@/components/ui/button";

export function DialoguePanel({ id, state, dispatch }: { id: string; state: AdventureState; dispatch: React.Dispatch<AdventureAction> }) {
  const dialogue = dialogueById(id);
  if (!dialogue) return null;
  const cursor = state.journey.dialogues[id] ?? { index: 0, dismissed: false };
  const act = (operation: "next" | "previous" | "dismiss" | "replay") => dispatch({ type: "dialogue", id, operation });
  return <section className="story-dialogue" aria-label={`${dialogue.speaker}的对话`}>
    <span className="npc-name">{dialogue.role} · {dialogue.speaker}</span>
    {cursor.dismissed ? <Button variant="ghost" onClick={() => act("replay")}>回看委托对话</Button> : <>
      <p aria-live="polite">{dialogue.lines[cursor.index]}</p>
      <div className="dialogue-controls"><small>{cursor.index + 1} / {dialogue.lines.length}</small>
        <Button variant="ghost" disabled={cursor.index === 0} onClick={() => act("previous")}>上一句</Button>
        <Button variant="ghost" disabled={cursor.index === dialogue.lines.length - 1} onClick={() => act("next")}>下一句</Button>
        <Button variant="ghost" onClick={() => act("dismiss")}>收起对话</Button>
      </div>
    </>}
  </section>;
}
