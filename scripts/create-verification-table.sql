-- Create verification table if it doesn't exist
CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp,
    "updated_at" timestamp
);

-- Create indexes if needed
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");
CREATE INDEX IF NOT EXISTS "verification_expires_at_idx" ON "verification" ("expires_at");