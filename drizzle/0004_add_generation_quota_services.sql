-- Migration: Add image_generation, video_generation, and image_extraction service types to user_quota_usage
-- This enables tracking of daily and monthly generation quotas for free and paid users

-- Drop the existing check constraint (if it exists)
ALTER TABLE "user_quota_usage" DROP CONSTRAINT IF EXISTS "user_quota_usage_service_check";

-- Recreate the check constraint with new service types
ALTER TABLE "user_quota_usage" ADD CONSTRAINT "user_quota_usage_service_check" 
  CHECK (service IN ('api_call', 'storage', 'custom', 'image_generation', 'video_generation', 'image_extraction'));

-- Note: This migration updates the service enum to support:
-- - image_generation: Track daily/monthly image generation usage
-- - video_generation: Track daily/monthly video generation usage  
-- - image_extraction: Track image-to-prompt extraction usage
-- 
-- Period format:
-- - Monthly tracking: YYYY-MM (e.g., '2025-10')
-- - Daily tracking: YYYY-MM-DD (e.g., '2025-10-09')
