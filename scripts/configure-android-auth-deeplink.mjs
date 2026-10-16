import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const manifestPath = resolve(process.argv[2] ?? "android/app/src/main/AndroidManifest.xml");
const scheme = "com.navodaya.vijeta";
const host = "auth";
const deepLinkFilter = `
        <intent-filter>
          <action android:name="android.intent.action.VIEW" />
          <category android:name="android.intent.category.DEFAULT" />
          <category android:name="android.intent.category.BROWSABLE" />
          <data android:scheme="${scheme}" android:host="${host}" />
        </intent-filter>`;

const manifest = await readFile(manifestPath, "utf8");
if (manifest.includes(`android:scheme="${scheme}"`) && manifest.includes(`android:host="${host}"`)) {
  console.log("Supabase auth deep link is already registered.");
  process.exit(0);
}

const mainActivity = [...manifest.matchAll(/<activity\b[^>]*>[\s\S]*?<\/activity>/g)].find((match) =>
  /\bMainActivity\b/.test(match[0]),
);
if (!mainActivity) {
  throw new Error(`Could not find the MainActivity block in ${manifestPath}`);
}

const updatedActivity = mainActivity[0].replace("</activity>", `${deepLinkFilter}\n      </activity>`);
await writeFile(manifestPath, manifest.replace(mainActivity[0], updatedActivity), "utf8");
console.log(`Registered ${scheme}://${host}/callback for Supabase auth callbacks.`);
