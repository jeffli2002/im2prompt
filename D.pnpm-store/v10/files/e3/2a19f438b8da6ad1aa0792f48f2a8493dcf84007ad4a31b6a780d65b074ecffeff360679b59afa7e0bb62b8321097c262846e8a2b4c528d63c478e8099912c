// src/utils/schema.ts
import { z } from "zod";
import picocolors from "picocolors";
var metaSchema = z.object({
  title: z.string().optional(),
  pages: z.array(z.string()).optional(),
  description: z.string().optional(),
  root: z.boolean().optional(),
  defaultOpen: z.boolean().optional(),
  icon: z.string().optional()
});
var frontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  full: z.boolean().optional(),
  // Fumadocs OpenAPI generated
  _openapi: z.object({}).passthrough().optional()
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
      picocolors.bold(`[MDX] ${this.message}:`),
      ...this.issues.map(
        (issue) => picocolors.redBright(
          `- ${picocolors.bold(issue.path?.join(".") ?? "*")}: ${issue.message}`
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

export {
  metaSchema,
  frontmatterSchema,
  ValidationError,
  validate
};
