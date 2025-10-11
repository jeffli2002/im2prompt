import {
  findConfigFile,
  getConfigHash,
  getGitTimestamp,
  loadConfig
} from "../chunk-SXOJYWZ3.js";
import {
  ValidationError,
  validate
} from "../chunk-OTM6WYMS.js";
import "../chunk-DRVUBK5B.js";
import {
  fumaMatter
} from "../chunk-KVWX6THC.js";

// src/map/index.ts
import * as path2 from "path";
import * as fs2 from "fs/promises";

// src/map/generate.ts
import * as path from "path";
import * as fs from "fs/promises";
import { glob } from "tinyglobby";

// src/utils/get-type-from-path.ts
import { extname } from "path";
var docTypes = [".mdx", ".md"];
var metaTypes = [".json", ".yaml"];
function getTypeFromPath(path4) {
  const ext = extname(path4);
  if (docTypes.includes(ext)) return "doc";
  if (metaTypes.includes(ext)) return "meta";
}

// src/map/file-cache.ts
import { LRUCache } from "lru-cache";
var map = new LRUCache({
  max: 200
});
var fileCache = {
  read(namespace, path4) {
    return map.get(`${namespace}.${path4}`);
  },
  write(namespace, path4, data) {
    map.set(`${namespace}.${path4}`, data);
  },
  removeCache(path4) {
    for (const key of map.keys()) {
      const keyPath = key.slice(key.indexOf(".") + 1);
      if (keyPath === path4) map.delete(key);
    }
  }
};

