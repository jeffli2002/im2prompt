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

export {
  buildConfig
};
