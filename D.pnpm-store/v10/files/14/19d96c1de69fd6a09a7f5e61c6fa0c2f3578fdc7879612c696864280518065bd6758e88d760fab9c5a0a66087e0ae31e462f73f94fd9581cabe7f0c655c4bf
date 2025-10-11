// src/utils/remove-undefined.ts
function removeUndefined(value, deep = false) {
  const obj = value;
  for (const key of Object.keys(obj)) {
    if (obj[key] === void 0) delete obj[key];
    if (deep && typeof obj[key] === "object" && obj[key] !== null) {
      removeUndefined(obj[key], deep);
    } else if (deep && Array.isArray(obj[key])) {
      obj[key].forEach((v) => removeUndefined(v, deep));
    }
  }
  return value;
}

export {
  removeUndefined
};