// src/map/generate.ts
import { load } from "js-yaml";
async function readFileWithCache(file) {
  const cached = fileCache.read("read-file", file);
  if (cached) return cached;
  return (await fs.readFile(file)).toString();
}
async function generateJS(configPath, config, importPath, configHash = false) {
  let asyncInit = false;
  const lines = [
    getImportCode({
      type: "named",
      names: ["_runtime"],
      specifier: "fumadocs-mdx"
    }),
    getImportCode({
      type: "namespace",
      specifier: toImportPath(configPath, importPath),
      name: "_source"
    })
  ];
  const entries = Array.from(config.collections.entries());
  async function getDocEntries(collectionName, files) {
    const items = files.map(async (file, i) => {
      const importId = `${collectionName}_${i}`;
      const params = [`collection=${collectionName}`];
      if (configHash) {
        params.push(`hash=${configHash}`);
      }
      lines.unshift(
        getImportCode({
          type: "namespace",
          name: importId,
          specifier: `${toImportPath(file.absolutePath, importPath)}?${params.join("&")}`
        })
      );
      return `{ info: ${JSON.stringify(file)}, data: ${importId} }`;
    });
    return Promise.all(items);
  }
  async function getMetaEntries(collection, files) {
    const items = files.map(async (file) => {
      const source = await readFileWithCache(file.absolutePath).catch(() => "");
      let data = source.length === 0 ? {} : parseMetaEntry(file.absolutePath, source);
      if (collection?.schema) {
        data = await validate(
          collection.schema,
          data,
          {
            source,
            path: file.absolutePath
          },
          `invalid data in ${file.absolutePath}`
        );
      }
      return JSON.stringify({
        info: file,
        data
      });
    });
    return Promise.all(items);
  }
  async function getAsyncEntries(collection, files) {
    if (!asyncInit) {
      lines.unshift(
        getImportCode({
          type: "named",
          specifier: "fumadocs-mdx/runtime/async",
          names: ["_runtimeAsync", "buildConfig"]
        }),
        "const [err, _sourceConfig] = buildConfig(_source)",
        "if (!_sourceConfig) throw new Error(err)"
      );
      asyncInit = true;
    }
    const entries2 = files.map(async (file) => {
      const parsed = fumaMatter(
        await readFileWithCache(file.absolutePath).catch(() => "")
      );
      let data = parsed.data;
      if (collection.schema) {
        data = await validate(
          collection.schema,
          parsed.data,
          { path: file.absolutePath, source: parsed.content },
          `invalid frontmatter in ${file.absolutePath}`
        );
      }
      let lastModified;
      if (config.global?.lastModifiedTime === "git") {
        lastModified = await getGitTimestamp(file.absolutePath);
      }
      return JSON.stringify({
        info: file,
        lastModified,
        data,
        content: parsed.content
      });
    });
    return Promise.all(entries2);
  }
  const declares = entries.map(async ([k, collection]) => {
    if (collection.type === "docs") {
      const docs = await getCollectionFiles(collection.docs);
      const metas = await getCollectionFiles(collection.meta);
      const metaEntries = (await getMetaEntries(collection.meta, metas)).join(
        ", "
      );
      if (collection.docs.async) {
        const docsEntries2 = (await getAsyncEntries(collection.docs, docs)).join(
          ", "
        );
        return `export const ${k} = _runtimeAsync.docs<typeof _source.${k}>([${docsEntries2}], [${metaEntries}], "${k}", _sourceConfig)`;
      }
      const docsEntries = (await getDocEntries(k, docs)).join(", ");
      return `export const ${k} = _runtime.docs<typeof _source.${k}>([${docsEntries}], [${metaEntries}])`;
    }
    const files = await getCollectionFiles(collection);
    if (collection.type === "doc" && collection.async) {
      return `export const ${k} = _runtimeAsync.doc<typeof _source.${k}>([${(await getAsyncEntries(collection, files)).join(", ")}], "${k}", _sourceConfig)`;
    }
    return `export const ${k} = _runtime.${collection.type}<typeof _source.${k}>([${(await getDocEntries(k, files)).join(", ")}]);`;
  });
  const resolvedDeclares = await Promise.all(declares);
  return [
    `// @ts-nocheck -- skip type checking`,
    ...lines,
    ...resolvedDeclares
  ].join("\n");
}
async function getCollectionFiles(collection) {
  const files = /* @__PURE__ */ new Map();
  const dirs = Array.isArray(collection.dir) ? collection.dir : [collection.dir];
  await Promise.all(
    dirs.map(async (dir) => {
      const result = await glob(collection.files ?? "**/*", {
        cwd: path.resolve(dir),
        absolute: true
      });
      for (const item of result) {
        if (getTypeFromPath(item) !== collection.type) continue;
        files.set(item, {
          path: path.relative(dir, item),
          absolutePath: item
        });
      }
    })
  );
  return Array.from(files.values());
}
function getImportCode(info) {
  const specifier = JSON.stringify(info.specifier);
  if (info.type === "default") return `import ${info.name} from ${specifier}`;
  if (info.type === "namespace")
    return `import * as ${info.name} from ${specifier}`;
  if (info.type === "named") {
    const names = info.names.map(
      (name) => Array.isArray(name) ? `${name[0]} as ${name[1]}` : name
    );
    return `import { ${names.join(", ")} } from ${specifier}`;
  }
  return `import ${specifier}`;
}
function toImportPath(file, config) {
  const ext = path.extname(file);
  const filename = ext === ".ts" ? file.substring(0, file.length - ext.length) : file;
  let importPath;
  if ("relativeTo" in config) {
    importPath = path.relative(config.relativeTo, filename);
    if (!path.isAbsolute(importPath) && !importPath.startsWith(".")) {
      importPath = `./${importPath}`;
    }
  } else {
    importPath = path.resolve(filename);
  }
  return importPath.replaceAll(path.sep, "/");
}
function parseMetaEntry(file, content) {
  const extname3 = path.extname(file);
  try {
    if (extname3 === ".json") return JSON.parse(content);
    if (extname3 === ".yaml") return load(content);
  } catch (e) {
    throw new Error(`Failed to parse meta file: ${file}.`, {
      cause: e
    });
  }
  throw new Error(`Unknown meta file format: ${extname3}, in ${file}.`);
}

