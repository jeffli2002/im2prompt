"use client";

// src/hide-if-empty.tsx
import React from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var isEmpty = (node) => {
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes.item(i);
    if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.ELEMENT_NODE && window.getComputedStyle(child).display !== "none") {
      return false;
    }
  }
  return true;
};
function HideIfEmpty({ children }) {
  const id = React.useId();
  const [empty, setEmpty] = React.useState();
  React.useEffect(() => {
    const element = document.querySelector(
      `[data-fdid="${id}"]`
    );
    if (!element) return;
    const onUpdate = () => {
      setEmpty(isEmpty(element));
    };
    const observer = new ResizeObserver(onUpdate);
    observer.observe(element);
    onUpdate();
    return () => {
      observer.disconnect();
    };
  }, [id]);
  let child;
  if (React.isValidElement(children)) {
    child = React.cloneElement(children, {
      ...children.props,
      "data-fdid": id,
      "data-empty": empty,
      suppressHydrationWarning: true
    });
  } else {
    child = React.Children.count(children) > 1 ? React.Children.only(null) : null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    child,
    empty === void 0 && /* @__PURE__ */ jsx(
      "script",
      {
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: {
          __html: `{
const element = document.querySelector('[data-fdid="${id}"]')
if (element) {
  element.setAttribute('data-empty', String((${isEmpty.toString()})(element)))
}}`
        }
      }
    )
  ] });
}
export {
  HideIfEmpty
};
