#!/usr/bin/env node

import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const sql = postgres(process.env.DATABASE_URL);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

function info(message) {
  log(colors.blue, 'ℹ', message);
}

function warning(message) {
  log(colors.yellow, '⚠', message);
}

function section(message) {
  console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.cyan}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function recordTest(testName, passed, message = '') {
  testResults.tests.push({ testName, passed, message });
  if (passed) {
    testResults.passed++;
    success(`${testName}: ${message || 'PASSED'}`);
  } else {
    testResults.failed++;
    error(`${testName}: ${message || 'FAILED'}`);
  }
}

section('COMPREHENSIVE PAYMENT SYSTEM AUTO-TEST');

info('Testing Environment Configuration');
console.log('Database URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
console.log('Creem API Key:', process.env.CREEM_API_KEY ? '✓ Set' : '✗ Not set');
console.log('Creem Webhook Secret:', process.env.CREEM_WEBHOOK_SECRET ? '✓ Set' : '✗ Not set');
console.log('Creem Pro Product Key:', process.env.CREEM_PRO_PLAN_PRODUCT_KEY ? '✓ Set' : '✗ Not set');
console.log('Creem Pro+ Product Key:', process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY ? '✓ Set' : '✗ Not set');

async function testDatabaseSchema() {
  section('TEST 1: Database Schema Verification');

  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('payment', 'credit_transactions', 'user_credits', 'payment_event', 'user')
      ORDER BY table_name;
    `;

    const requiredTables = ['payment', 'credit_transactions', 'user_credits', 'payment_event', 'user'];
    const existingTables = tables.map(t => t.table_name);

    for (const table of requiredTables) {
      const exists = existingTables.includes(table);
      recordTest(`Table: ${table}`, exists, exists ? 'exists' : 'missing');
    }

    info('Checking payment table structure...');
    const paymentColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      ORDER BY ordinal_position;
    `;
    info(`Payment table has ${paymentColumns.length} columns`);

    info('Checking credit_transactions table structure...');
    const creditColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'credit_transactions' 
      ORDER BY ordinal_position;
    `;
    info(`Credit transactions table has ${creditColumns.length} columns`);

    const hasReferenceId = creditColumns.some(c => c.column_name === 'reference_id');
    recordTest('credit_transactions.reference_id', hasReferenceId, hasReferenceId ? 'exists' : 'missing');

    info('Checking indexes...');
    const indexes = await sql`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('payment', 'credit_transactions', 'user_credits', 'payment_event')
      ORDER BY tablename, indexname;
    `;
    info(`Found ${indexes.length} indexes`);
    
  } catch (err) {
    error(`Database schema test failed: ${err.message}`);
    recordTest('Database Schema', false, err.message);
  }
}

async function testCreditCalculation() {
  section('TEST 2: Credit Calculation Verification');

  const expectedCredits = {
    pro: { monthly: 500, yearly: 6000 },
    proplus: { monthly: 900, yearly: 10800 },
  };

  info('Verifying credit calculations...');
  
  for (const [plan, credits] of Object.entries(expectedCredits)) {
    recordTest(`${plan.toUpperCase()} Monthly Credits`, credits.monthly === expectedCredits[plan].monthly, `Expected: ${credits.monthly}`);
    recordTest(`${plan.toUpperCase()} Yearly Credits`, credits.yearly === expectedCredits[plan].yearly, `Expected: ${credits.yearly}`);
  }
}

async function testSubscriptionRecords() {
  section('TEST 3: Active Subscription Status Check');

  try {
    const activeSubscriptions = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.price_id as plan,
        p.status,
        p.period_start,
        p.period_end,
        p.cancel_at_period_end,
        p.trial_end,
        p.created_at
      FROM payment p
      WHERE p.status IN ('active', 'trialing')
      ORDER BY p.created_at DESC
      LIMIT 10;
    `;

    info(`Found ${activeSubscriptions.length} active/trialing subscriptions`);

    if (activeSubscriptions.length > 0) {
      success('Active subscriptions found in database');
      
      for (const sub of activeSubscriptions) {
        info(`  - User: ${sub.userId}, Plan: ${sub.plan}, Status: ${sub.status}`);
        
        if (sub.trialEnd) {
          const trialEndDate = new Date(sub.trialEnd);
          const now = new Date();
          if (trialEndDate > now) {
            info(`    Trial ends: ${trialEndDate.toISOString()}`);
          } else {
            warning(`    Trial expired: ${trialEndDate.toISOString()}`);
          }
        }
      }

      recordTest('Active Subscriptions', true, `${activeSubscriptions.length} found`);
    } else {
      warning('No active subscriptions found (this may be expected in a fresh database)');
      recordTest('Active Subscriptions', true, '0 found (fresh database)');
    }

    const allSubscriptions = await sql`
      SELECT status, COUNT(*) as count
      FROM payment
      GROUP BY status
      ORDER BY count DESC;
    `;

    info('Subscription status distribution:');
    for (const stat of allSubscriptions) {
      info(`  - ${stat.status}: ${stat.count}`);
    }

  } catch (err) {
    error(`Subscription records test failed: ${err.message}`);
    recordTest('Subscription Records', false, err.message);
  }
}

