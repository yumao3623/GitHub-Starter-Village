import Link from "next/link";
import { brandConfig } from "@/config/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="max-w-3xl"><p className="font-semibold">{brandConfig.englishName}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{brandConfig.disclaimer}</p></div>
        <div className="flex flex-wrap content-start gap-x-5 gap-y-3 text-sm"><Link href="/about">关于</Link><Link href="/sponsor">支持项目</Link><Link href="/capstone">毕业任务</Link></div>
      </div>
    </footer>
  );
}
