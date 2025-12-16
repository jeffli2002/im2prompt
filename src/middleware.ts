import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip i18n middleware for admin routes and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const hostname = request.headers.get('host');

  if (hostname && !hostname.startsWith('www.') && !hostname.startsWith('localhost')) {
    const url = request.nextUrl.clone();
    url.host = `www.${hostname}`;
    return NextResponse.redirect(url, 301);
  }

  const response = intlMiddleware(request);
  const baseUrl = 'https://www.im2prompt.com';

  const canonicalPaths: Record<string, string> = {
    '/': '/',
    '/image-to-prompt': '/image-to-prompt',
    '/text-to-prompt': '/text-to-prompt',
    '/text-to-image': '/text-to-image',
    '/text-to-video': '/text-to-video',
    '/image-to-video': '/image-to-video',
    '/blog': '/blog',
    '/prompt-library': '/prompt-library',
    '/login': '/login',
    '/signup': '/signup',
    '/terms': '/terms',
    '/privacy': '/privacy',
    '/refund': '/refund',
  };

  for (const [path, canonical] of Object.entries(canonicalPaths)) {
    if (pathname === path || pathname === `/${routing.defaultLocale}${path}`) {
      response.headers.set('Link', `<${baseUrl}${canonical}>; rel="canonical"`);
      break;
    }
  }

  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
