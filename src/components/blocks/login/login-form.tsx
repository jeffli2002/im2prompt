'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { LoginFormProps } from '@/types/login';

export function LoginForm({ 
  className, 
  formData,
  setFormData,
  isLoading,
  error,
  onEmailLogin,
  onSocialLogin,
  onClearError,
  ...props 
}: LoginFormProps & React.ComponentProps<'div'>) {
  const t = useTranslations('auth');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('welcomeBack')}</CardTitle>
          <CardDescription>{t('loginWithSocial')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onEmailLogin} data-testid="login-form">
            <div className="grid gap-6">
              {/* Error message display */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
                  {error}
                  <button
                    type="button"
                    onClick={onClearError}
                    className="ml-2 underline hover:no-underline"
                  >
                    {t('closeError')}
                  </button>
                </div>
              )}

                              {/* Social login buttons */}
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  onClick={() => onSocialLogin('google')}
                  disabled={isLoading}
                  data-testid="google-login-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="mr-2 h-5 w-5"
                    role="img"
                    aria-label="Google"
                  >
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  {isLoading ? t('loggingIn') : t('googleSignIn')}
                </Button>
              </div>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  {t('orUseEmail')}
                </span>
              </div>

                              {/* Email password login */}
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={formData.email}
                    onChange={handleEmailChange}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    data-testid="email-input"
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">{t('password')}</Label>
                    <a
                      href="/reset-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      {t('forgotPassword')}
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    data-testid="password-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !formData.email || !formData.password}
                  data-testid="login-button"
                >
                  {isLoading ? t('loggingIn') : t('login')}
                </Button>
              </div>

              <div className="text-center text-sm">
                {t('noAccount')}{' '}
                <a href="/signup" className="underline underline-offset-4">
                  {t('signUpLink')}
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        {t('termsAndPrivacy.prefix')}{' '}
        <a href="/terms" className="underline underline-offset-4 hover:text-primary">
          {t('termsOfService')}
        </a>
        {' '}{t('termsAndPrivacy.middle')}{' '}
        <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
          {t('privacyPolicy')}
        </a>
        {t('termsAndPrivacy.suffix')}
      </div>
    </div>
  );
}
