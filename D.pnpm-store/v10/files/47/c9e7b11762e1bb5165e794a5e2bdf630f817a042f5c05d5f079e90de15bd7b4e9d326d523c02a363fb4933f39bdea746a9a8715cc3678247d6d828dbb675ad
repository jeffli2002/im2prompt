"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/loader-mdx.ts
var loader_mdx_exports = {};
__export(loader_mdx_exports, {
  default: () => loader
});
module.exports = __toCommonJS(loader_mdx_exports);
var path4 = __toESM(require("path"), 1);
var import_node_querystring = require("querystring");

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

// src/utils/build-mdx.ts
var import_mdx = require("@mdx-js/mdx");

// src/mdx-plugins/remark-include.ts
var import_unist_util_visit = require("unist-util-visit");
var path2 = __toESM(require("path"), 1);
var fs2 = __toESM(require("fs/promises"), 1);

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

// src/mdx-plugins/remark-include.ts
function flattenNode(node) {
  if ("children" in node)
    return node.children.map((child) => flattenNode(child)).join("");
  if ("value" in node) return node.value;
  return "";
}
function remarkInclude() {
  const TagName = "include";
  async function update(tree, file, processor, compiler) {
    const queue = [];
    (0, import_unist_util_visit.visit)(
      tree,
      ["mdxJsxFlowElement", "mdxJsxTextElement"],
      (node, _, parent) => {
        let specifier;
        const params = {};
        if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.name === TagName) {
          const value = flattenNode(node);
          if (value.length > 0) {
            for (const attr of node.attributes) {
              if (attr.type === "mdxJsxAttribute" && (typeof attr.value === "string" || attr.value === null)) {
                params[attr.name] = attr.value;
              }
            }
            specifier = value;
          }
        }
        if (!specifier) return;
        const targetPath = path2.resolve(
          "cwd" in params ? process.cwd() : path2.dirname(file),
          specifier
        );
        const asCode = params.lang || !specifier.endsWith(".md") && !specifier.endsWith(".mdx");
        queue.push(
          fs2.readFile(targetPath).then((buffer) => buffer.toString()).then(async (content) => {
            compiler?.addDependency(targetPath);
            if (asCode) {
              const lang = params.lang ?? path2.extname(specifier).slice(1);
              Object.assign(node, {
                type: "code",
                lang,
                meta: params.meta,
                value: content.toString(),
                data: {}
              });
              return;
            }
            const parsed = processor.parse(fumaMatter(content).content);
            await update(parsed, targetPath, processor, compiler);
            Object.assign(
              parent && parent.type === "paragraph" ? parent : node,
              parsed
            );
          }).catch((e) => {
            throw new Error(
              `failed to read file ${targetPath}
${e instanceof Error ? e.message : String(e)}`
            );
          })
        );
        return "skip";
      }
    );
    await Promise.all(queue);
  }
  return async (tree, file) => {
    await update(tree, file.path, this, file.data._compiler);
  };
}

// src/utils/build-mdx.ts
var cache2 = /* @__PURE__ */ new Map();
async function buildMDX(cacheKey, source, options) {
  const { filePath, frontmatter, data, ...rest } = options;
  let format = options.format;
  if (!format && filePath) {
    format = filePath.endsWith(".mdx") ? "mdx" : "md";
  }
  format ??= "mdx";
  const key = `${cacheKey}:${format}`;
  let cached = cache2.get(key);
  if (!cached) {
    cached = (0, import_mdx.createProcessor)({
      outputFormat: "program",
      ...rest,
      remarkPlugins: [remarkInclude, ...rest.remarkPlugins ?? []],
      format
    });
    cache2.set(key, cached);
  }
  return cached.process({
    value: source,
    path: filePath,
    data: {
      ...data,
      frontmatter,
      _compiler: options._compiler
    }
  });
}

// src/utils/git-timestamp.ts
var import_node_path = __toESM(require("path"), 1);
var import_tinyexec = require("tinyexec");
var cache3 = /* @__PURE__ */ new Map();
async function getGitTimestamp(file) {
  const cached = cache3.get(file);
  if (cached) return cached;
  try {
    const out = await (0, import_tinyexec.x)(
      "git",
      ["log", "-1", '--pretty="%ai"', import_node_path.default.relative(process.cwd(), file)],
      {
        throwOnError: true
      }
    );
    const time = new Date(out.stdout);
    cache3.set(file, time);
    return time;
  } catch {
    return;
  }
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

// src/utils/count-lines.ts
function countLines(s) {
  let num = 0;
  for (const c of s) {
    if (c === "\n") num++;
  }
  return num;
}

// src/utils/mdx-options.ts
var plugins = __toESM(require("fumadocs-core/mdx-plugins"), 1);

// src/mdx-plugins/remark-exports.ts
var import_estree_util_value_to_estree = require("estree-util-value-to-estree");
function remarkMdxExport({ values }) {
  return (tree, vfile) => {
    for (const name of values) {
      if (!(name in vfile.data)) return;
      tree.children.unshift(getMdastExport(name, vfile.data[name]));
    }
  };
}
function getMdastExport(name, value) {
  return {
    type: "mdxjsEsm",
    value: "",
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [],
            source: null,
            declaration: {
              type: "VariableDeclaration",
              kind: "let",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: {
                    type: "Identifier",
                    name
                  },
                  init: (0, import_estree_util_value_to_estree.valueToEstree)(value)
                }
              ]
            }
          }
        ]
      }
    }
  };
}

