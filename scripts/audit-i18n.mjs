#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = "/Users/ahmet/Documents/Playground";
const appRoot = path.join(repoRoot, "app");
const copySource = fs.readFileSync(path.join(repoRoot, "lib/copy.ts"), "utf8");
const localeCodes = [...copySource.matchAll(/code: "([a-z]+)"/g)].map((match) => match[1]);

function walkPages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "api" || entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkPages(fullPath));
    } else if (entry.isFile() && entry.name === "page.tsx") {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function summarizePage(source) {
  const importsServerLanguage = source.includes("getServerLanguage");
  const hasAllConfiguredLocales = localeCodes.every((code) => source.includes(`${code}:`));
  const hasTrOnlyFallback =
    /language === "tr"|const tr =|[\s:(?]tr\s*\?/.test(source) &&
    !localeCodes.filter((code) => code !== "tr" && code !== "en").some((code) => source.includes(`${code}:`));
  const hasInlineJsxText = /<h1|<h2|<h3|<p|<span|<strong|<label/.test(source);

  let status = "needs-review";
  if (importsServerLanguage && hasAllConfiguredLocales) status = "multi-locale";
  else if (hasTrOnlyFallback) status = "tr-en-only";
  else if (!importsServerLanguage && hasInlineJsxText) status = "hardcoded-copy";

  return status;
}

const pages = walkPages(appRoot).map((file) => ({
  file: path.relative(repoRoot, file),
  status: summarizePage(fs.readFileSync(file, "utf8"))
}));

const grouped = pages.reduce((acc, page) => {
  acc[page.status] ??= [];
  acc[page.status].push(page.file);
  return acc;
}, {});

console.log(`Configured locales: ${localeCodes.length} -> ${localeCodes.join(", ")}`);
console.log(`Scanned pages: ${pages.length}`);

for (const status of ["multi-locale", "tr-en-only", "hardcoded-copy", "needs-review"]) {
  const files = grouped[status] ?? [];
  console.log(`\n[${status}] ${files.length}`);
  for (const file of files) {
    console.log(`- ${file}`);
  }
}
