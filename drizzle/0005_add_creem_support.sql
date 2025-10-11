-- Migration: Add Creem payment provider support
-- Created: 2025-10-10

-- Add provider column to payment table
ALTER TABLE "payment" ADD COLUMN "provider" text DEFAULT 'stripe' NOT NULL;

-- Add productId column for Creem products
ALTER TABLE "payment" ADD COLUMN "product_id" text;

-- Add creemEventId column to payment_event table
ALTER TABLE "payment_event" ADD COLUMN "creem_event_id" text UNIQUE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "payment_provider_idx" ON "payment" ("provider");
CREATE INDEX IF NOT EXISTS "payment_user_provider_idx" ON "payment" ("user_id", "provider");
