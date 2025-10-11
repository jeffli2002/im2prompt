"use client";
import {
  _highlight,
  _renderHighlight,
  highlight
} from "../chunk-3NX26V7I.js";

// src/highlight/client.tsx
import {
  use,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import { jsx } from "react/jsx-runtime";
function useShiki(code, {
  withPrerenderScript = false,
  loading,
  ...options
}, deps) {
  const markupId = useId();
  const key = useMemo(
    () => deps ? JSON.stringify(deps) : `${options.lang}:${code}`,
    [code, deps, options.lang]
  );
  const shikiOptions = {
    ...options,
    engine: options.engine ?? "js"
  };
  const currentTask = useRef({
    key,
    aborted: false
  });
  const [rendered, setRendered] = useState(() => {
    const element = withPrerenderScript && typeof document !== "undefined" ? document.querySelector(`[data-markup-id="${markupId}"]`) : null;
    const attr = element?.getAttribute("data-markup");
    if (attr) {
      const hast = JSON.parse(attr);
      return renderHighlightWithMarkup(markupId, hast, shikiOptions, attr);
    }
    currentTask.current = void 0;
    return loading;
  });
  useEffect(() => {
    if (currentTask.current?.key === key) return;
    if (currentTask.current) {
      currentTask.current.aborted = true;
    }
    const task = {
      key,
      aborted: false
    };
    currentTask.current = task;
    void highlight(code, shikiOptions).then((result) => {
      if (!task.aborted) setRendered(result);
    });
  }, [key]);
  if (typeof window === "undefined") {
    return use(
      _highlight(code, shikiOptions).then(
        (tree) => renderHighlightWithMarkup(markupId, tree, shikiOptions)
      )
    );
  }
  return rendered;
}
function renderHighlightWithMarkup(id, tree, shikiOptions, rawAttr) {
  const Pre = shikiOptions.components?.pre ?? "pre";
  return _renderHighlight(tree, {
    ...shikiOptions,
    components: {
      ...shikiOptions.components,
      pre: (props) => /* @__PURE__ */ jsx(
        Pre,
        {
          ...props,
          "data-markup-id": id,
          "data-markup": rawAttr ?? JSON.stringify(tree)
        }
      )
    }
  });
}
export {
  useShiki
};
