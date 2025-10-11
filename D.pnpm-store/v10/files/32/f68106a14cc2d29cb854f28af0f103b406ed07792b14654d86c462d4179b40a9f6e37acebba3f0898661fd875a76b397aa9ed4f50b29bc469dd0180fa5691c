import {
  buildMDX,
  countLines
} from "../chunk-6PDS7MUA.js";
import {
  loadDefaultOptions
} from "../chunk-64MMPGML.js";
import "../chunk-AVMO2SRO.js";
import {
  buildConfig
} from "../chunk-DRVUBK5B.js";
import {
  fumaMatter
} from "../chunk-KVWX6THC.js";

// src/vite/index.ts
import { parse } from "querystring";
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
      const [path, query = ""] = id.split("?");
      if (!fileRegex.test(path)) return;
      const matter = fumaMatter(value);
      const isDevelopment = this.environment.mode === "dev";
      const { collection: collectionId, raw } = parse(query);
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
          filePath: path,
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
export {
  unstable_mdx as default
};
