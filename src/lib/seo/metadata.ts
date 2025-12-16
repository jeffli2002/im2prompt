import type { Metadata } from 'next';

const FALLBACK_APP_URL = 'http://localhost:3000';

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? FALLBACK_APP_URL;

let metadataBase: URL;
try {
  metadataBase = new URL(rawAppUrl);
} catch {
  metadataBase = new URL(FALLBACK_APP_URL);
}

export const DEFAULT_SEO_KEYWORDS_EN: string[] = [
  'ai image to prompt',
  'image to prompt generator',
  'ai prompt generator',
  'image analysis ai',
  'prompt engineering',
  'ai art prompt',
  'image description ai',
  'im2prompt',
];

export const DEFAULT_SEO_KEYWORDS_ZH: string[] = [
  'AI图片转提示词',
  '图片转提示词生成器',
  'AI提示词生成',
  '图片分析AI',
  '提示词工程',
  'AI艺术提示词',
  '图片描述AI',
  'im2prompt',
];

export const DEFAULT_SEO_KEYWORDS: string[] = DEFAULT_SEO_KEYWORDS_EN;

export function getMetadataBase(): URL {
  return metadataBase;
}

export function buildCanonicalMetadata(pathname: string): Metadata {
  if (!pathname.startsWith('/')) {
    // Ensure the canonical path is always absolute relative to the domain
    // eslint-disable-next-line no-param-reassign
    pathname = `/${pathname}`;
  }
  return {
    alternates: {
      canonical: pathname,
    },
  };
}

export function buildLocaleCanonicalMetadata(
  locale: string | undefined,
  pathname: string
): Metadata {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const localePrefix = locale ? `/${locale.replace(/^\/+/, '')}` : '';
  const fullPath =
    normalizedPath === '/' ? `${localePrefix || '/'}` : `${localePrefix}${normalizedPath}`;
  return buildCanonicalMetadata(fullPath || '/');
}

