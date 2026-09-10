import type { Metadata } from "next";
import { sponsorConfig } from "@/config/sponsor";

export const metadata: Metadata = { title: "支持项目" };

export default function SponsorPage() {
  const paymentImages = [
    sponsorConfig.alipayQrPath ? { label: "支付宝", path: sponsorConfig.alipayQrPath } : null,
    sponsorConfig.wechatQrPath ? { label: "微信支付", path: sponsorConfig.wechatQrPath } : null,
  ].filter((item): item is { label: string; path: string } => item !== null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-4xl font-black tracking-tight">{sponsorConfig.title}</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">{sponsorConfig.description}</p>
      {sponsorConfig.enabled && paymentImages.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {paymentImages.map((item) => (
            <figure key={item.label} className="rounded-2xl border bg-surface p-6 text-center">
              {/* Maintainer-provided local image paths are intentionally configurable. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.path} alt={`${item.label}自愿赞助二维码`} width="260" height="260" className="mx-auto aspect-square w-full max-w-[260px] rounded-[10px] object-contain" />
              <figcaption className="mt-4 font-semibold">{item.label}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border bg-surface p-8">
          <p className="text-2xl font-bold">赞助暂未开放</p>
          <p className="mt-3 leading-7 text-muted-foreground">{sponsorConfig.enabled ? "维护者已打开配置，但还没有提供真实付款素材。" : "配置默认关闭，仓库中没有虚假二维码。维护者可以在确认隐私风险后自行添加真实图片并更新配置。"}</p>
        </div>
      )}
      <p className="mt-8 rounded-[10px] bg-muted p-4 leading-7">{sponsorConfig.disclosure}</p>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">提醒维护者：个人收款二维码可能向付款者暴露真实姓名。请在启用前确认展示范围与当地规则。</p>
    </div>
  );
}
