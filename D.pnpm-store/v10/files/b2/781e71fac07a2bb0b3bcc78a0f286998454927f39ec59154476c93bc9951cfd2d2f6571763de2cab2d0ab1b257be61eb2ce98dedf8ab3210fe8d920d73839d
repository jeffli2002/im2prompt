import { type HTMLAttributes } from 'react';
import { type BaseLayoutProps } from '../layouts/shared.js';
import { type SidebarOptions } from '../layouts/docs/shared.js';
import type { PageTree } from 'fumadocs-core/server';
import { Navbar, NavbarSidebarTrigger } from './notebook-client.js';
export interface DocsLayoutProps extends BaseLayoutProps {
    tree: PageTree.Root;
    tabMode?: 'sidebar' | 'navbar';
    nav?: BaseLayoutProps['nav'] & {
        mode?: 'top' | 'auto';
    };
    sidebar?: Partial<SidebarOptions>;
    containerProps?: HTMLAttributes<HTMLDivElement>;
}
export declare function DocsLayout(props: DocsLayoutProps): import("react/jsx-runtime").JSX.Element;
export { Navbar, NavbarSidebarTrigger };
//# sourceMappingURL=notebook.d.ts.map