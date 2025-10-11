import { auth } from '@/lib/auth/auth';
import { env } from '@/env';
import { headers } from 'next/headers';

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

  // Otherwise get real session from better-auth
  return await auth.api.getSession({
    headers: await headers(),
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
    headers: requestHeaders,
  });
}
