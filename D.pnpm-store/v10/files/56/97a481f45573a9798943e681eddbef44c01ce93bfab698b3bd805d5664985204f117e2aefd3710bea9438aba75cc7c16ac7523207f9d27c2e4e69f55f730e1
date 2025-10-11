import {
  basename,
  dirname,
  extname,
  parseFilePath,
  parseFolderPath
} from "../chunk-7GNSIKII.js";
import {
  joinPath,
  slash,
  splitPath
} from "../chunk-3JSIVMCJ.js";

// src/source/page-tree-builder.ts
var group = /^\((?<name>.+)\)$/;
var link = /^(?:\[(?<icon>[^\]]+)])?\[(?<name>[^\]]+)]\((?<url>[^)]+)\)$/;
var separator = /^---(?:\[(?<icon>[^\]]+)])?(?<name>.+)---|^---$/;
var rest = "...";
var restReversed = "z...a";
var extractPrefix = "...";
var excludePrefix = "!";
function buildAll(paths, ctx, filter, reversed = false) {
  const output = [];
  const sortedPaths = (filter ? paths.filter(filter) : [...paths]).sort(
    (a, b) => a.localeCompare(b) * (reversed ? -1 : 1)
  );
  for (const path of sortedPaths) {
    const fileNode = buildFileNode(path, ctx);
    if (!fileNode) continue;
    if (basename(path, extname(path)) === "index") output.unshift(fileNode);
    else output.push(fileNode);
  }
  for (const dir of sortedPaths) {
    const dirNode = buildFolderNode(dir, false, ctx);
    if (dirNode) output.push(dirNode);
  }
  return output;
}
function resolveFolderItem(folderPath, item, ctx, idx, restNodePaths) {
  if (item === rest || item === restReversed) return item;
  const { options, resolveName } = ctx;
  let match = separator.exec(item);
  if (match?.groups) {
    const node = {
      $id: `${folderPath}#${idx}`,
      type: "separator",
      icon: options.resolveIcon?.(match.groups.icon),
      name: match.groups.name
    };
    return [options.attachSeparator?.(node) ?? node];
  }
  match = link.exec(item);
  if (match?.groups) {
    const { icon, url, name } = match.groups;
    const isRelative = url.startsWith("/") || url.startsWith("#") || url.startsWith(".");
    const node = {
      type: "page",
      icon: options.resolveIcon?.(icon),
      name,
      url,
      external: !isRelative
    };
    return [options.attachFile?.(node) ?? node];
  }
  const isExcept = item.startsWith(excludePrefix);
  const isExtract = !isExcept && item.startsWith(extractPrefix);
  let filename = item;
  if (isExcept) {
    filename = item.slice(excludePrefix.length);
  } else if (isExtract) {
    filename = item.slice(extractPrefix.length);
  }
  const path = resolveName(joinPath(folderPath, filename), "page");
  restNodePaths.delete(path);
  if (isExcept) return [];
  const dirNode = buildFolderNode(path, false, ctx);
  if (dirNode) {
    return isExtract ? dirNode.children : [dirNode];
  }
  const fileNode = buildFileNode(path, ctx);
  return fileNode ? [fileNode] : [];
}
function buildFolderNode(folderPath, isGlobalRoot, ctx) {
  const { storage, localeStorage, options, resolveName } = ctx;
  const files = storage.readDir(folderPath);
  if (!files) return;
  const metaPath = resolveName(joinPath(folderPath, "meta"), "meta");
  const indexPath = resolveName(joinPath(folderPath, "index"), "page");
  let meta = localeStorage?.read(metaPath) ?? storage.read(metaPath);
  if (meta?.format !== "meta") {
    meta = void 0;
  }
  const isRoot = meta?.data.root ?? isGlobalRoot;
  let indexDisabled = false;
  let children;
  if (!meta?.data.pages) {
    children = buildAll(files, ctx, (file) => isRoot || file !== indexPath);
  } else {
    const restItems = new Set(files);
    const resolved = meta.data.pages.flatMap((item, i) => resolveFolderItem(folderPath, item, ctx, i, restItems));
    if (!isRoot && !restItems.has(indexPath)) {
      indexDisabled = true;
    }
    for (let i = 0; i < resolved.length; i++) {
      const item = resolved[i];
      if (item !== rest && item !== restReversed) continue;
      const items = buildAll(
        files,
        ctx,
        // index files are not included in ... unless it's a root folder
        (file) => (file !== indexPath || isRoot) && restItems.has(file),
        item === restReversed
      );
      resolved.splice(i, 1, ...items);
      break;
    }
    children = resolved;
  }
  const index = !indexDisabled ? buildFileNode(indexPath, ctx) : void 0;
  let name = meta?.data.title ?? index?.name;
  if (!name) {
    const folderName = basename(folderPath);
    name = pathToName(group.exec(folderName)?.[1] ?? folderName);
  }
  const node = {
    type: "folder",
    name,
    icon: options.resolveIcon?.(meta?.data.icon) ?? index?.icon,
    root: meta?.data.root,
    defaultOpen: meta?.data.defaultOpen,
    description: meta?.data.description,
    index,
    children,
    $id: folderPath,
    $ref: !options.noRef && meta ? {
      metaFile: metaPath
    } : void 0
  };
  return options.attachFolder?.(
    node,
    {
      get children() {
        return files.flatMap((file) => storage.read(file) ?? []);
      }
    },
    meta
  ) ?? node;
}
function buildFileNode(path, { options, getUrl, storage, localeStorage, locale }) {
  const page = localeStorage?.read(path) ?? storage.read(path);
  if (page?.format !== "page") return;
  const { title, description, icon } = page.data;
  const item = {
    $id: path,
    type: "page",
    name: title ?? pathToName(basename(path, extname(path))),
    description,
    icon: options.resolveIcon?.(icon),
    url: getUrl(page.slugs, locale),
    $ref: !options.noRef ? {
      file: path
    } : void 0
  };
  return options.attachFile?.(item, page) ?? item;
}
function build(ctx) {
  const folder = buildFolderNode("", true, ctx);
  return {
    $id: ctx.locale ?? "root",
    name: folder.name,
    children: folder.children
  };
}
function createPageTreeBuilder(getUrl) {
  function createFlattenPathResolver(storage) {
    const map = /* @__PURE__ */ new Map();
    const files = storage.getFiles();
    for (const file of files) {
      const content = storage.read(file);
      const flattenPath = file.substring(0, file.length - extname(file).length);
      map.set(flattenPath + "." + content.format, file);
    }
    return (name, format) => {
      return map.get(name + "." + format);
    };
  }
  return {
    build(options) {
      const resolve = createFlattenPathResolver(options.storage);
      return build({
        options,
        builder: this,
        storage: options.storage,
        getUrl,
        resolveName(name, format) {
          return resolve(name, format) ?? name;
        }
      });
    },
    buildI18n({ i18n, ...options }) {
      const storage = options.storages[i18n.defaultLanguage];
      const resolve = createFlattenPathResolver(storage);
      const entries = i18n.languages.map((lang) => {
        const tree = build({
          options,
          getUrl,
          builder: this,
          locale: lang,
          storage,
          localeStorage: options.storages[lang],
          resolveName(name, format) {
            return resolve(name, format) ?? name;
          }
        });
        return [lang, tree];
      });
      return Object.fromEntries(entries);
    }
  };
}
function pathToName(name) {
  const result = [];
  for (const c of name) {
    if (result.length === 0) result.push(c.toLocaleUpperCase());
    else if (c === "-") result.push(" ");
    else result.push(c);
  }
  return result.join("");
}

