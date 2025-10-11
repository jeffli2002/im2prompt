🧮 Admin Dashboard PRD

Module: Admin Analytics & Management
Version: 1.2
Database: Neon (PostgreSQL)
Updated: 2025-10-10
Author: [Your Name / Product Team]

1. 🎯 Overview

The Admin Dashboard provides a centralized control panel for administrators to monitor, analyze, and manage the platform’s users, subscriptions, content usage, and operational costs.

It enables:

Real-time visibility into user tiers (Guest, Authenticated, Pro, Pro+).

Insights into usage, credit consumption, and storage.

Tracking of cost and revenue from subscriptions and API services.

Secure role-based access for internal management.

2. 🧩 Key Objectives

Offer a data-driven view of the service’s performance and health.

Allow admins to filter metrics by time range (Today, 7 days, 30 days, Custom).

Provide breakdowns of paid user tiers and engagement metrics.

Enable cost-to-revenue tracking for better financial control.

Allow secure access for admin and moderator users.

3. 👥 Roles & Authentication
Role	Permissions	Notes
Admin	Full access to all data, user management, cost settings, and exports	Root role
Moderator	Can view user/usage data, flag content, and generate reports	Limited edit
Viewer	Read-only analytics	For investors or stakeholders

Authentication:

Admin login via /admin/login.

JWT-based session with 2FA (email or app-based).

Role stored in admin_users table.

4. 🧭 Main Dashboard Modules
Module	Description
Overview Metrics	Summarized stats (users, subscriptions, credits, cost, revenue).
User Analytics	Breakdown of users by type, tier, and activity.
Subscription Insights	Details of Pro / Pro+ plans, churn, and MRR.
Usage Analytics	AI image/video generation, credits, and model usage.
Cost Insights	Storage, API, and compute cost breakdowns.
Timeline Filter	Dynamic range filtering for all modules.
Reports & Exports	CSV / PDF data export, scheduled email reports.
5. 🏠 Dashboard Overview
KPI Cards

Displayed as summary blocks at top of dashboard.

Metric	Description	Example
👤 Total Users	All registered users (all tiers)	12,420
🧭 Active Users (30d)	Users who generated at least 1 item in last 30 days	8,910
🚪 Guest Users	Unauthenticated users	1,520
🔑 Authenticated Users	Logged-in but unpaid	5,240
💳 Pro Users	Active Pro subscribers	3,150
💎 Pro+ Users	Active Pro+ subscribers	1,250
💰 Revenue (MTD)	Subscription income (from Stripe/Creem)	$14,780
⚙️ Total Generations	Image/video/prompt creations	102,430
🧮 Credit Usage	Total credits consumed	210,540
💵 Operational Cost	API + storage + CDN costs	$4,920
💹 Cost-to-Revenue Ratio	% cost vs revenue	33%
6. 🗓️ Timeline & Filters

Preset Periods:

Today (until now)

Yesterday

Last 7 days

Last 14 days

Last 30 days

This month

Custom range (start_date – end_date)

Behavior:

Global filter applies to all dashboard sections.

Auto-refreshes every 5 minutes.

Supports CSV export per time range.

7. 👤 User Analytics
Metric	Description
Total Users by Tier	Pie chart: Guest / Authenticated / Pro / Pro+
New Signups	Daily trend of user signups
Active Users	Logged activity in period (e.g., generations or logins)
User Churn	Percentage of lost paid users in selected period
Retention Rate	% of users active across last 30 days
Top Users by Credits	Table of top users consuming most credits
User Table Columns

user_id, email, signup_date, tier, status, credits_remaining, total_generations, last_active, country, subscription_status

User Actions

Suspend / Reactivate account

Reset credits

View user history (generated images/videos/prompts)

Export user list

8. 💳 Subscription Insights
Metric	Description
Total Subscriptions	Number of active paid users
Plan Breakdown	Pie chart: Pro vs Pro+
New Upgrades	Users who upgraded tier in period
Churn Rate	% cancellations per period
Monthly Recurring Revenue (MRR)	Based on Stripe/Creem billing data
Average Revenue per User (ARPU)	MRR / Total Paid Users
Credit Top-ups	Additional credit purchases outside plan
Subscription Table Columns

subscription_id, user_id, tier (Pro / Pro+), start_date, renewal_date, status, monthly_price, credits_allocated, credits_used

