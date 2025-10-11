// src/source/path.ts
function basename(path, ext) {
  const idx = path.lastIndexOf("/");
  return path.substring(
    idx === -1 ? 0 : idx + 1,
    ext ? path.length - ext.length : path.length
  );
}
function extname(path) {
  const dotIdx = path.lastIndexOf(".");
  if (dotIdx !== -1) {
    return path.substring(dotIdx);
  }
  return "";
}
function dirname(path) {
  return path.split("/").slice(0, -1).join("/");
}
function parseFilePath(path) {
  const ext = extname(path);
  const name = basename(path, ext);
  const dir = dirname(path);
  return {
    dirname: dir,
    name,
    ext,
    path,
    get flattenedPath() {
      return [dir, name].filter((p) => p.length > 0).join("/");
    }
  };
}
function parseFolderPath(path) {
  return {
    dirname: dirname(path),
    name: basename(path),
    path
  };
}

export {
  basename,
  extname,
  dirname,
  parseFilePath,
  parseFolderPath
};
