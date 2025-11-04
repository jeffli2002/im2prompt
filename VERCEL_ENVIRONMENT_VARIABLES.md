# Vercel Environment Variables Setup for Email Service

## 📋 Required Variables for Email Service

Add these environment variables in your Vercel project settings:

**Vercel Dashboard → Your Project → Settings → Environment Variables**

---

## 🔑 Email Service Variables (Required)

### 1. RESEND_API_KEY
**Value:** `re_YOUR_RESEND_API_KEY_HERE`
- **Type:** Secret
- **Environment:** Production, Preview, Development
- **Description:** Resend API key for sending emails

### 2. RESEND_FROM_EMAIL (After Domain Verification)
**Value:** `noreply@im2prompt.com`
- **Type:** Plain Text
- **Environment:** Production, Preview, Development
- **Description:** Email address for sending emails
- **Note:** ⚠️ Set this AFTER verifying im2prompt.com domain in Resend

### 3. ADMIN_EMAILS
**Value:** `admin@im2prompt.com,support@im2prompt.com`
- **Type:** Plain Text
- **Environment:** Production, Preview, Development
- **Description:** Comma-separated list of admin emails for feedback/alerts

---

## 📊 All Environment Variables (Complete List)

Based on your `.env.production` file, here are ALL variables that should be set in Vercel:

### Core Application

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://im2prompt.com
NODE_ENV=production
NEXT_PUBLIC_DISABLE_AUTH=false
DISABLE_AUTH=false
```

### Database

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Authentication

```bash
BETTER_AUTH_SECRET=your-better-auth-secret-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub (optional if not using)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Email Service (New - For BCC Functionality)

```bash
RESEND_API_KEY=re_YOUR_RESEND_API_KEY_HERE
RESEND_FROM_EMAIL=noreply@im2prompt.com
ADMIN_EMAILS=admin@im2prompt.com,support@im2prompt.com
```

### Payment Processing (Creem)

```bash
CREEM_API_KEY=creem_YOUR_API_KEY_HERE
CREEM_WEBHOOK_SECRET=wh_YOUR_WEBHOOK_SECRET_HERE
CREEM_PRO_PLAN_PRODUCT_KEY_MONTHLY=prod_YOUR_PRODUCT_KEY_HERE
CREEM_PROPLUS_PLAN_PRODUCT_KEY_MONTHLY=prod_YOUR_PRODUCT_KEY_HERE
CREEM_PRO_PLAN_PRODUCT_KEY_YEARLY=prod_YOUR_PRODUCT_KEY_HERE
CREEM_PROPLUS_PLAN_PRODUCT_KEY_YEARLY=prod_YOUR_PRODUCT_KEY_HERE
NEXT_PUBLIC_CREEM_TEST_MODE=false
```

### AI API Keys

```bash
DEEPSEEK_API_KEY=sk-YOUR_DEEPSEEK_API_KEY_HERE
OPENROUTER_API_KEY=sk-or-v1-YOUR_OPENROUTER_API_KEY_HERE
FLUX_API_KEY=YOUR_FLUX_API_KEY_HERE
STABILITY_API_KEY=sk-YOUR_STABILITY_API_KEY_HERE
SEED_API_KEY=YOUR_SEED_API_KEY_HERE
COZE_API_KEY=pat_YOUR_COZE_API_KEY_HERE
COZE_WORKFLOW_ID=YOUR_WORKFLOW_ID_HERE
KIE_API_KEY=sk_YOUR_KIE_API_KEY_HERE
```

### Cloud Storage (Cloudinary)

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### Google Services

```bash
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"your-project","private_key_id":"your-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@project.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account","universe_domain":"googleapis.com"}
```

### Analytics

```bash
NEXT_PUBLIC_GA_ID=G-E5G0DLN2J8
```

### Cron Security

```bash
CRON_SECRET=your-cron-secret-key
```

---

## 🚀 How to Add in Vercel

### Step 1: Go to Project Settings
1. Open https://vercel.com
2. Select your project: **im2prompt**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Variables One by One

For each variable:
1. Click **"Add New"**
2. Enter **Key** (e.g., `RESEND_API_KEY`)
3. Enter **Value** (e.g., `re_crm8cmjP_5cC4SMMJ8Q8qkxgamLg2uVxu`)
4. Select environments:
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)
5. Click **Save**

### Step 3: Sensitive Variables

