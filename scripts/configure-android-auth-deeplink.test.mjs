import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("./configure-android-auth-deeplink.mjs", import.meta.url));

test("registers the Supabase callback on MainActivity and is idempotent", (t) => {
  const root = mkdtempSync(join(tmpdir(), "navodaya-android-deeplink-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const appDir = join(root, "android", "app", "src", "main");
  mkdirSync(appDir, { recursive: true });
  const manifestPath = join(appDir, "AndroidManifest.xml");
  writeFileSync(
    manifestPath,
    `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application><activity android:name=".MainActivity" android:exported="true"><intent-filter><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LAUNCHER" /></intent-filter></activity></application></manifest>`,
  );

  const run = () => spawnSync(process.execPath, [script, manifestPath], { encoding: "utf8" });
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  const patched = readFileSync(manifestPath, "utf8");
  assert.match(patched, /android:scheme="com\.navodaya\.vijeta" android:host="auth"/);
  assert.match(patched, /android:name="android\.intent\.action\.VIEW"/);
  assert.match(patched, /android:name="android\.intent\.category\.BROWSABLE"/);

  const second = run();
  assert.equal(second.status, 0, second.stderr);
  assert.equal(readFileSync(manifestPath, "utf8"), patched);
});
