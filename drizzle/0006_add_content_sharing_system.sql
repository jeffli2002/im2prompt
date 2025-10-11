-- Migration: Add Content Sharing & History System
-- Created: 2025-10-10

-- Create public_content table
CREATE TABLE IF NOT EXISTS "public_content" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "content_type" text NOT NULL,
  "prompt_text" text NOT NULL,
  "negative_prompt" text,
  "model_style" text NOT NULL,
  "cloudinary_public_id" text NOT NULL,
  "cloudinary_url" text NOT NULL,
  "thumbnail_url" text,
  "visibility_status" text DEFAULT 'pending' NOT NULL,
  "credit_awarded" boolean DEFAULT false NOT NULL,
  "credit_transaction_id" text,
  "moderation_notes" text,
  "moderated_by" text,
  "moderated_at" timestamp,
  "flag_count" integer DEFAULT 0 NOT NULL,
  "view_count" integer DEFAULT 0 NOT NULL,
  "like_count" integer DEFAULT 0 NOT NULL,
  "metadata" text,
  "tags" text[],
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "content_type_check" CHECK ("content_type" IN ('image', 'video')),
  CONSTRAINT "visibility_status_check" CHECK ("visibility_status" IN ('pending', 'approved', 'rejected', 'flagged', 'removed')),
  CONSTRAINT "model_style_check" CHECK ("model_style" IN ('general', 'midjourney', 'stable-diffusion', 'flux', 'sora2', 'veo3'))
);
--> statement-breakpoint

-- Create user_content_history table
CREATE TABLE IF NOT EXISTS "user_content_history" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "content_type" text NOT NULL,
  "prompt_text" text NOT NULL,
  "negative_prompt" text,
  "model_style" text,
  "cloudinary_public_id" text,
  "cloudinary_url" text,
  "thumbnail_url" text,
  "credits_spent" integer DEFAULT 0 NOT NULL,
  "generation_params" text,
  "status" text DEFAULT 'completed' NOT NULL,
  "error_message" text,
  "expires_at" timestamp,
  "is_public" boolean DEFAULT false NOT NULL,
  "public_content_id" text,
  "metadata" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "history_content_type_check" CHECK ("content_type" IN ('image_to_prompt', 'image_generation', 'video_generation')),
  CONSTRAINT "history_status_check" CHECK ("status" IN ('processing', 'completed', 'failed', 'expired'))
);
--> statement-breakpoint

-- Create content_flags table
CREATE TABLE IF NOT EXISTS "content_flags" (
  "id" text PRIMARY KEY NOT NULL,
  "content_id" text NOT NULL,
  "reported_by" text NOT NULL,
  "reason" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "reviewed_by" text,
  "reviewed_at" timestamp,
  "review_notes" text,
  "created_at" timestamp NOT NULL,
  CONSTRAINT "flag_reason_check" CHECK ("reason" IN ('inappropriate', 'copyright', 'spam', 'misleading', 'other')),
  CONSTRAINT "flag_status_check" CHECK ("status" IN ('pending', 'reviewed', 'resolved', 'dismissed'))
);
--> statement-breakpoint

-- Create system_config table
CREATE TABLE IF NOT EXISTS "system_config" (
  "id" text PRIMARY KEY NOT NULL,
  "category" text NOT NULL,
  "key" text NOT NULL,
  "value" text NOT NULL,
  "value_type" text NOT NULL,
  "description" text,
  "is_editable" boolean DEFAULT true NOT NULL,
  "updated_by" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "config_category_check" CHECK ("category" IN ('credits', 'storage', 'moderation', 'features')),
  CONSTRAINT "config_value_type_check" CHECK ("value_type" IN ('string', 'number', 'boolean', 'json'))
);
--> statement-breakpoint

