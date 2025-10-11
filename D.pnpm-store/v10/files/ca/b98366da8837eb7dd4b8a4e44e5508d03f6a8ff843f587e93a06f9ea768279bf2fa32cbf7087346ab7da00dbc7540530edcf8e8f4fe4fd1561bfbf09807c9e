"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/map/watcher.ts
var watcher_exports = {};
__export(watcher_exports, {
  watcher: () => watcher
});
function watcher(configPath, config, ignored) {
  const watcher2 = new import_chokidar.FSWatcher({
    ignoreInitial: true,
    persistent: true,
    ignored
  });
  watcher2.add(configPath);
  for (const collection of config.collections.values()) {
    if (collection.type === "docs") {
      watcher2.add(collection.docs.dir);
      watcher2.add(collection.meta.dir);
    } else {
      watcher2.add(collection.dir);
    }
  }
  return watcher2;
}
var import_chokidar;
var init_watcher = __esm({
  "src/map/watcher.ts"() {
    "use strict";
    import_chokidar = require("chokidar");
  }
});

// src/next/index.ts
var next_exports = {};
__export(next_exports, {
  createMDX: () => createMDX,
  postInstall: () => postInstall,
  start: () => start
});
module.exports = __toCommonJS(next_exports);

// src/utils/config.ts
var fs = __toESM(require("fs/promises"), 1);
var path = __toESM(require("path"), 1);
var import_node_url = require("url");

// src/config/build.ts
function buildConfig(config) {
  const collections = /* @__PURE__ */ new Map();
  let globalConfig;
  for (const [k, v] of Object.entries(config)) {
    if (!v) {
      continue;
    }
    if (typeof v === "object" && "type" in v) {
      if (v.type === "docs") {
        collections.set(k, v);
        continue;
      }
      if (v.type === "doc" || v.type === "meta") {
        collections.set(k, v);
        continue;
      }
    }
    if (k === "default") {
      globalConfig = v;
      continue;
    }
    return [
      `Unknown export "${k}", you can only export collections from source configuration file.`,
      null
    ];
  }
  return [
    null,
    {
      global: globalConfig,
      collections
    }
  ];
}

// src/utils/config.ts
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
  const url = (0, import_node_url.pathToFileURL)(path.resolve(outDir, "source.config.mjs"));
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

// src/map/index.ts
var path4 = __toESM(require("path"), 1);
var fs3 = __toESM(require("fs/promises"), 1);

// src/map/generate.ts
var path3 = __toESM(require("path"), 1);
var fs2 = __toESM(require("fs/promises"), 1);
var import_tinyglobby = require("tinyglobby");

// src/utils/get-type-from-path.ts
var import_node_path = require("path");
var docTypes = [".mdx", ".md"];
var metaTypes = [".json", ".yaml"];
function getTypeFromPath(path6) {
  const ext = (0, import_node_path.extname)(path6);
  if (docTypes.includes(ext)) return "doc";
  if (metaTypes.includes(ext)) return "meta";
}

// src/utils/schema.ts
var import_zod = require("zod");
var import_picocolors = __toESM(require("picocolors"), 1);
var metaSchema = import_zod.z.object({
  title: import_zod.z.string().optional(),
  pages: import_zod.z.array(import_zod.z.string()).optional(),
  description: import_zod.z.string().optional(),
  root: import_zod.z.boolean().optional(),
  defaultOpen: import_zod.z.boolean().optional(),
  icon: import_zod.z.string().optional()
});
var frontmatterSchema = import_zod.z.object({
  title: import_zod.z.string(),
  description: import_zod.z.string().optional(),
  icon: import_zod.z.string().optional(),
  full: import_zod.z.boolean().optional(),
  // Fumadocs OpenAPI generated
  _openapi: import_zod.z.object({}).passthrough().optional()
});
var ValidationError = class extends Error {
  constructor(message, issues) {
    super(message);
    this.issues = issues;
  }
  toString() {
    return `${this.message}:
${this.issues.map((issue) => `  ${issue.path}: ${issue.message}`).join("\n")}`;
  }
  toStringFormatted() {
    return [
      import_picocolors.default.bold(`[MDX] ${this.message}:`),
      ...this.issues.map(
        (issue) => import_picocolors.default.redBright(
          `- ${import_picocolors.default.bold(issue.path?.join(".") ?? "*")}: ${issue.message}`
        )
      )
    ].join("\n");
  }
};
async function validate(schema, data, context, errorMessage) {
  if (typeof schema === "function" && !("~standard" in schema)) {
    schema = schema(context);
  }
  if ("~standard" in schema) {
    const result = await schema["~standard"].validate(
      data
    );
    if (result.issues) {
      throw new ValidationError(errorMessage, result.issues);
    }
    return result.value;
  }
  return data;
}