// src/source/file-system.ts
var FileSystem = class {
  constructor() {
    this.files = /* @__PURE__ */ new Map();
    this.folders = /* @__PURE__ */ new Map();
    this.folders.set("", []);
  }
  read(path) {
    return this.files.get(path);
  }
  /**
   * get the direct children of folder (in virtual file path)
   */
  readDir(path) {
    return this.folders.get(path);
  }
  write(path, file) {
    const dir = dirname(path);
    this.makeDir(dir);
    this.readDir(dir)?.push(path);
    this.files.set(path, file);
  }
  getFiles() {
    return Array.from(this.files.keys());
  }
  makeDir(path) {
    const segments = splitPath(path);
    for (let i = 0; i < segments.length; i++) {
      const segment = segments.slice(0, i + 1).join("/");
      if (this.folders.has(segment)) continue;
      this.folders.set(segment, []);
      this.folders.get(dirname(segment)).push(segment);
    }
  }
};

// src/source/load-files.ts
function loadFiles(files, options) {
  const { transformers = [] } = options;
  const storage = new FileSystem();
  const normalized = files.map((file) => ({
    ...file,
    path: normalizePath(file.path)
  }));
  for (const item of options.buildFiles(normalized)) {
    storage.write(item.path, item);
  }
  for (const transformer of transformers) {
    transformer({
      storage,
      options
    });
  }
  return storage;
}
function loadFilesI18n(files, options, i18n) {
  const parser = i18n.parser === "dir" ? dirParser : dotParser;
  const storages = {};
  for (const lang of i18n.languages) {
    storages[lang] = loadFiles(
      files.flatMap((file) => {
        const [path, locale] = parser(normalizePath(file.path));
        if ((locale ?? i18n.defaultLanguage) === lang) {
          return {
            ...file,
            path
          };
        }
        return [];
      }),
      options
    );
  }
  return storages;
}
function dirParser(path) {
  const parsed = path.split("/");
  if (parsed.length >= 2) return [parsed.slice(1).join("/"), parsed[0]];
  return [path];
}
function dotParser(path) {
  const segs = path.split("/");
  if (segs.length === 0) return [path];
  const name = segs[segs.length - 1].split(".");
  if (name.length >= 3) {
    const locale = name.splice(name.length - 2, 1)[0];
    if (locale.length > 0 && !/\d+/.test(locale)) {
      segs[segs.length - 1] = name.join(".");
      return [segs.join("/"), locale];
    }
  }
  return [path];
}
function normalizePath(path) {
  const segments = splitPath(slash(path));
  if (segments[0] === "." || segments[0] === "..")
    throw new Error("It must not start with './' or '../'");
  return segments.join("/");
}