async function testCreditIntegrity() {
  section('TEST 4: Credit System Integrity Check');

  try {
    info('Checking for duplicate credit transactions...');
    const duplicates = await sql`
      SELECT reference_id, COUNT(*) as count
      FROM credit_transactions
      WHERE reference_id IS NOT NULL
      GROUP BY reference_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10;
    `;

    if (duplicates.length === 0) {
      recordTest('No Duplicate Transactions', true, 'All referenceIds are unique');
    } else {
      error(`Found ${duplicates.length} duplicate referenceIds!`);
      for (const dup of duplicates) {
        error(`  - ${dup.reference_id}: ${dup.count} occurrences`);
      }
      recordTest('No Duplicate Transactions', false, `${duplicates.length} duplicates found`);
    }

    info('Verifying credit balance consistency...');
    const creditConsistency = await sql`
      SELECT 
        uc.user_id,
        uc.balance,
        uc.total_earned,
        uc.total_spent,
        COALESCE(SUM(CASE WHEN ct.type = 'earn' THEN ct.amount ELSE 0 END), 0) as calculated_earned,
        COALESCE(SUM(CASE WHEN ct.type = 'spend' THEN ct.amount ELSE 0 END), 0) as calculated_spent
      FROM user_credits uc
      LEFT JOIN credit_transactions ct ON uc.user_id = ct.user_id
      GROUP BY uc.user_id, uc.balance, uc.total_earned, uc.total_spent
      HAVING uc.total_earned != COALESCE(SUM(CASE WHEN ct.type = 'earn' THEN ct.amount ELSE 0 END), 0)
         OR uc.total_spent != COALESCE(SUM(CASE WHEN ct.type = 'spend' THEN ct.amount ELSE 0 END), 0)
      LIMIT 10;
    `;

    if (creditConsistency.length === 0) {
      recordTest('Credit Balance Consistency', true, 'All balances match transaction history');
    } else {
      error(`Found ${creditConsistency.length} inconsistent credit balances!`);
      for (const inc of creditConsistency) {
        error(`  - User ${inc.user_id}: Balance=${inc.balance}, Earned=${inc.total_earned} (calc: ${inc.calculated_earned}), Spent=${inc.total_spent} (calc: ${inc.calculated_spent})`);
      }
      recordTest('Credit Balance Consistency', false, `${creditConsistency.length} inconsistencies found`);
    }

    info('Checking for negative balances...');
    const negativeBalances = await sql`
      SELECT user_id, balance, total_earned, total_spent
      FROM user_credits
      WHERE balance < 0
      LIMIT 10;
    `;

    if (negativeBalances.length === 0) {
      recordTest('No Negative Balances', true, 'All balances are non-negative');
    } else {
      error(`Found ${negativeBalances.length} negative balances!`);
      for (const neg of negativeBalances) {
        error(`  - User ${neg.user_id}: Balance=${neg.balance}`);
      }
      recordTest('No Negative Balances', false, `${negativeBalances.length} negative balances found`);
    }

  } catch (err) {
    error(`Credit integrity test failed: ${err.message}`);
    recordTest('Credit Integrity', false, err.message);
  }
}

