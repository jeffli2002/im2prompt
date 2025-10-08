-- ================================================================
-- 手动迁移脚本: 创建 usage_tracking 表
-- 用于修复 "relation 'usage_tracking' does not exist" 错误
-- 
-- 执行方式:
-- 1. 登录你的数据库控制台 (Neon/Vercel Postgres/其他)
-- 2. 复制并执行下面的所有 SQL 语句
-- 3. 验证表已创建
-- ================================================================

-- 1. 创建 usage_tracking 表（每日使用追踪）
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
    "updated_at" timestamp NOT NULL
);

-- 2. 创建 monthly_usage_tracking 表（每月使用追踪）
CREATE TABLE IF NOT EXISTS "monthly_usage_tracking" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "month" text NOT NULL,
    "image_to_text_count" integer DEFAULT 0 NOT NULL,
    "image_generation_count" integer DEFAULT 0 NOT NULL,
    "video_generation_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL
);

-- 3. 添加外键约束（连接到 user 表）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usage_tracking_user_id_user_id_fk'
    ) THEN
        ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'monthly_usage_tracking_user_id_user_id_fk'
    ) THEN
        ALTER TABLE "monthly_usage_tracking" ADD CONSTRAINT "monthly_usage_tracking_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- 4. 创建唯一索引（防止重复记录）
CREATE UNIQUE INDEX IF NOT EXISTS "usage_user_date_idx" 
ON "usage_tracking" ("user_id", "date");

CREATE UNIQUE INDEX IF NOT EXISTS "monthly_usage_user_month_idx" 
ON "monthly_usage_tracking" ("user_id", "month");

-- 5. 创建性能索引
CREATE INDEX IF NOT EXISTS "usage_date_idx" ON "usage_tracking" ("date");
CREATE INDEX IF NOT EXISTS "monthly_usage_month_idx" ON "monthly_usage_tracking" ("month");

-- 6. 验证表已创建（执行此查询检查）
SELECT 
    'usage_tracking' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'usage_tracking'
UNION ALL
SELECT 
    'monthly_usage_tracking' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'monthly_usage_tracking';

-- 预期结果应该显示：
-- usage_tracking: 10 columns
-- monthly_usage_tracking: 7 columns

