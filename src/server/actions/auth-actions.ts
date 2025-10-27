import { env } from '@/env';
import { auth } from '@/lib/auth/auth';
import { isAdmin } from '@/lib/auth/permissions';
import { headers } from 'next/headers';

/**
 * Check if authentication is disabled for development
 */
export function isAuthDisabled(): boolean {
  return env.DISABLE_AUTH === 'true';
}

/**
 * Get user admin status on server side
 * Only checks if user is admin, no complex permission calculations needed
 * Note: This function uses headers() and requires dynamic rendering
 */
export async function getUserAdminStatus(): Promise<boolean> {
  'use server';

  // If auth is disabled, return true (user is admin)
  if (isAuthDisabled()) {
    return true;
  }

  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: Object.fromEntries(headersList.entries()),
    });

    if (!session?.user) {
      return false;
    }

    return isAdmin(session.user);
  } catch (error) {
    // Only log the error type and message, not the full error object
    console.error('Error getting user admin status:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
