import { env } from '@/env';
import { auth } from '@/lib/auth/auth';
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
  const cookieHeader = headerList.get('cookie');

  if (cookieHeader) {
    return await auth.api.getSession({
      headers: headerList,
    });
  }

  const cookieStore = await cookies();
  const serializedCookies = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const fallbackHeaders = new Headers();
  if (serializedCookies) {
    fallbackHeaders.set('cookie', serializedCookies);
  }

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
  console.log(
    '[getSessionFromRequest] Cookie header:',
    requestHeaders.get('cookie') ? 'present' : 'missing'
  );
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  console.log('[getSessionFromRequest] Result:', session?.user?.email || 'no session');
  return session;
}
