import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { SidebarFolder, SidebarFolderContent, SidebarFolderLink, SidebarFolderTrigger, SidebarItem, } from '../../components/layout/sidebar.js';
import { getSidebarTabs, } from '../../utils/get-sidebar-tabs.js';
export function SidebarLinkItem({ item, ...props }) {
    if (item.type === 'menu')
        return (_jsxs(SidebarFolder, { ...props, children: [item.url ? (_jsxs(SidebarFolderLink, { href: item.url, children: [item.icon, item.text] })) : (_jsxs(SidebarFolderTrigger, { children: [item.icon, item.text] })), _jsx(SidebarFolderContent, { children: item.items.map((child, i) => (_jsx(SidebarLinkItem, { item: child }, i))) })] }));
    if (item.type === 'custom')
        return _jsx("div", { ...props, children: item.children });
    return (_jsx(SidebarItem, { href: item.url, icon: item.icon, external: item.external, ...props, children: item.text }));
}
export function getSidebarTabsFromOptions(options, tree) {
    if (Array.isArray(options)) {
        return options;
    }
    else if (typeof options === 'object') {
        return getSidebarTabs(tree, options);
    }
    else if (options !== false) {
        return getSidebarTabs(tree);
    }
}
