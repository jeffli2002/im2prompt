import { auth } from '@/lib/auth/auth';
import { env } from '@/env';
import { cookies, headers } from 'next/headers';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

export interface Session {
  user?: SessionUser;
}

/**
 * Get session with support for DISABLE_AUTH bypass
 * This function can be used in both server actions and API routes
 *
 * When DISABLE_AUTH=true, returns a mock dev user session
 * Otherwise, returns the real session from better-auth
 */
export async function getSessionWithAuthBypass(): Promise<Session | null> {
  // If auth is disabled, return mock dev user
  if (env.DISABLE_AUTH === 'true') {
    return {
      user: {
        id: 'dev-user',
        email: 'dev@example.com',
        name: 'Dev User',
      },
    };
  }

  const headerList = await headers();
  const headerEntries = Object.fromEntries(headerList.entries());
  if (headerEntries.cookie) {
    return await auth.api.getSession({
      headers: headerEntries,
    });
  }

  const cookieStore = await cookies();
  const serializedCookies = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  if (!serializedCookies) {
    return await auth.api.getSession({
      headers: headerEntries,
    });
  }

  const fallbackHeaders = {
    ...headerEntries,
    cookie: serializedCookies,
  };
  return await auth.api.getSession({
    headers: fallbackHeaders,
  });
}

/**
 * Get session from NextRequest headers (for API routes)
 * Supports DISABLE_AUTH bypass
 */
export async function getSessionFromRequest(requestHeaders: Headers): Promise<Session | null> {
  // If auth is disabled, return mock dev user
  if (env.DISABLE_AUTH === 'true') {
    return {
      user: {
        id: 'dev-user',
        email: 'dev@example.com',
        name: 'Dev User',
      },
    };
  }

  // Otherwise get real session from better-auth
  return await auth.api.getSession({
    headers: Object.fromEntries(requestHeaders.entries()),
  });
}
