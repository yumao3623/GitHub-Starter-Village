import path from "node:path";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export function resolveAsset(root, requestUrl, scheme = "village", host = "app") {
  try {
    const url = new URL(requestUrl);
    if (url.protocol !== `${scheme}:` || url.hostname !== host || url.port || url.username || url.password) return null;
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.includes("\\") || pathname.includes("\0")) return null;
    if (pathname.endsWith("/")) pathname += "index.html";
    else if (!path.extname(pathname)) pathname += "/index.html";
    const asset = path.resolve(root, `.${pathname}`);
    const relative = path.relative(root, asset);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
    return asset;
  } catch { return null; }
}

export function allowedExternal(rawUrl, hosts) {
  try { const url = new URL(rawUrl); return url.protocol === "https:" && !url.username && !url.password && !url.port && hosts.includes(url.hostname); }
  catch { return false; }
}
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".ico": "image/x-icon" };
export function contentSecurityPolicy(html = "") {
  // Next.js static hydration scripts are trusted at build time, not arbitrary unsafe-inline scripts.
  const hashes = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].filter(match => match[1]).map(match => `'sha256-${createHash("sha256").update(match[1]).digest("base64")}'`);
  return `default-src 'self'; script-src 'self' ${hashes.join(" ")}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'`;
}
export async function serveAsset(root, request, config) {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const asset = resolveAsset(root, request.url, config.scheme, config.host);
  if (!asset) return new Response("Forbidden", { status: 403 });
  try {
    const buffer = await readFile(asset);
    const ext = path.extname(asset);
    return new Response(request.method === "HEAD" ? null : buffer, { headers: {
      "Content-Type": types[ext] ?? "application/octet-stream", "X-Content-Type-Options": "nosniff",
      "Content-Length": String(buffer.byteLength),
      "Content-Security-Policy": contentSecurityPolicy(ext === ".html" ? buffer.toString("utf8") : ""),
    } });
  } catch { return new Response("Not found", { status: 404 }); }
}
