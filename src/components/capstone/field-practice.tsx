"use client";
import { useEffect, useReducer } from "react";
import { practiceSteps } from "@/content/scenarios/field-practice";
import { readPractice, writePractice } from "@/core/persistence/practice-storage";
export function FieldPractice() {
  const [{ checked, ready, warning }, update] = useReducer((state: { checked: string[]; ready: boolean; warning: string }, patch: Partial<typeof state>) => ({ ...state, ...patch }), { checked: [], ready: false, warning: "" });
  useEffect(() => {
    try { update({ checked: readPractice(localStorage), ready: true }); }
    catch { update({ warning: "原自查记录无法读取，未覆盖；本页可继续阅读。请先保留浏览器中的原记录。" }); }
  }, []);
  function toggle(id: string) {
    const next = checked.includes(id) ? checked.filter(item => item !== id) : [...checked, id];
    try { writePractice(localStorage, next); update({ checked: next }); }
    catch { update({ warning: "无法保存，请保留本页并手动记录；没有上传任何数据。" }); }
  }
  return <section className="mt-8 space-y-5" aria-label="真实实践自查">
    <p role="status">仅你自行确认：{checked.length} / {practiceSteps.length}。本项目没有验证任何真实 GitHub 操作。</p>
    {warning && <p role="alert">{warning}</p>}
    {practiceSteps.map((step, i) => <article key={step.id} className="rounded-xl border bg-card p-5"><h2 className="text-xl font-bold">{i + 1}. {step.title}</h2><p className="my-4 leading-8">{step.detail}</p><label className="flex gap-3"><input type="checkbox" disabled={!ready} checked={checked.includes(step.id)} onChange={() => toggle(step.id)}/>我已自行确认：{step.title}</label></article>)}
    {checked.length === practiceSteps.length && <p className="rounded-xl border p-5">真实实践自查已填完。它是你的学习记录，不是 GitHub 认证或自动核验结果；可以取消勾选重新核对。</p>}
  </section>;
}
