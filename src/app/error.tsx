"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-3xl font-black">这条路暂时走不通</h1><p className="mt-4 text-muted-foreground">你的本地进度仍保存在浏览器中。可以重试，或回到村庄地图选择其他章节。</p><Button className="mt-7" onClick={reset}>重新尝试</Button></div>; }
