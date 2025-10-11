// src/search/client/fetch.ts
var cache = /* @__PURE__ */ new Map();
async function fetchDocs(query, { api = "/api/search", locale, tag }) {
  const params = new URLSearchParams();
  params.set("query", query);
  if (locale) params.set("locale", locale);
  if (tag) params.set("tag", Array.isArray(tag) ? tag.join(",") : tag);
  const key = `${api}?${params}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const res = await fetch(key);
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  cache.set(key, result);
  return result;
}
export {
  fetchDocs
};
