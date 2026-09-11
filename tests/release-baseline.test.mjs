import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("release baseline includes CI, controlled production deployment, and generated Worker types", async () => {
  const [ci, deploy, wrangler, packageJson] = await Promise.all([
    readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8"),
    readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  assert.match(ci, /npm run check/);
  assert.match(deploy, /workflow_dispatch/);
  assert.match(deploy, /environment: production/);
  assert.match(deploy, /d1 migrations apply sada-social-db --remote/);
  assert.match(wrangler, /"compatibility_date": "2026-09-11"/);
  assert.match(wrangler, /"nodejs_compat"/);
  assert.match(wrangler, /"observability"/);
  assert.equal(packageJson.scripts.typecheck, "tsc --noEmit");
  await access(new URL("../worker-configuration.d.ts", import.meta.url));
});
