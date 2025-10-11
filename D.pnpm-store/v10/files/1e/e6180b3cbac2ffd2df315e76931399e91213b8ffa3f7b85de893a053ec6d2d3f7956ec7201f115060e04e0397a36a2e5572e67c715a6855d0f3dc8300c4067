'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, usePathname } from 'fumadocs-core/framework';
import { useMemo, useRef } from 'react';
import { searchPath } from 'fumadocs-core/breadcrumb';
const TreeContext = createContext('TreeContext');
const PathContext = createContext('PathContext', []);
export function TreeContextProvider(props) {
    const nextIdRef = useRef(0);
    const pathname = usePathname();
    // I found that object-typed props passed from a RSC will be re-constructed, hence breaking all hooks' dependencies
    // using the id here to make sure this never happens
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const tree = useMemo(() => props.tree, [props.tree.$id ?? props.tree]);
    const path = useMemo(() => searchPath(tree.children, pathname) ?? [], [tree, pathname]);
    const root = path.findLast((item) => item.type === 'folder' && item.root) ?? tree;
    root.$id ?? (root.$id = String(nextIdRef.current++));
    return (_jsx(TreeContext.Provider, { value: useMemo(() => ({ root }), [root]), children: _jsx(PathContext.Provider, { value: path, children: props.children }) }));
}
export function useTreePath() {
    return PathContext.use();
}
export function useTreeContext() {
    return TreeContext.use('You must wrap this component under <DocsLayout />');
}
