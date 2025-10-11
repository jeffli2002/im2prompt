import {
  fumaMatter
} from "./chunk-KVWX6THC.js";

// src/mdx-plugins/remark-include.ts
import { visit } from "unist-util-visit";
import * as path from "path";
import * as fs from "fs/promises";
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
    visit(
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

export {
  remarkInclude
};
