# 修复 Image-to-Video 错误：usage_tracking 表缺失

## 问题描述

错误信息：
```
❌ 生成失败 / Generation Failed
relation "usage_tracking" does not exist
```

## 原因

数据库中缺少 `usage_tracking` 和 `monthly_usage_tracking` 表。这些表用于追踪用户的免费配额使用情况。

## 解决方案

### 方法 1: 在数据库控制台执行 SQL（推荐）

1. **登录你的数据库控制台**
   - 如果使用 Neon: 登录 [Neon Console](https://console.neon.tech)
   - 如果使用 Vercel Postgres: 登录 Vercel 项目 → Storage → 选择数据库
   - 如果使用其他: 使用 pgAdmin、TablePlus 或命令行

2. **执行 SQL 脚本**
   
   打开项目根目录下的 `MANUAL_MIGRATION_USAGE_TRACKING.sql` 文件，复制全部内容并在数据库控制台执行。

   或者直接复制下面的 SQL：

   ```sql
   -- 创建 usage_tracking 表
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

   -- 创建 monthly_usage_tracking 表
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

   -- 添加外键
   ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_user_id_fk" 
   FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;

   ALTER TABLE "monthly_usage_tracking" ADD CONSTRAINT "monthly_usage_tracking_user_id_user_id_fk" 
   FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;

   -- 创建唯一索引
   CREATE UNIQUE INDEX "usage_user_date_idx" ON "usage_tracking" ("user_id", "date");
   CREATE UNIQUE INDEX "monthly_usage_user_month_idx" ON "monthly_usage_tracking" ("user_id", "month");

   -- 创建性能索引
   CREATE INDEX "usage_date_idx" ON "usage_tracking" ("date");
   CREATE INDEX "monthly_usage_month_idx" ON "monthly_usage_tracking" ("month");
   ```

3. **验证表已创建**

   执行以下查询：
   ```sql
   SELECT table_name, column_name 
   FROM information_schema.columns 
   WHERE table_name IN ('usage_tracking', 'monthly_usage_tracking')
   ORDER BY table_name, ordinal_position;
   ```

4. **测试 Image-to-Video 功能**
   
   刷新页面并重试上传图片生成视频。

### 方法 2: 使用 psql 命令行（如果已安装）

```bash
# 从 .env.local 获取 DATABASE_URL
psql $DATABASE_URL -f MANUAL_MIGRATION_USAGE_TRACKING.sql
```

### 方法 3: 等待 Vercel 自动部署

如果你无法直接访问数据库，可以等待下次 Vercel 部署，系统会自动运行迁移。

## 验证修复

修复后，`usage_tracking` 表应该包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | text | 主键 |
| user_id | text | 用户ID（外键） |
| date | text | 日期（YYYY-MM-DD） |
| image_to_text_count | integer | 图片转文本次数 |
| image_generation_count | integer | 图片生成次数 |
| video_generation_count | integer | 视频生成次数 |
| credits_used_daily | integer | 每日使用积分 |
| credits_used_monthly | integer | 每月使用积分 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## 表的作用

### usage_tracking
- 追踪每个用户每天的功能使用次数
- 用于实施免费配额限制（例如：每天3次，每月10次）
- 记录每日和每月的积分使用情况

### monthly_usage_tracking
- 追踪每个用户每月的总使用量
- 用于生成使用报告和统计
- 帮助管理月度配额

## 常见问题

### Q: 为什么会缺少这些表？
A: 这些表是最近添加的新功能，可能在某些部署环境中迁移未执行。

### Q: 执行 SQL 时出现 "already exists" 错误？
A: 这是正常的，说明表已经存在。可以忽略此错误。

### Q: 我的表已创建，但仍然出错？
A: 确保外键和索引也已创建。重新运行完整的 SQL 脚本。

### Q: 如何清除测试数据？
A: 执行以下 SQL（谨慎！会删除所有使用记录）：
```sql
TRUNCATE TABLE usage_tracking CASCADE;
TRUNCATE TABLE monthly_usage_tracking CASCADE;
```

## 相关文件

- `src/server/db/schema.ts` - 数据库表定义
- `drizzle/0003_add_usage_tracking_tables.sql` - 迁移 SQL 文件
- `MANUAL_MIGRATION_USAGE_TRACKING.sql` - 手动执行的 SQL 脚本

## 技术支持

如果问题仍然存在，请：
1. 检查数据库连接字符串是否正确
2. 确认数据库用户有创建表的权限
3. 查看服务器日志获取详细错误信息

