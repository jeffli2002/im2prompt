-- 创建 usage_tracking 表（每日使用追踪）
CREATE TABLE IF NOT EXISTS "usage_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"image_to_text_count" integer DEFAULT 0 NOT NULL,
	"image_generation_count" integer DEFAULT 0 NOT NULL,
	"video_generation_count" integer DEFAULT 0 NOT NULL,
	"credits_used_daily" integer DEFAULT 0 NOT NULL,
	"credits_used_monthly" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "usage_user_date_idx" UNIQUE("user_id", "date")
);
--> statement-breakpoint

-- 创建 monthly_usage_tracking 表（每月使用追踪）
CREATE TABLE IF NOT EXISTS "monthly_usage_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"month" text NOT NULL,
	"image_to_text_count" integer DEFAULT 0 NOT NULL,
	"image_generation_count" integer DEFAULT 0 NOT NULL,
	"video_generation_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "monthly_usage_user_month_idx" UNIQUE("user_id", "month")
);
--> statement-breakpoint

-- 添加外键约束
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_user_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "monthly_usage_tracking" ADD CONSTRAINT "monthly_usage_tracking_user_id_user_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS "usage_date_idx" ON "usage_tracking" ("date");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "monthly_usage_month_idx" ON "monthly_usage_tracking" ("month");

