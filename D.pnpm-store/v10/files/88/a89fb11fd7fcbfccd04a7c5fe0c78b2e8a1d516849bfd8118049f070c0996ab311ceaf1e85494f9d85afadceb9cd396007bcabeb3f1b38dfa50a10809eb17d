import {
  getConfigHash,
  getGitTimestamp,
  loadConfig
} from "./chunk-SXOJYWZ3.js";
import {
  ValidationError,
  validate
} from "./chunk-OTM6WYMS.js";
import {
  buildMDX,
  countLines
} from "./chunk-6PDS7MUA.js";
import {
  loadDefaultOptions
} from "./chunk-64MMPGML.js";
import "./chunk-AVMO2SRO.js";
import "./chunk-DRVUBK5B.js";
import {
  fumaMatter
} from "./chunk-KVWX6THC.js";

// src/loader-mdx.ts
import * as path from "path";
import { parse } from "querystring";
async function loader(source, callback) {
  this.cacheable(true);
  const context = this.context;
  const filePath = this.resourcePath;
  const { configPath, outDir } = this.getOptions();
  const matter = fumaMatter(source);
  const {
    hash: configHash = await getConfigHash(configPath),
    collection: collectionId
  } = parse(this.resourceQuery.slice(1));
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
    const fpath = path.relative(context, filePath);
    error.message = `${fpath}:${error.name}: ${error.message}`;
    callback(error);
  }
}
export {
  loader as default
};
