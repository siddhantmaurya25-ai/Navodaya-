import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const REQUIRED_CAPACITOR_UTILITIES = [
  "flex",
  "grid",
  "fixed",
  "absolute",
  "relative",
  "z-30",
  "bottom-0",
  "min-h-dvh",
  "bg-paper",
  "text-ink",
];

export function missingCapacitorUtilities(css) {
  return REQUIRED_CAPACITOR_UTILITIES.filter((utility) => {
    const escaped = utility.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return !new RegExp(`\\.${escaped}(?=[{,:\\s])`).test(css);
  });
}

export function checkCapacitorCss(assetsDir = resolve(process.cwd(), "www", "assets")) {
  const cssFiles = readdirSync(assetsDir).filter((file) => file.endsWith(".css"));
  if (!cssFiles.length) throw new Error(`No production CSS files found in ${assetsDir}`);

  const css = cssFiles.map((file) => readFileSync(resolve(assetsDir, file), "utf8")).join("\n");
  const missing = missingCapacitorUtilities(css);
  if (missing.length) throw new Error(`Missing critical Capacitor CSS utilities: ${missing.join(", ")}`);
  return { cssFiles, utilities: REQUIRED_CAPACITOR_UTILITIES.length };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  try {
    const result = checkCapacitorCss();
    console.log(`Verified ${result.utilities} critical layout utilities in ${result.cssFiles.length} Capacitor CSS file(s).`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
