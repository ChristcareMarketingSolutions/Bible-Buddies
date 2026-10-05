// Copies the website (the folder above android-app) into www/, which is what
// the Android app shows. Run before every app build: `npm run sync`.
import { cpSync, rmSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "..", "..");
const out = join(here, "..", "www");

// Not needed inside the app (tools, docs and large unused media).
const SKIP_TOP = new Set(["android-app", ".github", ".git", "google-apps-script", "tools", "README.md",
  "sitemap.xml", "robots.txt", "node_modules"]);
const SKIP_FILE = /\.(mp4|webm|psd|md)$/i;
const SKIP_NAMES = new Set(["Moses.gif", "Moses.png", "images (1).png"]);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
let files = 0, bytes = 0;
for (const name of readdirSync(site)) {
  if (SKIP_TOP.has(name) || name.startsWith(".")) continue;
  cpSync(join(site, name), join(out, name), {
    recursive: true,
    filter: src => {
      const base = src.split(/[\\/]/).pop();
      if (statSync(src).isDirectory()) return true;
      if (SKIP_FILE.test(base) || SKIP_NAMES.has(base)) return false;
      files++; bytes += statSync(src).size; return true;
    }
  });
}
console.log(`Copied ${files} files (${(bytes / 1048576).toFixed(1)} MB) from ${relative(process.cwd(), site) || "."} to www/`);
