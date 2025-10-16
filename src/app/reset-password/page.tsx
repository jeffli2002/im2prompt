import { redirect } from 'next/navigation';

import { routing } from '@/i18n/routing';

export default function ResetPasswordRedirectPage() {
  const targetLocale = routing.defaultLocale ?? 'en';
  redirect(`/${targetLocale}/reset-password`);
}
