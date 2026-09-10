import Link from "next/link";
export default function NotFound() { return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><p className="font-mono text-primary">404</p><h1 className="mt-3 text-3xl font-black">地图上没有这条路</h1><p className="mt-4 text-muted-foreground">页面可能移动了，课程进度不会因此丢失。</p><Link href="/map" className="mt-7 inline-block font-semibold text-primary">回到村庄地图</Link></div>; }