// src/map/index.ts
async function start(dev, configPath, outDir) {
  let configHash = await getConfigHash(configPath);
  let config = await loadConfig(configPath, outDir, configHash, true);
  const outPath = path2.resolve(outDir, `index.ts`);
  async function updateMapFile() {
    const start2 = performance.now();
    try {
      await fs2.writeFile(
        outPath,
        await generateJS(
          configPath,
          config,
          { relativeTo: outDir },
          configHash
        )
      );
    } catch (err) {
      if (err instanceof ValidationError) {
        console.error(err.toStringFormatted());
      } else {
        console.error(err);
      }
    }
    console.log(`[MDX] updated map file in ${performance.now() - start2}ms`);
  }
  await updateMapFile();
  if (dev) {
    const { watcher } = await import("../watcher-4NDMOH4R.js");
    const instance = watcher(configPath, config, [outPath]);
    instance.on("ready", () => {
      console.log("[MDX] started dev server");
    });
    instance.on("all", (event, file) => {
      if (typeof file !== "string") return;
      const absolutePath = path2.resolve(file);
      const onUpdate = async () => {
        const isConfigFile = absolutePath === configPath;
        if (isConfigFile) {
          configHash = await getConfigHash(configPath);
          config = await loadConfig(configPath, outDir, configHash, true);
        }
        if (event === "change") fileCache.removeCache(absolutePath);
        await updateMapFile();
      };
      void onUpdate();
    });
    process.on("exit", () => {
      console.log("[MDX] closing dev server");
      void instance.close();
    });
  }
}

// src/next/create.ts
var defaultPageExtensions = ["mdx", "md", "jsx", "js", "tsx", "ts"];
function createMDX({
  configPath = findConfigFile(),
  outDir = ".source"
} = {}) {
  const isDev = process.argv.includes("dev");
  const isBuild = process.argv.includes("build");
  if ((isDev || isBuild) && process.env._FUMADOCS_MDX !== "1") {
    process.env._FUMADOCS_MDX = "1";
    void start(isDev, configPath, outDir);
  }
  return (nextConfig = {}) => {
    const mdxLoaderOptions = {
      configPath,
      outDir
    };
    return {
      ...nextConfig,
      turbopack: {
        ...nextConfig?.turbopack,
        rules: {
          ...nextConfig?.turbopack?.rules,
          // @ts-expect-error -- safe
          "*.{md,mdx}": {
            loaders: [
              {
                loader: "fumadocs-mdx/loader-mdx",
                options: mdxLoaderOptions
              }
            ],
            as: "*.js"
          }
        }
      },
      pageExtensions: nextConfig.pageExtensions ?? defaultPageExtensions,
      webpack: (config, options) => {
        config.resolve ||= {};
        config.module ||= {};
        config.module.rules ||= [];
        config.module.rules.push({
          test: /\.mdx?$/,
          use: [
            options.defaultLoaders.babel,
            {
              loader: "fumadocs-mdx/loader-mdx",
              options: mdxLoaderOptions
            }
          ]
        });
        config.plugins ||= [];
        return nextConfig.webpack?.(config, options) ?? config;
      }
    };
  };
}

// src/postinstall.ts
import * as path3 from "path";
import * as fs3 from "fs/promises";
async function postInstall(configPath = findConfigFile(), outDir = ".source") {
  const jsOut = path3.resolve(outDir, "index.ts");
  const hash = await getConfigHash(configPath);
  const config = await loadConfig(configPath, outDir, hash, true);
  await fs3.rm(path3.dirname(jsOut), { recursive: true });
  await fs3.mkdir(path3.dirname(jsOut), { recursive: true });
  await fs3.writeFile(
    jsOut,
    await generateJS(configPath, config, { relativeTo: outDir }, hash)
  );
  console.log("[MDX] types generated");
}
export {
  createMDX,
  postInstall,
  start
};
