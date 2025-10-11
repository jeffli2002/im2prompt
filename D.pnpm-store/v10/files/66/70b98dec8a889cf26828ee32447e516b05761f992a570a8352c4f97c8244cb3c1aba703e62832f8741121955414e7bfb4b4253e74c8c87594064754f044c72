import {
  _runtime,
  createMDXSource
} from "../chunk-NUDEC6C5.js";
import {
  remarkInclude
} from "../chunk-AVMO2SRO.js";
import {
  buildConfig
} from "../chunk-DRVUBK5B.js";
import "../chunk-KVWX6THC.js";

// src/runtime/async.ts
import { createCompiler } from "@fumadocs/mdx-remote";
import {
  remarkStructure
} from "fumadocs-core/mdx-plugins";
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
  return createCompiler({
    ...mdxOptions,
    remarkPlugins: (v) => typeof remarkPlugins === "function" ? [remarkInclude, ...remarkPlugins(v), remarkStructure] : [remarkInclude, ...v, ...remarkPlugins, remarkStructure]
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
export {
  _runtimeAsync,
  buildConfig
};
