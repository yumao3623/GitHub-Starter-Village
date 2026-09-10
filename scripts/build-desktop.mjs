import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], { stdio: "inherit", env: { ...process.env, GSV_DESKTOP_EXPORT: "1" } });
process.exit(result.status ?? 1);
