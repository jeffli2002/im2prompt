import {
  buildConfig
} from "./chunk-DRVUBK5B.js";

// src/utils/config.ts
import * as fs from "fs/promises";
import * as path from "path";
import { pathToFileURL } from "url";
function findConfigFile() {
  return path.resolve("source.config.ts");
}
var cache = null;
async function compileConfig(configPath, outDir) {
  const { build } = await import("esbuild");
  const transformed = await build({
    entryPoints: [{ in: configPath, out: "source.config" }],
    bundle: true,
    outdir: outDir,
    target: "node18",
    write: true,
    platform: "node",
    format: "esm",
    packages: "external",
    outExtension: {
      ".js": ".mjs"
    },
    allowOverwrite: true
  });
  if (transformed.errors.length > 0) {
    throw new Error("failed to compile configuration file");
  }
}
async function loadConfig(configPath, outDir, hash, build = false) {
  if (cache && cache.hash === hash) {
    return await cache.config;
  }
  if (build) await compileConfig(configPath, outDir);
  const url = pathToFileURL(path.resolve(outDir, "source.config.mjs"));
  const config = import(`${url.href}?hash=${hash}`).then((loaded) => {
    const [err, config2] = buildConfig(
      // every call to `loadConfig` will cause the previous cache to be ignored
      loaded
    );
    if (err !== null) throw new Error(err);
    return config2;
  });
  cache = { config, hash };
  return await config;
}
async function getConfigHash(configPath) {
  const stats = await fs.stat(configPath).catch(() => void 0);
  if (stats) {
    return stats.mtime.getTime().toString();
  }
  throw new Error("Cannot find config file");
}

// src/utils/git-timestamp.ts
import path2 from "path";
import { x } from "tinyexec";
var cache2 = /* @__PURE__ */ new Map();
async function getGitTimestamp(file) {
  const cached = cache2.get(file);
  if (cached) return cached;
  try {
    const out = await x(
      "git",
      ["log", "-1", '--pretty="%ai"', path2.relative(process.cwd(), file)],
      {
        throwOnError: true
      }
    );
    const time = new Date(out.stdout);
    cache2.set(file, time);
    return time;
  } catch {
    return;
  }
}

export {
  findConfigFile,
  loadConfig,
  getConfigHash,
  getGitTimestamp
};
