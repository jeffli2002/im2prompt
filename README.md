# im2prompt

AI-powered image-to-prompt generation application built with Next.js, Better Auth, and Neon Database.

## Features

- 🔐 Authentication with Better Auth (Email/Password, Google OAuth, GitHub OAuth)
- 🗄️ PostgreSQL database with Neon
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🌍 Internationalization support (English/Chinese)
- 💳 Payment integration with Stripe
- 📊 Credit system for API usage
- 📁 File management with R2 storage
- 🔑 API key management
- 👥 Admin dashboard

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- PostgreSQL database (Neon recommended)
- Google OAuth credentials
- Stripe account (for payments)
- Cloudflare R2 account (for file storage)

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="your-postgres-connection-string"

# Auth
BETTER_AUTH_SECRET="your-secret-key"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Storage
R2_BUCKET_NAME="your-bucket-name"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_ENDPOINT="your-r2-endpoint"
R2_PUBLIC_URL="your-public-url"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"

# Admin
ADMIN_EMAILS="admin@example.com"
CRON_SECRET="your-cron-secret"
```

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm run db:push

# Start development server
pnpm run dev
```

### OAuth Setup

For Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

For production deployment on Vercel, add:
- `https://your-app.vercel.app/api/auth/callback/google`

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Setup

Make sure to run the migrations on your production database:

```sql
-- Run the SQL files in /drizzle folder in order
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Cloudflare R2
- **Payment**: Stripe
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## License

MIT