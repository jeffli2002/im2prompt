#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, prefix, message) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

function success(message) {
  log(colors.green, '✓', message);
}

function error(message) {
  log(colors.red, '✗', message);
}

function warning(message) {
  log(colors.yellow, '⚠', message);
}

function info(message) {
  log(colors.blue, 'ℹ', message);
}

function section(message) {
  console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.cyan}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

section('PRODUCTION CONFIGURATION VERIFICATION');

const issues = [];
const warnings = [];

const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
const nodeEnv = process.env.NODE_ENV || 'development';
const testMode = process.env.NEXT_PUBLIC_CREEM_TEST_MODE;

info(`Environment: ${nodeEnv}`);
info(`App URL: ${appUrl}`);
info(`Creem Test Mode: ${testMode}`);

const isProductionUrl = appUrl.includes('yourdomain.com') || (!appUrl.includes('localhost') && !appUrl.includes('vercel.app'));

section('1. ENVIRONMENT MODE VERIFICATION');

if (nodeEnv === 'production') {
  success('NODE_ENV is set to production');
  
  if (isProductionUrl) {
    if (testMode === 'false') {
      success('Production URL with test mode disabled - CORRECT');
    } else {
      error('CRITICAL: Production URL but test mode is enabled!');
      issues.push('Set NEXT_PUBLIC_CREEM_TEST_MODE=false for production');
    }
  } else {
    if (testMode === 'true') {
      success('Preview URL with test mode enabled - CORRECT');
    } else {
      warning('Preview URL but test mode is disabled');
      warnings.push('Consider setting NEXT_PUBLIC_CREEM_TEST_MODE=true for preview');
    }
  }
} else {
  success('NODE_ENV is development');
  if (testMode !== 'true') {
    warning('Development should use test mode');
    warnings.push('Set NEXT_PUBLIC_CREEM_TEST_MODE=true for development');
  } else {
    success('Test mode enabled for development - CORRECT');
  }
}

section('2. CREEM API CONFIGURATION');

const creemApiKey = process.env.CREEM_API_KEY || '';
const creemWebhookSecret = process.env.CREEM_WEBHOOK_SECRET || '';
const creemProProduct = process.env.CREEM_PRO_PLAN_PRODUCT_KEY || '';
const creemProplusProduct = process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY || '';

if (!creemApiKey) {
  error('CREEM_API_KEY is not set');
  issues.push('Set CREEM_API_KEY environment variable');
} else if (testMode === 'false' && creemApiKey.includes('test')) {
  error('CRITICAL: Production mode but using test API key!');
  issues.push('Use live Creem API key for production');
} else if (testMode === 'true' && creemApiKey.includes('live')) {
  warning('Test mode but using live API key');
  warnings.push('Consider using test API key for development/preview');
} else {
  success(`Creem API key configured (${testMode === 'true' ? 'test' : 'live'} mode)`);
}

if (!creemWebhookSecret) {
  error('CRITICAL: CREEM_WEBHOOK_SECRET is not set');
  issues.push('Set CREEM_WEBHOOK_SECRET - required for webhook security');
} else {
  success('Creem webhook secret configured');
}

if (!creemProProduct) {
  error('CREEM_PRO_PLAN_PRODUCT_KEY is not set');
  issues.push('Set CREEM_PRO_PLAN_PRODUCT_KEY');
} else {
  success('Pro plan product key configured');
}

if (!creemProplusProduct) {
  error('CREEM_PROPLUS_PLAN_PRODUCT_KEY is not set');
  issues.push('Set CREEM_PROPLUS_PLAN_PRODUCT_KEY');
} else {
  success('Pro+ plan product key configured');
}

section('3. DATABASE CONFIGURATION');

const databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl) {
  error('DATABASE_URL is not set');
  issues.push('Set DATABASE_URL environment variable');
} else {
  if (isProductionUrl) {
    if (databaseUrl.includes('localhost') || databaseUrl.includes('dev') || databaseUrl.includes('test')) {
      error('CRITICAL: Production URL but using dev/test database!');
      issues.push('Use production database for production environment');
    } else {
      success('Production database configured');
    }
  } else {
    if (databaseUrl.includes('prod') || databaseUrl.includes('production')) {
      error('CRITICAL: Non-production URL but using production database!');
      issues.push('Use separate database for development/preview');
    } else {
      success('Non-production database configured');
    }
  }
}

section('4. MONITORING CONFIGURATION');

const slackWebhook = process.env.SLACK_WEBHOOK_URL;
const sentryDsn = process.env.SENTRY_DSN;

if (isProductionUrl) {
  if (!slackWebhook && !sentryDsn) {
    warning('No monitoring configured for production');
    warnings.push('Configure SLACK_WEBHOOK_URL or SENTRY_DSN for production alerts');
  } else {
    if (slackWebhook) success('Slack webhook configured for alerts');
    if (sentryDsn) success('Sentry configured for error tracking');
  }
} else {
  info('Monitoring configuration optional for non-production');
}

section('5. SECURITY CHECKS');

const betterAuthSecret = process.env.BETTER_AUTH_SECRET || '';
const cronSecret = process.env.CRON_SECRET || '';

if (!betterAuthSecret || betterAuthSecret === 'your-secret-key') {
  error('BETTER_AUTH_SECRET is not properly configured');
  issues.push('Set a secure BETTER_AUTH_SECRET');
} else {
  success('Auth secret configured');
}

if (isProductionUrl && (!cronSecret || cronSecret === 'dummy')) {
  warning('CRON_SECRET should be set in production');
  warnings.push('Set CRON_SECRET for cron job authentication');
} else if (cronSecret && cronSecret !== 'dummy') {
  success('Cron secret configured');
}

section('SUMMARY');

console.log(`\n${colors.cyan}Total Issues: ${issues.length}${colors.reset}`);
console.log(`${colors.yellow}Total Warnings: ${warnings.length}${colors.reset}\n`);

if (issues.length > 0) {
  console.log(`${colors.red}❌ CRITICAL ISSUES FOUND:${colors.reset}\n`);
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
}

if (warnings.length > 0) {
  console.log(`\n${colors.yellow}⚠️  WARNINGS:${colors.reset}\n`);
  warnings.forEach((warning, index) => {
    console.log(`  ${index + 1}. ${warning}`);
  });
}

if (issues.length === 0 && warnings.length === 0) {
  console.log(`\n${colors.green}✓ All configuration checks passed!${colors.reset}\n`);
  console.log('Your environment is properly configured for deployment.\n');
  process.exit(0);
} else if (issues.length === 0) {
  console.log(`\n${colors.yellow}Configuration has warnings but no critical issues.${colors.reset}\n`);
  console.log('Review warnings above before deploying to production.\n');
  process.exit(0);
} else {
  console.log(`\n${colors.red}❌ Configuration has critical issues!${colors.reset}\n`);
  console.log('Fix all issues above before deploying.\n');
  process.exit(1);
}
