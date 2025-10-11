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

// src/config/index.ts
var config_exports = {};
__export(config_exports, {
  defineCollections: () => defineCollections,
  defineConfig: () => defineConfig,
  defineDocs: () => defineDocs,
  frontmatterSchema: () => frontmatterSchema,
  loadDefaultOptions: () => loadDefaultOptions,
  metaSchema: () => metaSchema,
  remarkInclude: () => remarkInclude
});
module.exports = __toCommonJS(config_exports);

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

// src/config/define.ts
function defineCollections(options) {
  return {
    // @ts-expect-error -- internal type inferring
    _type: void 0,
    ...options
  };
}
function defineDocs(options) {
  if (!options)
    console.warn(
      "[`source.config.ts`] Deprecated: please pass options to `defineDocs()` and specify a `dir`."
    );
  const dir = options?.dir ?? "content/docs";
  return {
    type: "docs",
    // @ts-expect-error -- internal type inferring
    docs: defineCollections({
      type: "doc",
      dir,
      schema: frontmatterSchema,
      ...options?.docs
    }),
    // @ts-expect-error -- internal type inferring
    meta: defineCollections({
      type: "meta",
      files: ["**/*.{json,yaml}"],
      dir,
      schema: metaSchema,
      ...options?.meta
    })
  };
}
function defineConfig(config = {}) {
  return config;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
  loadDefaultOptions,
  metaSchema,
  remarkInclude
});
