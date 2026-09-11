import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { artifactName, downloadSection, sha256, verifyArtifact } from "../../scripts/lib/distribution.mjs";
test("unpublished downloads never produce fake clickable links", () => {
  const text = downloadSection({ repositoryUrl: "https://github.com/OWNER/project" }, { status: "unpublished", releaseTag: null, targets: [{ platform: "darwin", arch: "arm64", label: "Mac", public: false }] }, "Village", "1.0.0");
  assert.ok(!text.includes("](https://github.com"));
  assert.ok(text.includes("暂未开放公开下载"));
  assert.equal(artifactName("Village", "1.0.0", "darwin", "arm64"), "Village-1.0.0-darwin-arm64.zip");
});
test("artifact validation rejects tampering and traversal", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "gsv-hash-test-"));
  const file = path.join(dir, "app.zip"); const manifest = path.join(dir, "artifact.json");
  await writeFile(file, "example");
  const info = { schemaVersion: 1, filename: "app.zip", bytes: 7, sha256: await sha256(file) };
  await writeFile(manifest, JSON.stringify(info)); await verifyArtifact(manifest);
  await writeFile(file, "changed"); await assert.rejects(verifyArtifact(manifest), /SHA-256/);
  await writeFile(manifest, JSON.stringify({ ...info, filename: "../app.zip" })); await assert.rejects(verifyArtifact(manifest), /不合法/);
});
