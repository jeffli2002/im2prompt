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

// src/vite/index.ts
var vite_exports = {};
__export(vite_exports, {
  default: () => unstable_mdx
});
module.exports = __toCommonJS(vite_exports);

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

// src/utils/build-mdx.ts
var import_mdx = require("@mdx-js/mdx");

// src/mdx-plugins/remark-include.ts
var import_unist_util_visit = require("unist-util-visit");
var path = __toESM(require("path"), 1);
var fs = __toESM(require("fs/promises"), 1);

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
        const targetPath = path.resolve(
          "cwd" in params ? process.cwd() : path.dirname(file),
          specifier
        );
        const asCode = params.lang || !specifier.endsWith(".md") && !specifier.endsWith(".mdx");
        queue.push(
          fs.readFile(targetPath).then((buffer) => buffer.toString()).then(async (content) => {
            compiler?.addDependency(targetPath);
            if (asCode) {
              const lang = params.lang ?? path.extname(specifier).slice(1);
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
var cache = /* @__PURE__ */ new Map();
async function buildMDX(cacheKey, source, options) {
  const { filePath, frontmatter, data, ...rest } = options;
  let format = options.format;
  if (!format && filePath) {
    format = filePath.endsWith(".mdx") ? "mdx" : "md";
  }
  format ??= "mdx";
  const key = `${cacheKey}:${format}`;
  let cached = cache.get(key);
  if (!cached) {
    cached = (0, import_mdx.createProcessor)({
      outputFormat: "program",
      ...rest,
      remarkPlugins: [remarkInclude, ...rest.remarkPlugins ?? []],
      format
    });
    cache.set(key, cached);
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

// src/vite/index.ts
var import_node_querystring = require("querystring");

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

// src/vite/index.ts
var fileRegex = /\.(md|mdx)$/;
function unstable_mdx(config, _options = {}) {
  const [err, loaded] = buildConfig(config);
  if (err || !loaded) {
    throw new Error(err);
  }
  return {
    name: "fumadocs-mdx",
    // TODO: need a way to generate .source folder that works for non-RSC based frameworks, currently, we need to dynamic import MDX files using `import.meta.glob`.
    // at the moment, RR and Tanstack Start has no stable support for RSC yet.
    async transform(value, id) {
      const [path2, query = ""] = id.split("?");
      if (!fileRegex.test(path2)) return;
      const matter = fumaMatter(value);
      const isDevelopment = this.environment.mode === "dev";
      const { collection: collectionId, raw } = (0, import_node_querystring.parse)(query);
      const collection = collectionId ? loaded.collections.get(collectionId) : void 0;
      const lineOffset = "\n".repeat(
        isDevelopment ? countLines(matter.matter) : 0
      );
      let mdxOptions;
      switch (collection?.type) {
        case "doc":
          mdxOptions = collection.mdxOptions;
          break;
        case "docs":
          mdxOptions = collection.docs.mdxOptions;
          break;
      }
      mdxOptions ??= await loadDefaultOptions(loaded);
      const file = await buildMDX(
        collectionId ?? "global",
        lineOffset + matter.content,
        {
          development: isDevelopment,
          ...mdxOptions,
          filePath: path2,
          frontmatter: matter.data,
          _compiler: {
            addDependency: (file2) => {
              this.addWatchFile(file2);
            }
          }
        }
      );
      return {
        code: typeof raw === "string" ? `export default ${JSON.stringify(file.value)}` : String(file.value)
      };
    }
  };
}
