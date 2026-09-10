import type { Metadata } from "next";
import { CapstoneChecklist } from "@/components/capstone/capstone-checklist";
import { ShareCardGenerator } from "@/components/share/share-card-generator";
import { GraduationQuiz } from "@/components/capstone/graduation-quiz";

export const metadata: Metadata = { title: "真实毕业任务" };
export default function CapstonePage() { return <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16"><h1 className="text-4xl font-black tracking-tight">回到自己的 Fork，完成真实闭环</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">先完成 P0 结业测试，再在自己的仓库内练习，避免给原项目制造无意义 Pull Request。每一步都先确认 Owner、Base 和 Compare。</p><div className="mt-10"><GraduationQuiz /></div><div className="mt-12"><CapstoneChecklist /></div><div className="mt-12"><ShareCardGenerator /></div></div>; }