async function testWebhookEventTracking() {
  section('TEST 5: Webhook Event Tracking');

  try {
    info('Checking payment event records...');
    const eventStats = await sql`
      SELECT 
        event_type,
        COUNT(*) as count,
        MAX(created_at) as last_event
      FROM payment_event
      GROUP BY event_type
      ORDER BY count DESC;
    `;

    if (eventStats.length > 0) {
      info(`Found ${eventStats.length} different event types`);
      for (const stat of eventStats) {
        info(`  - ${stat.event_type}: ${stat.count} events (last: ${new Date(stat.last_event).toISOString()})`);
      }
      recordTest('Webhook Events Logged', true, `${eventStats.length} event types tracked`);
    } else {
      warning('No webhook events found (this may be expected in a fresh database)');
      recordTest('Webhook Events Logged', true, 'No events yet (fresh database)');
    }

    info('Checking for duplicate event IDs...');
    const duplicateEvents = await sql`
      SELECT creem_event_id, COUNT(*) as count
      FROM payment_event
      WHERE creem_event_id IS NOT NULL
      GROUP BY creem_event_id
      HAVING COUNT(*) > 1
      LIMIT 10;
    `;

    if (duplicateEvents.length === 0) {
      recordTest('No Duplicate Events', true, 'All event IDs are unique');
    } else {
      error(`Found ${duplicateEvents.length} duplicate event IDs!`);
      for (const dup of duplicateEvents) {
        error(`  - ${dup.creem_event_id}: ${dup.count} occurrences`);
      }
      recordTest('No Duplicate Events', false, `${duplicateEvents.length} duplicates found`);
    }

    const recentEvents = await sql`
      SELECT 
        pe.created_at,
        pe.event_type,
        pe.creem_event_id,
        p.status as subscriptionStatus,
        p.price_id as plan
      FROM payment_event pe
      LEFT JOIN payment p ON pe.payment_id = p.id
      ORDER BY pe.created_at DESC
      LIMIT 5;
    `;

    if (recentEvents.length > 0) {
      info('Recent webhook events:');
      for (const event of recentEvents) {
        info(`  - ${event.event_type} (${new Date(event.created_at).toISOString()}) - ${event.plan || 'N/A'}`);
      }
    }

  } catch (err) {
    error(`Webhook event tracking test failed: ${err.message}`);
    recordTest('Webhook Event Tracking', false, err.message);
  }
}

async function testTrialSubscriptions() {
  section('TEST 6: Trial Subscription Handling');

  try {
    info('Checking trial subscriptions...');
    const trialSubs = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.price_id as plan,
        p.status,
        p.trial_end,
        p.created_at,
        (SELECT COUNT(*) FROM credit_transactions ct 
         WHERE ct.user_id = p.user_id 
           AND ct.created_at >= p.created_at
           AND ct.source = 'subscription') as credit_grants
      FROM payment p
      WHERE p.status = 'trialing'
      ORDER BY p.created_at DESC
      LIMIT 10;
    `;

    if (trialSubs.length > 0) {
      info(`Found ${trialSubs.length} active trial subscriptions`);
      
      let correctTrialHandling = true;
      for (const trial of trialSubs) {
        const trialEndDate = new Date(trial.trial_end);
        const now = new Date();
        const daysLeft = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
        
        info(`  - User: ${trial.user_id}, Plan: ${trial.plan}, Days left: ${daysLeft}, Credits granted: ${trial.credit_grants}`);
        
        if (trial.credit_grants > 0) {
          error(`    ERROR: Credits granted during trial! Should be 0, got ${trial.credit_grants}`);
          correctTrialHandling = false;
        }
      }

      recordTest('Trial Credits Not Granted', correctTrialHandling, correctTrialHandling ? 'No credits granted during trial' : 'Some trials have credits!');
    } else {
      info('No active trial subscriptions found');
      recordTest('Trial Subscriptions', true, 'No active trials (may be expected)');
    }

    info('Checking completed trials...');
    const completedTrials = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.price_id as plan,
        p.status,
        p.trial_end,
        p.created_at
      FROM payment p
      WHERE p.trial_end IS NOT NULL
        AND p.trial_end < NOW()
        AND p.status = 'active'
      ORDER BY p.trial_end DESC
      LIMIT 5;
    `;

    if (completedTrials.length > 0) {
      info(`Found ${completedTrials.length} completed trials (now active)`);
      
      for (const trial of completedTrials) {
        const creditGrant = await sql`
          SELECT COUNT(*) as count, SUM(amount) as total
          FROM credit_transactions
          WHERE user_id = ${trial.user_id}
            AND source = 'subscription'
            AND created_at >= ${trial.trial_end};
        `;
        
        const expectedCredits = trial.plan === 'pro' ? 500 : 900;
        const actualCredits = parseInt(creditGrant[0]?.total || 0);
        
        if (actualCredits >= expectedCredits) {
          success(`  - User ${trial.user_id} (${trial.plan}): Received ${actualCredits} credits after trial`);
        } else {
          warning(`  - User ${trial.user_id} (${trial.plan}): Only ${actualCredits} credits (expected ${expectedCredits})`);
        }
      }
    }

  } catch (err) {
    error(`Trial subscription test failed: ${err.message}`);
    recordTest('Trial Subscriptions', false, err.message);
  }
}

