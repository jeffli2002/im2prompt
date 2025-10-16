'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function ResetPasswordContent() {
  const t = useTranslations('auth.resetPassword');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const tokenError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [requestState, setRequestState] = useState<FormState>('idle');
  const [requestError, setRequestError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetState, setResetState] = useState<FormState>('idle');
  const [resetError, setResetError] = useState<string | null>(null);

  const showResetForm = useMemo(() => Boolean(token && !tokenError), [token, tokenError]);
  const showInvalidTokenNotice = useMemo(() => tokenError === 'INVALID_TOKEN', [tokenError]);

  const handleRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

    setRequestState('submitting');
    setRequestError(null);

    try {
      const redirectTo = `${window.location.origin}/${locale}/reset-password`;
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirectTo,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error?.message || data?.message || t('requestUnknownError'));
      }

      setRequestState('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('requestUnknownError');
      setRequestError(message);
      setRequestState('error');
    }
  };

  const handleResetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setResetError(t('mismatch'));
      setResetState('error');
      return;
    }

    if (newPassword.length < 8) {
      setResetError(t('minLength'));
      setResetState('error');
      return;
    }

    setResetState('submitting');
    setResetError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error?.message || data?.message || t('resetUnknownError'));
      }

      setResetState('success');
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1800);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('resetUnknownError');
      setResetError(message);
      setResetState('error');
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card className="border border-border/80 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              {showResetForm ? t('tokenTitle') : t('title')}
            </CardTitle>
            <CardDescription>
              {showResetForm ? t('tokenSubtitle') : t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showInvalidTokenNotice && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {t('tokenError')}
              </div>
            )}

            {showResetForm ? (
              <form className="space-y-5" onSubmit={handleResetSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">{t('newPasswordLabel')}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={resetState === 'submitting'}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">{t('confirmPasswordLabel')}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={resetState === 'submitting'}
                  />
                </div>

                {resetError && (
                  <p className="text-sm text-destructive">{resetError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetState === 'submitting'}
                >
                  {resetState === 'submitting' ? t('updating') : t('updateButton')}
                </Button>

                {resetState === 'success' && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">
                    {t('tokenSuccess')}
                  </div>
                )}
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleRequestSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    disabled={requestState === 'submitting' || requestState === 'success'}
                  />
                </div>

                {requestError && (
                  <p className="text-sm text-destructive">{requestError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestState === 'submitting' || requestState === 'success'}
                >
                  {requestState === 'submitting' ? t('sending') : t('submit')}
                </Button>

                {requestState === 'success' && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">
                    {t('success')}
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        <div
          className={cn(
            'text-center text-sm text-muted-foreground',
            'flex flex-col items-center gap-2'
          )}
        >
          <Link href={`/${locale}/login`} className="underline underline-offset-4 hover:text-primary">
            {t('backToLogin')}
          </Link>
          {showInvalidTokenNotice && (
            <Link
              href={`/${locale}/reset-password`}
              className="text-xs underline underline-offset-4 hover:text-primary"
            >
              {t('requestAnother')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
