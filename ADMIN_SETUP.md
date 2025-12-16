# Admin Panel Setup Guide

## 设置 Admin 账户

Admin 面板使用独立的认证系统，与普通用户系统分离。

### 步骤 1: 生成 ADMIN_JWT_SECRET

首先，生成一个安全的随机密钥：

```bash
pnpm admin:generate-secret
```

这会生成一个 64 字符的十六进制随机字符串。复制生成的密钥。

**或者手动生成：**

在 Node.js 中运行：
```javascript
require('crypto').randomBytes(32).toString('hex')
```

在终端中运行（Linux/Mac）：
```bash
openssl rand -hex 32
```

在 PowerShell 中运行（Windows）：
```powershell
-join ((48..57) + (97..102) | Get-Random -Count 64 | % {[char]$_})
```

### 步骤 2: 配置环境变量

在 `.env.local` 文件中添加以下环境变量：

```env
# Admin Panel Authentication
ADMIN_EMAIL="admin@im2prompt.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_NAME="Admin User"
ADMIN_JWT_SECRET="paste-your-generated-secret-here"
```

**重要提示：**
- `ADMIN_EMAIL`: Admin 登录邮箱
- `ADMIN_PASSWORD`: Admin 登录密码（建议使用强密码）
- `ADMIN_NAME`: Admin 显示名称
- `ADMIN_JWT_SECRET`: JWT 签名密钥（使用上面生成的密钥）

### 步骤 3: 运行数据库迁移

确保 `admins` 表已创建：

```bash
pnpm db:push
# 或
pnpm db:migrate
```

### 步骤 4: 创建 Admin 用户

运行以下命令创建或更新 admin 用户：

```bash
pnpm admin:create
```

这个脚本会：
- 从环境变量读取 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`
- 如果 admin 已存在，更新密码
- 如果 admin 不存在，创建新用户

### 步骤 5: 访问 Admin 面板

1. 启动开发服务器：
   ```bash
   pnpm dev
   ```

2. 访问 admin 登录页面：
   ```
   http://localhost:3000/admin/login
   ```

3. 使用配置的邮箱和密码登录

### 默认凭据

如果没有设置环境变量，脚本会使用以下默认值：
- Email: `admin@im2prompt.com`
- Password: `admin123456`

**⚠️ 警告：生产环境必须更改默认密码！**

### 更新 Admin 密码

要更新现有 admin 的密码，只需：

1. 更新 `.env.local` 中的 `ADMIN_PASSWORD`
2. 运行 `pnpm admin:create`

### 创建多个 Admin 用户

要创建多个 admin 用户，可以：

1. 临时修改 `.env.local` 中的 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`
2. 运行 `pnpm admin:create`
3. 重复步骤 1-2 创建其他 admin

### 安全建议

1. **生产环境必须更改默认密码**
2. **使用强密码**（至少 12 个字符，包含大小写字母、数字和特殊字符）
3. **定期轮换 `ADMIN_JWT_SECRET`**
4. **不要在代码仓库中提交 `.env.local` 文件**
5. **限制 admin 面板的访问**（使用防火墙或 IP 白名单）

### 故障排除

**问题：无法登录**

1. **检查环境变量是否正确设置**
   - 确认 `.env.local` 中的 `ADMIN_EMAIL`、`ADMIN_PASSWORD` 和 `ADMIN_JWT_SECRET` 已设置

2. **确认 `admins` 表已创建**
   - 如果 `pnpm admin:create` 失败，可以手动执行 SQL：
     ```bash
     # 查看 SQL 脚本
     cat scripts/create-admin-manual.sql
     ```
   - 或者直接在数据库中执行：
     ```sql
     CREATE TABLE IF NOT EXISTS admins (
       id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
       email TEXT NOT NULL UNIQUE,
       name TEXT,
       password_hash TEXT NOT NULL,
       role TEXT NOT NULL DEFAULT 'admin',
       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
       last_login_at TIMESTAMP
     );
     ```

3. **手动创建 Admin 用户**
   - 生成密码哈希：
     ```bash
     node scripts/create-admin-hash.js your-password
     ```
   - 在数据库中插入用户：
     ```sql
     INSERT INTO admins (email, name, password_hash) 
     VALUES ('admin@im2prompt.com', 'Admin User', 'your-generated-hash')
     ON CONFLICT (email) DO UPDATE SET 
       password_hash = EXCLUDED.password_hash,
       updated_at = NOW();
     ```

4. **检查数据库连接**
   - 确认 `DATABASE_URL` 环境变量正确
   - 测试数据库连接是否正常

5. **查看控制台错误信息**
   - 检查浏览器控制台
   - 检查服务器终端日志

**问题：密码更新不生效**
- 确认 `.env.local` 文件已保存
- 重新运行 `pnpm admin:create`
- 清除浏览器 cookies 后重试

**问题：数据库错误**
- 确认 `DATABASE_URL` 环境变量正确
- 检查数据库连接权限
- 确认 `admins` 表结构正确

### 相关文件

- `src/server/db/schema.ts` - 数据库 schema（包含 `admins` 表定义）
- `scripts/create-admin.ts` - Admin 创建脚本
- `src/lib/admin/auth.ts` - Admin 认证工具
- `src/app/api/admin/auth/login/route.ts` - Admin 登录 API

