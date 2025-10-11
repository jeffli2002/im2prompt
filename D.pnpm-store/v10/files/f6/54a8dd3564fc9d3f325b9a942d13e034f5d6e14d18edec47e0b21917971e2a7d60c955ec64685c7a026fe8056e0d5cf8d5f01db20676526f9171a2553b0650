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

// src/runtime/async.ts
var async_exports = {};
__export(async_exports, {
  _runtimeAsync: () => _runtimeAsync,
  buildConfig: () => buildConfig
});
module.exports = __toCommonJS(async_exports);
var import_mdx_remote = require("@fumadocs/mdx-remote");

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

// src/runtime/async.ts
var import_mdx_plugins = require("fumadocs-core/mdx-plugins");

// src/runtime/index.ts
var import_node_fs = __toESM(require("fs"), 1);
var cache = /* @__PURE__ */ new Map();
var _runtime = {
  doc(files) {
    return files.map((file) => {
      const { default: body, frontmatter, ...exports2 } = file.data;
      return {
        body,
        ...exports2,
        ...frontmatter,
        _file: file.info,
        _exports: file.data,
        get content() {
          const path2 = this._file.absolutePath;
          const cached = cache.get(path2);
          if (cached) return cached;
          const content = import_node_fs.default.readFileSync(path2).toString();
          cache.set(path2, content);
          return content;
        }
      };
    });
  },
  meta(files) {
    return files.map((file) => {
      return {
        ...file.data,
        _file: file.info
      };
    });
  },
  docs(docs, metas) {
    const parsedDocs = this.doc(docs);
    const parsedMetas = this.meta(metas);
    return {
      docs: parsedDocs,
      meta: parsedMetas,
      toFumadocsSource() {
        return createMDXSource(parsedDocs, parsedMetas);
      }
    };
  }
};
function createMDXSource(docs, meta = []) {
  return {
    files: () => resolveFiles({
      docs,
      meta
    })
  };
}
function resolveFiles({ docs, meta }) {
  const outputs = [];
  for (const entry of docs) {
    outputs.push({
      type: "page",
      absolutePath: entry._file.absolutePath,
      path: entry._file.path,
      data: entry
    });
  }
  for (const entry of meta) {
    outputs.push({
      type: "meta",
      absolutePath: entry._file.absolutePath,
      path: entry._file.path,
      data: entry
    });
  }
  return outputs;
}

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

// src/runtime/async.ts
async function initCompiler(config, collection) {
  let mdxOptions;
  const col = config.collections.get(collection);
  if (col?.type === "doc") mdxOptions = col.mdxOptions;
  else if (col?.type === "docs")
    mdxOptions = col.docs?.mdxOptions;
  if (!mdxOptions) {
    config._mdx_async ??= {};
    const async = config._mdx_async;
    const globalConfig = config.global;
    if (globalConfig && !async.cachedMdxOptions) {
      async.cachedMdxOptions = typeof globalConfig.mdxOptions === "function" ? await globalConfig.mdxOptions() : globalConfig.mdxOptions;
    }
    mdxOptions = async.cachedMdxOptions;
  }
  const remarkPlugins = mdxOptions?.remarkPlugins ?? [];
  return (0, import_mdx_remote.createCompiler)({
    ...mdxOptions,
    remarkPlugins: (v) => typeof remarkPlugins === "function" ? [remarkInclude, ...remarkPlugins(v), import_mdx_plugins.remarkStructure] : [remarkInclude, ...v, ...remarkPlugins, import_mdx_plugins.remarkStructure]
  });
}
var _runtimeAsync = {
  doc(files, collection, config) {
    const init = initCompiler(config, collection);
    return files.map(({ info: file, data, content, lastModified }) => {
      return {
        ...data,
        _file: file,
        content,
        async load() {
          const compiler = await init;
          const out = await compiler.compile({
            source: content,
            filePath: file.absolutePath
          });
          return {
            body: out.body,
            toc: out.toc,
            lastModified,
            structuredData: out.vfile.data.structuredData,
            _exports: out.exports ?? {}
          };
        }
      };
    });
  },
  docs(docs, metas, collection, config) {
    const parsedDocs = this.doc(docs, collection, config);
    const parsedMetas = _runtime.meta(metas);
    return {
      docs: parsedDocs,
      meta: parsedMetas,
      toFumadocsSource() {
        return createMDXSource(parsedDocs, parsedMetas);
      }
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  _runtimeAsync,
  buildConfig
});
