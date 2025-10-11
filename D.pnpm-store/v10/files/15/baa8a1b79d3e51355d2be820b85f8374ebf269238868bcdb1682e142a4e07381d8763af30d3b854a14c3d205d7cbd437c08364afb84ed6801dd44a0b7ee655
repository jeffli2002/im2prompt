import * as react from 'react';
import { ReactNode } from 'react';
import { VFile } from 'vfile';
import { Components } from 'hast-util-to-jsx-runtime';
import { PluggableList } from 'unified';

interface MarkdownProps {
    components?: Components;
}
declare function Markdown({ children: content, remarkPlugins, rehypePlugins, ...options }: MarkdownProps & {
    remarkPlugins?: PluggableList;
    rehypePlugins?: PluggableList;
    children: string | VFile;
}): Promise<react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<ReactNode> | (string | number | bigint | boolean | react.ReactPortal | react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined)>;

export { Markdown };
