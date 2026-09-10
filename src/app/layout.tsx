import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { brandConfig } from "@/config/brand";
import { SiteFrame } from "@/components/layout/site-frame";

export const metadata: Metadata = {
  title: { default: brandConfig.chineseName, template: `%s | ${brandConfig.chineseName}` },
  description: brandConfig.tagline,
  metadataBase: new URL(brandConfig.websiteUrl),
  openGraph: { title: brandConfig.chineseName, description: brandConfig.tagline, type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f3ef" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body className="min-h-[100dvh] antialiased">
        <SiteFrame header={<SiteHeader />} footer={<SiteFooter />}>{children}</SiteFrame>
      </body>
    </html>
  );
}
