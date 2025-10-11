import {
  removeUndefined
} from "./chunk-KAOEMCTI.js";

// src/search/orama/search/simple.ts
import { search } from "@orama/orama";
async function searchSimple(db, query, params = {}) {
  const result = await search(db, {
    term: query,
    tolerance: 1,
    ...params,
    boost: {
      title: 2,
      ..."boost" in params ? params.boost : void 0
    }
  });
  return result.hits.map((hit) => ({
    type: "page",
    content: hit.document.title,
    id: hit.document.url,
    url: hit.document.url
  }));
}

// src/search/orama/search/advanced.ts
import { getByID, search as search2 } from "@orama/orama";
async function searchAdvanced(db, query, tag = [], extraParams = {}) {
  if (typeof tag === "string") tag = [tag];
  let params = {
    ...extraParams,
    where: removeUndefined({
      tags: tag.length > 0 ? {
        containsAll: tag
      } : void 0,
      ...extraParams.where
    }),
    groupBy: {
      properties: ["page_id"],
      maxResult: 8,
      ...extraParams.groupBy
    }
  };
  if (query.length > 0) {
    params = {
      ...params,
      term: query,
      properties: ["content"]
    };
  }
  const result = await search2(db, params);
  const list = [];
  for (const item of result.groups ?? []) {
    const pageId = item.values[0];
    const page = await getByID(db, pageId);
    if (!page) continue;
    list.push({
      id: pageId,
      type: "page",
      content: page.content,
      url: page.url
    });
    for (const hit of item.result) {
      if (hit.document.type === "page") continue;
      list.push({
        id: hit.document.id.toString(),
        content: hit.document.content,
        type: hit.document.type,
        url: hit.document.url
      });
    }
  }
  return list;
}

export {
  searchSimple,
  searchAdvanced
};