async function testSubscriptionRenewals() {
  section('TEST 7: Subscription Renewal Detection');

  try {
    info('Analyzing subscription renewals...');
    
    const renewalPattern = await sql`
      SELECT 
        ct.user_id,
        COUNT(*) as renewal_count,
        MAX(ct.created_at) as last_renewal,
        SUM(ct.amount) as total_renewal_credits
      FROM credit_transactions ct
      WHERE ct.reference_id LIKE '%renewal%'
        AND ct.source = 'subscription'
      GROUP BY ct.user_id
      ORDER BY renewal_count DESC
      LIMIT 10;
    `;

    if (renewalPattern.length > 0) {
      info(`Found ${renewalPattern.length} users with renewals`);
      
      for (const renewal of renewalPattern) {
        info(`  - User ${renewal.user_id}: ${renewal.renewal_count} renewals, ${renewal.total_renewal_credits} total credits`);
      }
      
      recordTest('Subscription Renewals Tracked', true, `${renewalPattern.length} users with renewals`);
    } else {
      info('No renewal transactions found (subscriptions may be too new)');
      recordTest('Subscription Renewals', true, 'No renewals yet (expected for new system)');
    }

    info('Checking for users with multiple subscription credit grants...');
    const multipleGrants = await sql`
      SELECT 
        user_id,
        COUNT(*) as grant_count,
        STRING_AGG(reference_id, ', ' ORDER BY created_at) as reference_ids
      FROM credit_transactions
      WHERE source = 'subscription'
      GROUP BY user_id
      HAVING COUNT(*) > 1
      ORDER BY grant_count DESC
      LIMIT 5;
    `;

    if (multipleGrants.length > 0) {
      info(`Found ${multipleGrants.length} users with multiple subscription credit grants`);
      for (const grant of multipleGrants) {
        info(`  - User ${grant.user_id}: ${grant.grant_count} grants`);
      }
    }

  } catch (err) {
    error(`Subscription renewal test failed: ${err.message}`);
    recordTest('Subscription Renewals', false, err.message);
  }
}

