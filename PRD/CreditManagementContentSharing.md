🧾 Credit Management & Content Sharing System

Version: 1.0
Updated: [Insert Date]
Module: Credit Management + Content Publication + User History
Author: [Your Name / Product Team]

1. 🎯 Overview

This feature adds a credit-based engagement system that rewards users for sharing their generated AI content (images/videos) on the platform. It also includes storage lifecycle management, user view history, and content compliance enforcement aligned with the site’s Terms of Service (ToS).

2. 💡 Key Objectives

Encourage user engagement through credit rewards for public sharing.

Implement configurable credit rewards, storage duration, and retention policies per subscription tier.

Provide users with a personal “View History” dashboard to review their previous generations.

Ensure all publicly shared content adheres to community guidelines and ToS compliance.

3. ⚙️ Functional Requirements
3.1 Credit System Extension
Feature	Description
Credit Earning Rule	Users earn 3 credits per approved public share (configurable via admin panel).
Configurable Reward	Admin can set the reward amount (e.g., 1–10 credits per share) via dashboard or environment variable.
Event Trigger	Credit is granted only after content passes moderation and is published successfully.
Tracking	Each credit transaction is recorded in the credit_ledger table with fields: user_id, amount, reason = 'public_share_reward', content_id, timestamp.
Duplicate Prevention	Credit is only applied once per unique content_id per user.
3.2 Public Content Publishing
Feature	Description
Eligibility	Users can publish generated images or videos along with their original prompts to a public gallery.
Metadata Stored	content_id, user_id, type (image/video), prompt_text, created_at, public_url, credit_awarded, visibility_status (draft/published/flagged)
Moderation Workflow	Content undergoes AI pre-screening + manual moderation for ToS compliance.
ToS Compliance Checks	Automatic filtering to block adult, violent, racist, hateful, or otherwise unsafe content.
Flagging System	Users and moderators can flag content that violates ToS → flagged content is hidden and user notified.
Publication Approval	Once approved → visible in public gallery + credit reward applied.
3.3 Storage & Retention Configuration
Feature	Description
Retention Policy	System auto-deletes content after a configured duration based on subscription tier.
Default Retention Periods	Free: 3 days • Pro: 7 days • Pro+: 30 days
Admin Configuration	Admin can modify storage duration globally or per user tier in the config dashboard.
Expiration Workflow	Daily cron job checks expired content → marks as “expired” → moves to archival bucket or deletes permanently.
Storage Buckets	- uip-user-uploads: raw user uploads
- uip-renders: processed results
- uip-public: publicly shared assets
CDN Delivery	All shared content served via AWS CloudFront with time-limited signed URLs.
3.4 User “View History” Page
Feature	Description
Purpose	Allow users to review previously generated content (images, videos, and prompts).
Content Shown	Thumbnail, Prompt, Generation Date, Type (Image/Video), Status (Private/Public/Expired).
Filtering & Sorting	By type, generation date, visibility, or model (Sora 2, Veo3, etc.).
Retention Based on Tier	<ul><li>Free: 3 days</li><li>Pro: 7 days</li><li>Pro+: 30 days</li></ul> After expiry, items are hidden or removed.
Link to Regenerate	“Recreate with same prompt” option, deducting credits for new generation.
Backend Table	user_history (id, user_id, content_id, prompt_text, output_url, model_used, created_at, expires_at, status)
3.5 Admin Configuration Panel
Feature	Description
Credit Reward Setting	Admin can set default credit reward per share.
Storage Duration Controls	Admin can define content retention per tier.
Moderation Controls	Approve/reject flagged content; ban users violating ToS.
Logs & Reports	Downloadable reports for credit transactions, shared content stats, and flagged content counts.
4. 🧩 Database Schema Additions
Table: credit_ledger
id UUID PK  
user_id UUID FK  
amount INT  
reason TEXT  
content_id UUID FK NULLABLE  
created_at TIMESTAMP DEFAULT NOW()  

Table: public_content
id UUID PK  
user_id UUID FK  
type ENUM('image','video')  
prompt_text TEXT  
s3_key TEXT  
public_url TEXT  
visibility_status ENUM('draft','published','flagged')  
credit_awarded BOOLEAN DEFAULT FALSE  
created_at TIMESTAMP DEFAULT NOW()  

Table: user_history
id UUID PK  
user_id UUID FK  
content_id UUID FK  
prompt_text TEXT  
output_url TEXT  
model_used TEXT  
created_at TIMESTAMP DEFAULT NOW()  
expires_at TIMESTAMP  
status ENUM('active','expired','deleted')  

5. 🔐 Compliance & Safety
Policy	Description
ToS Compliance Enforcement	All uploaded and generated content must comply with ToS: no adult, racist, violent, hateful, or unsafe material.
AI Moderation Layer	Uses content-safety classifiers to flag inappropriate imagery or language before publishing.
Human Review Queue	Moderators review flagged content; approval required for public visibility.
User Responsibility Notice	Users confirm compliance before publishing with a checkbox: “I confirm this content follows the Community Guidelines.”
Violation Consequences	Repeated violations may result in content deletion, credit revocation, or account suspension.
6. 📅 System Configuration Parameters
Parameter	Type	Default	Description
CREDIT_REWARD_PUBLIC_SHARE	Integer	3	Credits awarded per public share
RETENTION_FREE	Integer	3	Days of history retention for Free users
RETENTION_PRO	Integer	7	Days of history retention for Pro users
RETENTION_PRO_PLUS	Integer	30	Days of history retention for Pro+ users
STORAGE_EXPIRATION_CRON	Cron	Daily at 00:00 UTC	Purges expired content
PUBLIC_CONTENT_MODERATION	Boolean	True	Enables moderation flow
CREDIT_LEDGER_SYNC_INTERVAL	Integer	5 mins	Sync interval for credit updates
7. 🧠 User Flow Summary

1️⃣ Generate Content →
User creates an image or video via AI model (Sora 2, Veo3, etc.).

2️⃣ Share Publicly →
User opts to publish → content undergoes moderation → if approved → visible on site → credits granted.

3️⃣ Earn Credits →
+3 credits (or configured value) added to user’s balance in credit_ledger.

4️⃣ View History →
User accesses “View History” → sees all generated items (limited by tier duration).

5️⃣ Expiration →
System auto-hides/deletes expired content per user’s plan.

8. 🧱 Non-Functional Requirements

Security: All media hosted on S3 with signed URLs and CDN caching.

Scalability: Batch credit updates handled via queue (BullMQ + Redis).

Compliance: Adheres to ToS and Privacy Policy; no storage of banned material.

Performance: “View History” loads ≤1s for up to 100 entries.

Auditability: Admin dashboard shows every credit transaction and moderation decision.

9. 🔒 Terms of Service Reference

Publicly shared content must comply with ToS section “Acceptable Use”:

“Generated or uploaded content must not contain adult material, hate speech, racial discrimination, explicit violence, or any unsafe or deceptive content.”

Violations may result in:

Immediate removal of offending content.

Credit reversal.

Account suspension or termination.

10. 📈 Future Enhancements

Add community upvote system (earn bonus credits for top-rated content).

Enable auto-renewal of history retention via additional credits.

Allow custom sharing templates (e.g., embed prompt on social media preview).

✅ This document defines a complete feature set for credit management, content lifecycle, and user engagement, aligned with ToS and scalable for Pro/Pro+ tiers.