import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { allowedExternal, contentSecurityPolicy, resolveAsset, serveAsset } from "../../desktop/protocol.mjs";
test("static scheme maps only permitted paths", () => {
  assert.equal(resolveAsset("/bundle", "village://app/adventure/"), "/bundle/adventure/index.html");
  assert.equal(resolveAsset("/bundle", "village://app/_next/static/test.js?q=1"), "/bundle/_next/static/test.js");
  for (const url of ["https://app/a", "village://evil/a", "village://app/%2e%2e%2fsecret", "village://app/a%5csecret", "village://user@app/a", "village://app/a%00", "village://app/%GG"]) assert.equal(resolveAsset("/bundle", url), null);
});
test("official external links only, no executable or deceptive URLs", () => {
  assert.equal(allowedExternal("https://docs.github.com/en", ["docs.github.com"]), true);
  for (const url of ["file:///etc/passwd", "javascript:alert(1)", "https://docs.github.com.evil.test/", "https://evil@docs.github.com/", "http://docs.github.com/"]) assert.equal(allowedExternal(url, ["docs.github.com"]), false);
});
test("CSP hashes hydration scripts without allowing arbitrary JS evaluation", () => {
  const csp = contentSecurityPolicy("<script>hello()</script>");
  assert.match(csp, /sha256-/); assert.doesNotMatch(csp, /unsafe-eval/); assert.match(csp, /connect-src 'self'/);
  assert.doesNotMatch(csp.split("script-src")[1].split(";")[0], /unsafe-inline/);
});
test("serves route and returns correct failure responses", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "gsv-protocol-test-"));
  await mkdir(path.join(root, "adventure")); await writeFile(path.join(root, "adventure/index.html"), "<h1>test</h1>");
  const config = { scheme: "village", host: "app" };
  const response = await serveAsset(root, { url: "village://app/adventure/", method: "GET" }, config);
  assert.equal(response.status, 200); assert.match(response.headers.get("content-type"), /text\/html/);
  const head = await serveAsset(root, { url: "village://app/adventure/", method: "HEAD" }, config);
  assert.equal(head.status, 200); assert.equal(await head.text(), "");
  assert.equal(head.headers.get("content-length"), String(Buffer.byteLength("<h1>test</h1>")));
  assert.equal((await serveAsset(root, { url: "village://app/missing/", method: "GET" }, config)).status, 404);
  assert.equal((await serveAsset(root, { url: "village://app/adventure/", method: "POST" }, config)).status, 405);
});