// src/map/file-cache.ts
var import_lru_cache = require("lru-cache");
var map = new import_lru_cache.LRUCache({
  max: 200
});
var fileCache = {
  read(namespace, path6) {
    return map.get(`${namespace}.${path6}`);
  },
  write(namespace, path6, data) {
    map.set(`${namespace}.${path6}`, data);
  },
  removeCache(path6) {
    for (const key of map.keys()) {
      const keyPath = key.slice(key.indexOf(".") + 1);
      if (keyPath === path6) map.delete(key);
    }
  }
};

// src/map/generate.ts
var import_js_yaml2 = require("js-yaml");

// src/utils/git-timestamp.ts
var import_node_path2 = __toESM(require("path"), 1);
var import_tinyexec = require("tinyexec");
var cache2 = /* @__PURE__ */ new Map();
async function getGitTimestamp(file) {
  const cached = cache2.get(file);
  if (cached) return cached;
  try {
    const out = await (0, import_tinyexec.x)(
      "git",
      ["log", "-1", '--pretty="%ai"', import_node_path2.default.relative(process.cwd(), file)],
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

// src/utils/fuma-matter.ts
var import_js_yaml = require("js-yaml");
var regex = /^---\r?\n(.+?)\r?\n---\r?\n/s;
function fumaMatter(input) {
  const output = { matter: "", data: {}, content: input };
  const match = regex.exec(input);
  if (!match) {
    return output;
  }
  output.matter = match[1];
  output.content = input.slice(match[0].length);
  const loaded = (0, import_js_yaml.load)(output.matter);
  output.data = loaded ?? {};
  return output;
}

// src/map/generate.ts
async function readFileWithCache(file) {
  const cached = fileCache.read("read-file", file);
  if (cached) return cached;
  return (await fs2.readFile(file)).toString();
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
      const result = await (0, import_tinyglobby.glob)(collection.files ?? "**/*", {
        cwd: path3.resolve(dir),
        absolute: true
      });
      for (const item of result) {
        if (getTypeFromPath(item) !== collection.type) continue;
        files.set(item, {
          path: path3.relative(dir, item),
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
  const ext = path3.extname(file);
  const filename = ext === ".ts" ? file.substring(0, file.length - ext.length) : file;
  let importPath;
  if ("relativeTo" in config) {
    importPath = path3.relative(config.relativeTo, filename);
    if (!path3.isAbsolute(importPath) && !importPath.startsWith(".")) {
      importPath = `./${importPath}`;
    }
  } else {
    importPath = path3.resolve(filename);
  }
  return importPath.replaceAll(path3.sep, "/");
}
function parseMetaEntry(file, content) {
  const extname3 = path3.extname(file);
  try {
    if (extname3 === ".json") return JSON.parse(content);
    if (extname3 === ".yaml") return (0, import_js_yaml2.load)(content);
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
  const outPath = path4.resolve(outDir, `index.ts`);
  async function updateMapFile() {
    const start2 = performance.now();
    try {
      await fs3.writeFile(
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
    const { watcher: watcher2 } = await Promise.resolve().then(() => (init_watcher(), watcher_exports));
    const instance = watcher2(configPath, config, [outPath]);
    instance.on("ready", () => {
      console.log("[MDX] started dev server");
    });
    instance.on("all", (event, file) => {
      if (typeof file !== "string") return;
      const absolutePath = path4.resolve(file);
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
var path5 = __toESM(require("path"), 1);
var fs4 = __toESM(require("fs/promises"), 1);
async function postInstall(configPath = findConfigFile(), outDir = ".source") {
  const jsOut = path5.resolve(outDir, "index.ts");
  const hash = await getConfigHash(configPath);
  const config = await loadConfig(configPath, outDir, hash, true);
  await fs4.rm(path5.dirname(jsOut), { recursive: true });
  await fs4.mkdir(path5.dirname(jsOut), { recursive: true });
  await fs4.writeFile(
    jsOut,
    await generateJS(configPath, config, { relativeTo: outDir }, hash)
  );
  console.log("[MDX] types generated");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createMDX,
  postInstall,
  start
});
