/** Domain adapters own state transitions; UI emits intents, never outcome flags. */
export interface MinigameAdapter<State, Intent, Rule> {
  initialState: () => State;
  apply: (state: State, intent: Intent) => State;
  satisfies: (state: State, rule: Rule) => boolean;
}

/** Shared goal evaluation is pure and repeatable. Animation cannot grant completion. */
export function evaluateGoals<State, Rule>(state: State, goals: ReadonlyArray<{ id: string; predicate: Rule }>, satisfies: (state: State, rule: Rule) => boolean): string[] {
  return goals.filter(goal => satisfies(state, goal.predicate)).map(goal => goal.id);
}