Mark these as **Secret** (encrypted):
- ✅ `RESEND_API_KEY`
- ✅ `DATABASE_URL`
- ✅ `BETTER_AUTH_SECRET`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GITHUB_CLIENT_SECRET`
- ✅ `CREEM_API_KEY`
- ✅ `CREEM_WEBHOOK_SECRET`
- ✅ All API keys (`*_API_KEY`)
- ✅ `GOOGLE_APPLICATION_CREDENTIALS`
- ✅ `CLOUDINARY_URL`
- ✅ `CRON_SECRET`

---

## 📝 Quick Copy-Paste Format for Vercel

You can also use Vercel's bulk import feature. Go to **Settings → Environment Variables → Edit as Text** and paste:

```env
# Core
NEXT_PUBLIC_APP_URL=https://im2prompt.com
NODE_ENV=production
NEXT_PUBLIC_DISABLE_AUTH=false
DISABLE_AUTH=false

# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Auth
BETTER_AUTH_SECRET=your-better-auth-secret-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service (NEW - FOR BCC FUNCTIONALITY)
RESEND_API_KEY=re_YOUR_RESEND_API_KEY_HERE
ADMIN_EMAILS=admin@im2prompt.com,support@im2prompt.com

# IMPORTANT: Add this AFTER verifying im2prompt.com domain in Resend
# RESEND_FROM_EMAIL=noreply@im2prompt.com

# Payment (Creem)
CREEM_API_KEY=creem_YOUR_API_KEY_HERE
CREEM_WEBHOOK_SECRET=wh_YOUR_WEBHOOK_SECRET_HERE
CREEM_PRO_PLAN_PRODUCT_KEY_MONTHLY=prod_YOUR_PRODUCT_KEY_HERE
CREEM_PROPLUS_PLAN_PRODUCT_KEY_MONTHLY=prod_YOUR_PRODUCT_KEY_HERE
CREEM_PRO_PLAN_PRODUCT_KEY_YEARLY=prod_YOUR_PRODUCT_KEY_HERE
CREEM_PROPLUS_PLAN_PRODUCT_KEY_YEARLY=prod_YOUR_PRODUCT_KEY_HERE
NEXT_PUBLIC_CREEM_TEST_MODE=false

# AI APIs
DEEPSEEK_API_KEY=sk-YOUR_DEEPSEEK_API_KEY_HERE
OPENROUTER_API_KEY=sk-or-v1-YOUR_OPENROUTER_API_KEY_HERE
FLUX_API_KEY=YOUR_FLUX_API_KEY_HERE
STABILITY_API_KEY=sk-YOUR_STABILITY_API_KEY_HERE
SEED_API_KEY=YOUR_SEED_API_KEY_HERE
COZE_API_KEY=pat_YOUR_COZE_API_KEY_HERE
COZE_WORKFLOW_ID=YOUR_WORKFLOW_ID_HERE
KIE_API_KEY=sk_YOUR_KIE_API_KEY_HERE

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Analytics
NEXT_PUBLIC_GA_ID=G-E5G0DLN2J8

# Cron
CRON_SECRET=your-cron-secret-key

# Google Services (paste as single line)
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"your-project","private_key_id":"your-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@project.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account","universe_domain":"googleapis.com"}
```

---

## ⚠️ Important Notes

### 1. RESEND_FROM_EMAIL
**DO NOT set this until you verify im2prompt.com domain in Resend!**

Current status: Using test domain `onboarding@resend.dev`
- ❌ BCC to jefflee2002@gmail.com won't work
- ✅ Emails will send but only to account owner

After verifying domain:
- ✅ Add `RESEND_FROM_EMAIL=noreply@im2prompt.com`
- ✅ BCC will work correctly
- ✅ Redeploy on Vercel

### 2. Redeploy After Adding Variables

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **⋮** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger deployment

### 3. Test After Deployment

```bash
# Test feedback API (should send email)
curl -X POST https://im2prompt.com/api/support/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "category": "feedback",
    "subject": "Testing email service",
    "message": "This is a test",
    "priority": "normal"
  }'
```

---

## ✅ Deployment Checklist

- [ ] Add all environment variables to Vercel
- [ ] Mark sensitive variables as **Secret**
- [ ] Set variables for **Production** environment
- [ ] (Optional) Set for **Preview** and **Development**
- [ ] **DO NOT** add `RESEND_FROM_EMAIL` yet (wait for domain verification)
- [ ] Redeploy application
- [ ] Test feedback form: https://im2prompt.com/support
- [ ] Verify email received at admin email
- [ ] After domain verification: add `RESEND_FROM_EMAIL` and redeploy
- [ ] Test BCC functionality (check jefflee2002@gmail.com)

---

## 📞 Support

**Issues with environment variables:**
1. Check variable names match exactly (case-sensitive)
2. Verify no extra spaces in values
3. Check Vercel deployment logs for errors
4. Ensure variables are set for correct environment

**Need help?**
- Vercel Docs: https://vercel.com/docs/projects/environment-variables
- Email Service Status: Check `src/lib/email/email-service.ts` logs

---

**Created:** 2025-11-03  
**Status:** ✅ Ready for Production Deployment  
**Action Required:** Add variables to Vercel, then deploy