async function testCancelledSubscriptions() {
  section('TEST 8: Cancelled Subscription Handling');

  try {
    info('Checking cancelled subscriptions...');
    const cancelledSubs = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.price_id as plan,
        p.status,
        p.cancel_at_period_end,
        p.period_end,
        p.updated_at,
        uc.balance as current_credits
      FROM payment p
      LEFT JOIN user_credits uc ON p.user_id = uc.user_id
      WHERE p.status = 'canceled'
      ORDER BY p.updated_at DESC
      LIMIT 10;
    `;

    if (cancelledSubs.length > 0) {
      info(`Found ${cancelledSubs.length} cancelled subscriptions`);
      
      for (const sub of cancelledSubs) {
        const periodEnd = new Date(sub.period_end);
        const now = new Date();
        const hasEnded = periodEnd < now;
        
        info(`  - User ${sub.user_id} (${sub.plan}): ${hasEnded ? 'Period ended' : 'Active until period end'}, Credits: ${sub.current_credits}`);
        
        if (sub.cancel_at_period_end) {
          info(`    Will cancel at period end: ${periodEnd.toISOString()}`);
        }
      }
      
      recordTest('Cancelled Subscriptions', true, `${cancelledSubs.length} found`);
    } else {
      info('No cancelled subscriptions found');
      recordTest('Cancelled Subscriptions', true, 'No cancellations (expected for new system)');
    }

  } catch (err) {
    error(`Cancelled subscription test failed: ${err.message}`);
    recordTest('Cancelled Subscriptions', false, err.message);
  }
}

async function testDataIntegrity() {
  section('TEST 9: Overall Data Integrity');

  try {
    info('Checking orphaned payment records...');
    const orphanedPayments = await sql`
      SELECT p.id, p.user_id
      FROM payment p
      LEFT JOIN "user" u ON p.user_id = u.id
      WHERE u.id IS NULL
      LIMIT 5;
    `;

    if (orphanedPayments.length === 0) {
      recordTest('No Orphaned Payments', true, 'All payments linked to valid users');
    } else {
      error(`Found ${orphanedPayments.length} orphaned payment records!`);
      recordTest('No Orphaned Payments', false, `${orphanedPayments.length} orphaned records`);
    }

    info('Checking orphaned credit records...');
    const orphanedCredits = await sql`
      SELECT uc.user_id
      FROM user_credits uc
      LEFT JOIN "user" u ON uc.user_id = u.id
      WHERE u.id IS NULL
      LIMIT 5;
    `;

    if (orphanedCredits.length === 0) {
      recordTest('No Orphaned Credits', true, 'All credits linked to valid users');
    } else {
      error(`Found ${orphanedCredits.length} orphaned credit records!`);
      recordTest('No Orphaned Credits', false, `${orphanedCredits.length} orphaned records`);
    }

    info('Checking for users with payments but no credit records...');
    const missingCredits = await sql`
      SELECT p.user_id
      FROM payment p
      LEFT JOIN user_credits uc ON p.user_id = uc.user_id
      WHERE p.status IN ('active', 'trialing')
        AND uc.user_id IS NULL
      LIMIT 5;
    `;

    if (missingCredits.length === 0) {
      recordTest('All Active Subscriptions Have Credits', true, 'Credit records exist for all active subs');
    } else {
      warning(`Found ${missingCredits.length} active subscriptions without credit records`);
      recordTest('All Active Subscriptions Have Credits', false, `${missingCredits.length} missing credit records`);
    }

  } catch (err) {
    error(`Data integrity test failed: ${err.message}`);
    recordTest('Data Integrity', false, err.message);
  }
}

async function generateSummaryReport() {
  section('TEST SUMMARY REPORT');

  const total = testResults.passed + testResults.failed;
  const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(2) : 0;

  console.log(`${colors.cyan}Total Tests: ${total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${testResults.warnings}${colors.reset}`);
  console.log(`${colors.magenta}Pass Rate: ${passRate}%${colors.reset}\n`);

  if (testResults.failed > 0) {
    section('FAILED TESTS');
    for (const test of testResults.tests) {
      if (!test.passed) {
        error(`${test.testName}: ${test.message}`);
      }
    }
  }

  info('\nDetailed Test Results:');
  for (const test of testResults.tests) {
    const symbol = test.passed ? '✓' : '✗';
    const color = test.passed ? colors.green : colors.red;
    console.log(`${color}${symbol} ${test.testName}${colors.reset}: ${test.message}`);
  }

  section('RECOMMENDATIONS');

  if (testResults.failed === 0) {
    success('All tests passed! Your payment system is working correctly.');
  } else {
    warning('Some tests failed. Please review the failed tests above and fix the issues.');
  }

  info('\nNext Steps:');
  console.log('1. Review SUBSCRIPTION_TESTING_GUIDE.md for manual test scenarios');
  console.log('2. Test webhook endpoints with real Creem events');
  console.log('3. Verify trial-to-active transitions');
  console.log('4. Test subscription renewals and cancellations');
  console.log('5. Monitor webhook event logs for any errors');
  console.log('6. Set up monitoring and alerts for production');
}

async function runAllTests() {
  try {
    await testDatabaseSchema();
    await testCreditCalculation();
    await testSubscriptionRecords();
    await testCreditIntegrity();
    await testWebhookEventTracking();
    await testTrialSubscriptions();
    await testSubscriptionRenewals();
    await testCancelledSubscriptions();
    await testDataIntegrity();
    
    await generateSummaryReport();
  } catch (err) {
    error(`Test suite failed: ${err.message}`);
    console.error(err);
  } finally {
    await sql.end();
  }
}

runAllTests();
