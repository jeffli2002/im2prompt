import { env } from '@/env';
import db from '@/server/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, apiKey } from 'better-auth/plugins';



export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    'https://im2prompt.com',
    'https://www.im2prompt.com',
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
      scopes: ['openid', 'email', 'profile'],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 3,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 
    },
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
    crossSubDomainCookies: {
      enabled: true,
      domain: '.im2prompt.com',
    },
  },
  plugins: [
    admin(),
    apiKey()
  ]
});
