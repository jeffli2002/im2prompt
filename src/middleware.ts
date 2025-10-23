import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  
  if (hostname && !hostname.startsWith('www.') && !hostname.startsWith('localhost')) {
    const url = request.nextUrl.clone();
    url.host = `www.${hostname}`;
    return NextResponse.redirect(url, 301);
  }
  
  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
