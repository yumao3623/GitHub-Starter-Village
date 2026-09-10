import { Badge } from "@/components/ui/badge";

export function JourneyPreview() {
  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-5 shadow-[var(--shadow)]" role="group" aria-label="游戏任务预览">
      <div className="flex items-center justify-between gap-4"><span className="font-mono text-xs text-muted-foreground">nightwalk-map</span><Badge>游戏模拟</Badge></div>
      <h2 className="mt-8 text-xl font-bold">Pull Request 不只是“拉取请求”</h2>
      <p className="mt-3 leading-7 text-muted-foreground">把它理解为“合并变更提案”：邀请维护者检查、讨论，并决定是否合并。</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[10px] border bg-background p-4"><span className="font-mono text-xs text-muted-foreground">BASE</span><p className="mt-2 font-semibold">main</p><p className="mt-1 text-sm text-muted-foreground">准备接收变更</p></div>
        <div className="rounded-[10px] border bg-background p-4"><span className="font-mono text-xs text-muted-foreground">COMPARE</span><p className="mt-2 font-semibold">fix/south-gate</p><p className="mt-1 text-sm text-muted-foreground">提供待合入变更</p></div>
      </div>
    </div>
  );
}
