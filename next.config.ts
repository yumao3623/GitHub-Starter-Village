import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(process.env.GSV_VERIFY_BUILD === "1" ? { distDir: ".next-verify" } : {}),
  ...(process.env.GSV_DESKTOP_EXPORT === "1" ? { output: "export" as const, trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default nextConfig;
