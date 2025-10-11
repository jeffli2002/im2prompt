import {
  frontmatterSchema,
  metaSchema
} from "../chunk-OTM6WYMS.js";
import {
  loadDefaultOptions
} from "../chunk-64MMPGML.js";
import {
  remarkInclude
} from "../chunk-AVMO2SRO.js";
import "../chunk-KVWX6THC.js";

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
export {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
  loadDefaultOptions,
  metaSchema,
  remarkInclude
};
