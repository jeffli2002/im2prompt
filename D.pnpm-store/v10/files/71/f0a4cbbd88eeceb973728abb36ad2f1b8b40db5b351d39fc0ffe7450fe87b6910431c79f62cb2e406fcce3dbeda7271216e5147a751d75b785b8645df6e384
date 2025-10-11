// src/search/client/algolia.ts
function groupResults(hits) {
  const grouped = [];
  const scannedUrls = /* @__PURE__ */ new Set();
  for (const hit of hits) {
    if (!scannedUrls.has(hit.url)) {
      scannedUrls.add(hit.url);
      grouped.push({
        id: hit.url,
        type: "page",
        url: hit.url,
        content: hit.title
      });
    }
    grouped.push({
      id: hit.objectID,
      type: hit.content === hit.section ? "heading" : "text",
      url: hit.section_id ? `${hit.url}#${hit.section_id}` : hit.url,
      content: hit.content
    });
  }
  return grouped;
}
async function searchDocs(query, { indexName, onSearch, client, locale, tag }) {
  if (query.length > 0) {
    const result = onSearch ? await onSearch(query, tag, locale) : await client.searchForHits({
      requests: [
        {
          type: "default",
          indexName,
          query,
          distinct: 5,
          hitsPerPage: 10,
          filters: tag ? `tag:${tag}` : void 0
        }
      ]
    });
    return groupResults(result.results[0].hits).filter(
      (hit) => hit.type === "page"
    );
  }
  return [];
}
export {
  groupResults,
  searchDocs
};
