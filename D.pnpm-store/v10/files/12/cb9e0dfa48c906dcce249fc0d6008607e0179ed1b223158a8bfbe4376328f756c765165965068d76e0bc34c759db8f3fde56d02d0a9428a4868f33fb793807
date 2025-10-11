import {
  remarkInclude
} from "./chunk-AVMO2SRO.js";

// src/utils/build-mdx.ts
import { createProcessor } from "@mdx-js/mdx";
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
    cached = createProcessor({
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

// src/utils/count-lines.ts
function countLines(s) {
  let num = 0;
  for (const c of s) {
    if (c === "\n") num++;
  }
  return num;
}

export {
  buildMDX,
  countLines
};
