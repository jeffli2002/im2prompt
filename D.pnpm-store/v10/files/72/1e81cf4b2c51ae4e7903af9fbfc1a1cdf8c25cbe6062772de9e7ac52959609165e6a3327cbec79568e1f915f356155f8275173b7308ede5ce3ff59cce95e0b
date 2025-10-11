import {
  Link
} from "./chunk-BBP7MIO4.js";

// src/link.tsx
import { forwardRef } from "react";
import { jsx } from "react/jsx-runtime";
var Link2 = forwardRef(
  ({
    href = "#",
    external = !(href.startsWith("/") || href.startsWith("#") || href.startsWith(".")),
    prefetch,
    ...props
  }, ref) => {
    if (external) {
      return /* @__PURE__ */ jsx(
        "a",
        {
          ref,
          href,
          rel: "noreferrer noopener",
          target: "_blank",
          ...props,
          children: props.children
        }
      );
    }
    return /* @__PURE__ */ jsx(Link, { ref, href, prefetch, ...props });
  }
);
Link2.displayName = "Link";

export {
  Link2 as Link
};
