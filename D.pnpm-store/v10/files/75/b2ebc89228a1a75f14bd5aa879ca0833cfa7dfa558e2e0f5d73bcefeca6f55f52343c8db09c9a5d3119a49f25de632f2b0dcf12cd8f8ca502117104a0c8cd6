import type { ReactNode } from 'react';
import type { LinkItemType } from '../layouts/links.js';
import type { NavProviderProps } from '../contexts/layout.js';
import type { I18nConfig } from 'fumadocs-core/i18n';
export interface NavOptions extends NavProviderProps {
    enabled: boolean;
    component: ReactNode;
    title?: ReactNode;
    /**
     * Redirect url of title
     * @defaultValue '/'
     */
    url?: string;
    children?: ReactNode;
}
export interface BaseLayoutProps {
    themeSwitch?: {
        enabled?: boolean;
        component?: ReactNode;
        mode?: 'light-dark' | 'light-dark-system';
    };
    searchToggle?: Partial<{
        enabled: boolean;
        components: Partial<{
            sm: ReactNode;
            lg: ReactNode;
        }>;
    }>;
    /**
     * Remove theme switcher component
     *
     * @deprecated Use `themeSwitch.enabled` instead.
     */
    disableThemeSwitch?: boolean;
    /**
     * I18n options
     *
     * @defaultValue false
     */
    i18n?: boolean | I18nConfig;
    /**
     * GitHub url
     */
    githubUrl?: string;
    links?: LinkItemType[];
    /**
     * Replace or disable navbar
     */
    nav?: Partial<NavOptions>;
    children?: ReactNode;
}
export { type LinkItemType };
/**
 * Get Links Items with shortcuts
 */
export declare function getLinks(links?: LinkItemType[], githubUrl?: string): LinkItemType[];
//# sourceMappingURL=shared.d.ts.map