9. 📈 Usage Analytics
Metric	Description
Generations by Type	Image / Video / Text-to-Prompt / Image-to-Prompt
Model Breakdown	Sora2, Veo3, Flux, SDXL, etc.
Credit Consumption	Line chart showing daily usage
Generation Volume by Tier	Compare usage between Pro and Pro+
Average Credits per Generation	Efficiency indicator
Failed Requests	Total and categorized by reason
10. 💵 Cost Insights
Cost Type	Description	Source
Storage Cost	Neon + Cloudinary + R2 storage	Cloudinary API / R2 usage API
Transformation Cost	Cloudinary transformation credits	Cloudinary API
Model Cost	API calls to Sora2, Veo3, Flux	Internal cost ledger
CDN/Traffic Cost	Cloudflare or Cloudinary bandwidth	Provider dashboard
Total Cloud Cost	Aggregated across providers	Neon cost reports + external APIs
Cost-to-Revenue Ratio	Auto-calculated metric	Derived

Charts:

Stacked bar: Cost categories

Line graph: Cost over time

Pie chart: Cost per provider

11. 🧰 Technical Implementation
Layer	Description
Frontend	Next.js + TailwindCSS + Recharts / Chart.js
Backend	Node.js API layer (tRPC / Express)
Database	Neon (PostgreSQL) with Prisma ORM
Auth	NextAuth / Supabase Auth with role-based access
Data Sources	Neon (core data), Stripe API, Cloudinary API, R2 billing
Caching	Redis or Neon read replicas for analytics aggregation
Security	JWT auth, HTTPS-only routes, rate limiting, audit logs
12. 🔐 Security & Permissions

Admin routes under /admin/*

JWT + 2FA required

Role enforcement via middleware (admin, moderator, viewer)

Rate-limited analytics queries (30 req/min per admin)

admin_audit_log table records all admin actions

13. 🧱 Database Schema (Neon PostgreSQL)
Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  signup_date TIMESTAMP DEFAULT NOW(),
  tier VARCHAR(10) CHECK (tier IN ('guest', 'authenticated', 'pro', 'pro+')),
  status VARCHAR(10) DEFAULT 'active',
  credits_remaining INT DEFAULT 0,
  total_generations INT DEFAULT 0,
  last_active TIMESTAMP,
  country TEXT
);

Table: subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier VARCHAR(10) CHECK (tier IN ('pro', 'pro+')),
  start_date TIMESTAMP DEFAULT NOW(),
  renewal_date TIMESTAMP,
  status VARCHAR(15) DEFAULT 'active',
  monthly_price DECIMAL(10,2),
  credits_allocated INT,
  credits_used INT DEFAULT 0
);

Table: usage_logs
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) CHECK (type IN ('image', 'video', 'text2prompt', 'image2prompt')),
  model_used TEXT,
  credits_spent INT,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(10) DEFAULT 'success'
);

Table: cost_ledger
CREATE TABLE cost_ledger (
  id UUID PRIMARY KEY,
  provider TEXT,
  category TEXT,
  cost_usd DECIMAL(10,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);

Table: admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  role VARCHAR(10) CHECK (role IN ('admin','moderator','viewer')),
  created_at TIMESTAMP DEFAULT NOW()
);

Table: admin_audit_log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  action TEXT,
  target_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);

14. 🔍 API Endpoints
Endpoint	Method	Description
/api/admin/overview	GET	Returns all summary metrics
/api/admin/users	GET	List users with filters (tier, status, period)
/api/admin/users/:id	GET	Detailed user view
/api/admin/subscriptions	GET	Fetch subscription data
/api/admin/usage	GET	Return generation & credit data
/api/admin/costs	GET	Aggregated cost data
/api/admin/export	POST	Export CSV/PDF reports
/api/admin/login	POST	Admin authentication
/api/admin/audit	GET	Retrieve admin activity logs
15. 📤 Reporting & Exports
Output Type	Description
CSV Export	Export all data tables (users, usage, subscriptions)
PDF Reports	Printable reports with charts and metrics
Scheduled Email Summary	Weekly admin email of metrics and cost trends
Webhook Integration	Send report summaries to Slack or Notion
16. 📈 Visualization Components
Type	Tool	Notes
Line/Bar Charts	Recharts	For trends (usage, cost, revenue)
Pie Charts	Chart.js	For tier breakdowns
KPI Cards	Custom React Components	Color-coded with delta indicators
Tables	React Table or TanStack Table	Sortable, filterable, paginated
Filters	Date pickers (React DayPicker)	Applies globally to all data views
17. 🧩 Performance & Optimization

Neon’s read replica used for analytics queries.

Aggregated data cached hourly in Redis.

Charts rendered asynchronously with background fetch.

Pagination enforced on all tables (>50 rows).

18. 🧠 Future Enhancements

Real-time metrics (via WebSocket or Supabase Realtime).

AI-based anomaly alerts for unusual cost spikes.

Predictive analytics: MRR and churn forecasting.

Per-model cost insights (e.g., Sora2 vs Veo3 API consumption).

Admin “Command Console” for user actions (reset, refund, tier change).