// src/source/loader.ts
function indexPages(storages, getUrl, i18n) {
  const result = {
    // (locale.slugs -> page)
    pages: /* @__PURE__ */ new Map(),
    // (locale.path -> page)
    pathToMeta: /* @__PURE__ */ new Map(),
    // (locale.path -> meta)
    pathToPage: /* @__PURE__ */ new Map()
  };
  const defaultLanguage = i18n?.defaultLanguage ?? "";
  for (const filePath of storages[defaultLanguage].getFiles()) {
    const item = storages[defaultLanguage].read(filePath);
    if (item.format === "meta") {
      result.pathToMeta.set(
        `${defaultLanguage}.${item.path}`,
        fileToMeta(item)
      );
    }
    if (item.format === "page") {
      const page = fileToPage(item, getUrl, defaultLanguage);
      result.pathToPage.set(`${defaultLanguage}.${item.path}`, page);
      result.pages.set(`${defaultLanguage}.${page.slugs.join("/")}`, page);
      if (!i18n) continue;
      for (const lang of i18n.languages) {
        if (lang === defaultLanguage) continue;
        const localizedItem = storages[lang].read(filePath);
        const localizedPage = fileToPage(
          localizedItem?.format === "page" ? localizedItem : item,
          getUrl,
          lang
        );
        if (localizedItem) {
          result.pathToPage.set(`${lang}.${item.path}`, localizedPage);
        }
        result.pages.set(
          `${lang}.${localizedPage.slugs.join("/")}`,
          localizedPage
        );
      }
    }
  }
  return result;
}
function createGetUrl(baseUrl, i18n) {
  const baseSlugs = baseUrl.split("/");
  return (slugs, locale) => {
    const hideLocale = i18n?.hideLocale ?? "never";
    let urlLocale;
    if (hideLocale === "never") {
      urlLocale = locale;
    } else if (hideLocale === "default-locale" && locale !== i18n?.defaultLanguage) {
      urlLocale = locale;
    }
    const paths = [...baseSlugs, ...slugs];
    if (urlLocale) paths.unshift(urlLocale);
    return `/${paths.filter((v) => v.length > 0).join("/")}`;
  };
}
function loader(options) {
  return createOutput(options);
}
function createOutput(options) {
  if (!options.url && !options.baseUrl) {
    console.warn("`loader()` now requires a `baseUrl` option to be defined.");
  }
  const {
    source,
    baseUrl = "/",
    i18n,
    slugs: slugsFn,
    url: getUrl = createGetUrl(baseUrl ?? "/", i18n),
    transformers
  } = options;
  const defaultLanguage = i18n?.defaultLanguage ?? "";
  const files = typeof source.files === "function" ? source.files() : source.files;
  function buildFiles(files2) {
    const indexFiles = [];
    const taken = /* @__PURE__ */ new Set();
    for (const file of files2) {
      if (file.type !== "page" || file.slugs) continue;
      if (isIndex(file.path) && !slugsFn) {
        indexFiles.push(file);
        continue;
      }
      file.slugs = slugsFn ? slugsFn(parseFilePath(file.path)) : getSlugs(file.path);
      const key = file.slugs.join("/");
      if (taken.has(key)) throw new Error("Duplicated slugs");
      taken.add(key);
    }
    for (const file of indexFiles) {
      file.slugs = getSlugs(file.path);
      if (taken.has(file.slugs.join("/"))) file.slugs.push("index");
    }
    return files2.map((file) => {
      if (file.type === "page") {
        return {
          format: "page",
          path: file.path,
          slugs: file.slugs,
          data: file.data,
          absolutePath: file.absolutePath ?? ""
        };
      }
      return {
        format: "meta",
        path: file.path,
        absolutePath: file.absolutePath ?? "",
        data: file.data
      };
    });
  }
  const storages = i18n ? loadFilesI18n(
    files,
    {
      buildFiles,
      transformers
    },
    {
      ...i18n,
      parser: i18n.parser ?? "dot"
    }
  ) : {
    "": loadFiles(files, {
      transformers,
      buildFiles
    })
  };
  const walker = indexPages(storages, getUrl, i18n);
  const builder = createPageTreeBuilder(getUrl);
  let pageTree;
  return {
    _i18n: i18n,
    get pageTree() {
      if (i18n) {
        pageTree ??= builder.buildI18n({
          storages,
          resolveIcon: options.icon,
          i18n,
          ...options.pageTree
        });
      } else {
        pageTree ??= builder.build({
          storage: storages[""],
          resolveIcon: options.icon,
          ...options.pageTree
        });
      }
      return pageTree;
    },
    set pageTree(v) {
      pageTree = v;
    },
    getPageByHref(href, { dir = "", language } = {}) {
      const [value, hash] = href.split("#", 2);
      let target;
      if (value.startsWith(".") && (value.endsWith(".md") || value.endsWith(".mdx"))) {
        const path = joinPath(dir, value);
        target = walker.pathToPage.get(`${language}.${path}`);
      } else {
        target = this.getPages(language).find((item) => item.url === value);
      }
      if (target)
        return {
          page: target,
          hash
        };
    },
    getPages(language = defaultLanguage) {
      const pages = [];
      for (const [key, value] of walker.pages.entries()) {
        if (key.startsWith(`${language}.`)) pages.push(value);
      }
      return pages;
    },
    getLanguages() {
      const list = [];
      if (!options.i18n) return list;
      for (const language of options.i18n.languages) {
        list.push({
          language,
          pages: this.getPages(language)
        });
      }
      return list;
    },
    getPage(slugs = [], language = defaultLanguage) {
      return walker.pages.get(`${language}.${slugs.join("/")}`);
    },
    getNodeMeta(node, language = defaultLanguage) {
      const ref = node.$ref?.metaFile;
      if (!ref) return;
      return walker.pathToMeta.get(`${language}.${ref}`);
    },
    getNodePage(node, language = defaultLanguage) {
      const ref = node.$ref?.file;
      if (!ref) return;
      return walker.pathToPage.get(`${language}.${ref}`);
    },
    getPageTree(locale) {
      if (options.i18n) {
        return this.pageTree[locale ?? defaultLanguage];
      }
      return this.pageTree;
    },
    // @ts-expect-error -- ignore this
    generateParams(slug, lang) {
      if (options.i18n) {
        return this.getLanguages().flatMap(
          (entry) => entry.pages.map((page) => ({
            [slug ?? "slug"]: page.slugs,
            [lang ?? "lang"]: entry.language
          }))
        );
      }
      return this.getPages().map((page) => ({
        [slug ?? "slug"]: page.slugs
      }));
    }
  };
}
function fileToMeta(file) {
  return {
    path: file.path,
    absolutePath: file.absolutePath,
    get file() {
      return parseFilePath(this.path);
    },
    data: file.data
  };
}
function fileToPage(file, getUrl, locale) {
  return {
    get file() {
      return parseFilePath(this.path);
    },
    absolutePath: file.absolutePath,
    path: file.path,
    url: getUrl(file.slugs, locale),
    slugs: file.slugs,
    data: file.data,
    locale
  };
}
var GroupRegex = /^\(.+\)$/;
function isIndex(file) {
  return basename(file, extname(file)) === "index";
}
function getSlugs(file) {
  if (typeof file !== "string") return getSlugs(file.path);
  const dir = dirname(file);
  const name = basename(file, extname(file));
  const slugs = [];
  for (const seg of dir.split("/")) {
    if (seg.length > 0 && !GroupRegex.test(seg)) slugs.push(encodeURI(seg));
  }
  if (GroupRegex.test(name))
    throw new Error(`Cannot use folder group in file names: ${file}`);
  if (name !== "index") {
    slugs.push(encodeURI(name));
  }
  return slugs;
}
export {
  FileSystem,
  createGetUrl,
  createPageTreeBuilder,
  getSlugs,
  loadFiles,
  loader,
  parseFilePath,
  parseFolderPath
};
