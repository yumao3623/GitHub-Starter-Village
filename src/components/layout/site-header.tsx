import Link from "next/link";
import { navigation } from "@/config/navigation";
import { brandConfig } from "@/config/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 no-underline" aria-label={`${brandConfig.chineseName}首页`}>
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-foreground font-mono text-[11px] font-bold text-background">GSV</span>
          <span className="truncate font-semibold">{brandConfig.chineseName}</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm lg:flex" aria-label="主导航">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="text-muted-foreground no-underline hover:text-foreground">{item.label}</Link>)}
          <Link href="/about" className="text-muted-foreground no-underline hover:text-foreground">关于</Link>
        </nav>
        <details className="relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-[10px] border border-border bg-surface px-4 text-sm font-semibold">菜单</summary>
          <nav className="absolute end-0 top-12 w-56 rounded-2xl border bg-surface-raised p-2 shadow-[var(--shadow)]" aria-label="移动导航">
            {[...navigation, { href: "/about", label: "关于" }].map((item) => <Link key={item.href} href={item.href} className="block rounded-[10px] px-3 py-3 text-sm no-underline hover:bg-muted">{item.label}</Link>)}
          </nav>
        </details>
      </div>
    </header>
  );
}