-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS "moderation_logs" (
  "id" text PRIMARY KEY NOT NULL,
  "content_id" text,
  "moderator_id" text NOT NULL,
  "action" text NOT NULL,
  "previous_status" text,
  "new_status" text,
  "reason" text,
  "notes" text,
  "metadata" text,
  "created_at" timestamp NOT NULL,
  CONSTRAINT "moderation_action_check" CHECK ("action" IN ('approve', 'reject', 'flag', 'unflag', 'remove'))
);
--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "public_content" ADD CONSTRAINT "public_content_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "public_content" ADD CONSTRAINT "public_content_credit_transaction_id_fk" 
  FOREIGN KEY ("credit_transaction_id") REFERENCES "public"."credit_transactions"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "public_content" ADD CONSTRAINT "public_content_moderated_by_user_id_fk" 
  FOREIGN KEY ("moderated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "user_content_history" ADD CONSTRAINT "user_content_history_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "user_content_history" ADD CONSTRAINT "user_content_history_public_content_id_fk" 
  FOREIGN KEY ("public_content_id") REFERENCES "public"."public_content"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_content_id_public_content_id_fk" 
  FOREIGN KEY ("content_id") REFERENCES "public"."public_content"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_reported_by_user_id_fk" 
  FOREIGN KEY ("reported_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_reviewed_by_user_id_fk" 
  FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updated_by_user_id_fk" 
  FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_content_id_public_content_id_fk" 
  FOREIGN KEY ("content_id") REFERENCES "public"."public_content"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderator_id_user_id_fk" 
  FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Create indexes
CREATE INDEX IF NOT EXISTS "public_content_user_id_idx" ON "public_content" ("user_id");
CREATE INDEX IF NOT EXISTS "public_content_status_idx" ON "public_content" ("visibility_status");
CREATE INDEX IF NOT EXISTS "public_content_created_at_idx" ON "public_content" ("created_at");
CREATE INDEX IF NOT EXISTS "history_user_id_idx" ON "user_content_history" ("user_id");
CREATE INDEX IF NOT EXISTS "history_expires_at_idx" ON "user_content_history" ("expires_at");
CREATE INDEX IF NOT EXISTS "history_created_at_idx" ON "user_content_history" ("created_at");
CREATE INDEX IF NOT EXISTS "history_status_idx" ON "user_content_history" ("status");
CREATE INDEX IF NOT EXISTS "flags_content_id_idx" ON "content_flags" ("content_id");
CREATE INDEX IF NOT EXISTS "flags_status_idx" ON "content_flags" ("status");
CREATE INDEX IF NOT EXISTS "flags_reported_by_idx" ON "content_flags" ("reported_by");
CREATE UNIQUE INDEX IF NOT EXISTS "config_category_key_idx" ON "system_config" ("category", "key");
CREATE INDEX IF NOT EXISTS "moderation_content_id_idx" ON "moderation_logs" ("content_id");
CREATE INDEX IF NOT EXISTS "moderation_moderator_id_idx" ON "moderation_logs" ("moderator_id");
CREATE INDEX IF NOT EXISTS "moderation_created_at_idx" ON "moderation_logs" ("created_at");
--> statement-breakpoint

-- Insert default system configurations
INSERT INTO "system_config" ("id", "category", "key", "value", "value_type", "description", "is_editable", "created_at", "updated_at")
VALUES 
  (gen_random_uuid()::text, 'credits', 'public_share_reward', '3', 'number', 'Credits awarded for approved public share', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'credits', 'max_daily_share_rewards', '5', 'number', 'Maximum share rewards per day per user', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'storage', 'free_tier_retention', '3', 'number', 'Free tier content retention in days', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'storage', 'pro_tier_retention', '7', 'number', 'Pro tier content retention in days', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'storage', 'proplus_tier_retention', '30', 'number', 'Pro+ tier content retention in days', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'moderation', 'auto_approve_threshold', '0', 'number', 'Auto-approve content after N approvals (0 = disabled)', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'moderation', 'flag_threshold_remove', '5', 'number', 'Auto-remove content after N flags', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'moderation', 'require_tos_acceptance', 'true', 'boolean', 'Require ToS acceptance for public sharing', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'features', 'public_gallery_enabled', 'true', 'boolean', 'Enable public gallery feature', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'features', 'content_sharing_enabled', 'true', 'boolean', 'Enable content sharing feature', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'features', 'user_history_enabled', 'true', 'boolean', 'Enable user content history', true, NOW(), NOW());