// src/utils/mdx-options.ts
function pluginOption(def, options = []) {
  const list = def(Array.isArray(options) ? options : []).filter(
    Boolean
  );
  if (typeof options === "function") {
    return options(list);
  }
  return list;
}
function getDefaultMDXOptions({
  valueToExport = [],
  rehypeCodeOptions,
  remarkImageOptions,
  remarkHeadingOptions,
  remarkStructureOptions,
  remarkCodeTabOptions,
  remarkNpmOptions,
  ...mdxOptions
}) {
  const mdxExports = [
    "structuredData",
    "frontmatter",
    "lastModified",
    ...valueToExport
  ];
  const remarkPlugins = pluginOption(
    (v) => [
      plugins.remarkGfm,
      [
        plugins.remarkHeading,
        {
          generateToc: false,
          ...remarkHeadingOptions
        }
      ],
      remarkImageOptions !== false && [plugins.remarkImage, remarkImageOptions],
      "remarkCodeTab" in plugins && remarkCodeTabOptions !== false && [
        plugins.remarkCodeTab,
        remarkCodeTabOptions
      ],
      "remarkNpm" in plugins && remarkNpmOptions !== false && [plugins.remarkNpm, remarkNpmOptions],
      ...v,
      remarkStructureOptions !== false && [
        plugins.remarkStructure,
        remarkStructureOptions
      ],
      [remarkMdxExport, { values: mdxExports }]
    ],
    mdxOptions.remarkPlugins
  );
  const rehypePlugins = pluginOption(
    (v) => [
      rehypeCodeOptions !== false && [plugins.rehypeCode, rehypeCodeOptions],
      ...v,
      plugins.rehypeToc
    ],
    mdxOptions.rehypePlugins
  );
  return {
    ...mdxOptions,
    remarkPlugins,
    rehypePlugins
  };
}
async function loadDefaultOptions(config) {
  const input = config.global?.mdxOptions;
  config._mdx_loader ??= {};
  const mdxLoader = config._mdx_loader;
  if (!mdxLoader.cachedOptions) {
    mdxLoader.cachedOptions = typeof input === "function" ? getDefaultMDXOptions(await input()) : getDefaultMDXOptions(input ?? {});
  }
  return mdxLoader.cachedOptions;
}

// src/loader-mdx.ts
async function loader(source, callback) {
  this.cacheable(true);
  const context = this.context;
  const filePath = this.resourcePath;
  const { configPath, outDir } = this.getOptions();
  const matter = fumaMatter(source);
  const {
    hash: configHash = await getConfigHash(configPath),
    collection: collectionId
  } = (0, import_node_querystring.parse)(this.resourceQuery.slice(1));
  const config = await loadConfig(configPath, outDir, configHash);
  let collection = collectionId !== void 0 ? config.collections.get(collectionId) : void 0;
  if (collection && collection.type === "docs") collection = collection.docs;
  if (collection && collection.type !== "doc") {
    collection = void 0;
  }
  let data = matter.data;
  const mdxOptions = collection?.mdxOptions ?? await loadDefaultOptions(config);
  if (collection?.schema) {
    try {
      data = await validate(
        collection.schema,
        matter.data,
        {
          source,
          path: filePath
        },
        `invalid frontmatter in ${filePath}`
      );
    } catch (e) {
      if (e instanceof ValidationError) {
        return callback(new Error(e.toStringFormatted()));
      }
      return callback(e);
    }
  }
  let timestamp;
  if (config.global?.lastModifiedTime === "git") {
    timestamp = (await getGitTimestamp(filePath))?.getTime();
  }
  try {
    const lineOffset = "\n".repeat(
      this.mode === "development" ? countLines(matter.matter) : 0
    );
    const file = await buildMDX(
      `${configHash}:${collectionId ?? "global"}`,
      lineOffset + matter.content,
      {
        development: this.mode === "development",
        ...mdxOptions,
        filePath,
        frontmatter: data,
        data: {
          lastModified: timestamp
        },
        _compiler: this
      }
    );
    callback(void 0, String(file.value), file.map ?? void 0);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const fpath = path4.relative(context, filePath);
    error.message = `${fpath}:${error.name}: ${error.message}`;
    callback(error);
  }
}
