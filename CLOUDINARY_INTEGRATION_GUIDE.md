# Cloudinary 集成指南 - 图片到视频生成

## 概述

本项目已成功集成 Cloudinary 来解决图片到视频生成的问题。Cloudinary 用作图片上传和存储服务，为 KIE API (Sora 2) 提供公开可访问的图片 URL。

## 配置步骤

### 1. 环境变量配置

在 `.env.local` 文件中添加以下环境变量：

```env
# Cloudinary 配置
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

### 2. Cloudinary 上传预设设置

在 Cloudinary 控制台中：
1. 创建或编辑上传预设 (Upload Preset)
2. **重要**: 选择 **"Unsigned"** 签名模式
3. 设置文件夹为 `sora-inputs` (可选)
4. 确保访问模式为公开 (Public)

### 3. 签名模式选择

根据你的使用场景选择签名模式：

- **Unsigned**: 推荐用于浏览器直接上传和 API 集成
- **Signed**: 主要用于 Cloudinary 媒体库上传

## 技术实现

### 新增文件

1. **`src/lib/cloudinary/cloudinary-service.ts`** - Cloudinary 服务封装
2. **`src/app/api/v1/sora/upload-image/route.ts`** - 图片上传 API
3. **`test-cloudinary-integration.mjs`** - 集成测试脚本

### 修改文件

1. **`src/app/api/v1/sora-image-generate/route.ts`** - 更新为使用 Cloudinary 上传
2. **`env.example`** - 添加 Cloudinary 环境变量示例

## API 流程

### 图片上传流程

```
用户选择图片 → 前端发送到 /api/v1/sora/upload-image → Cloudinary 上传 → 返回公开 URL
```

### 视频生成流程

```
图片文件 → 人脸检测 → Cloudinary 上传 → 获取 URL → KIE API 调用 → 视频生成
```

## 使用方法

### 1. 直接上传图片

```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/v1/sora/upload-image', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('Image URL:', data.imageUrl);
```

### 2. 图片到视频生成

```javascript
const formData = new FormData();
formData.append('prompt', 'Camera slowly zooms in');
formData.append('image', imageFile);
formData.append('aspect_ratio', 'landscape');
formData.append('quality', 'standard');

const response = await fetch('/api/v1/sora-image-generate', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('Task ID:', data.taskId);
```

## 测试

运行集成测试：

```bash
node test-cloudinary-integration.mjs
```

测试脚本会验证：
- 环境变量配置
- 图片上传功能
- URL 可访问性
- 图片到视频生成

## 错误处理

### 常见错误及解决方案

1. **"Image upload to storage not yet implemented"**
   - 原因: 旧版本代码
   - 解决: 确保使用最新版本的 API

2. **"Cloudinary not configured"**
   - 原因: 环境变量未设置
   - 解决: 检查 `.env.local` 文件中的 Cloudinary 配置

3. **"Image uploaded but not yet accessible"**
   - 原因: CDN 传播延迟
   - 解决: 等待几秒后重试

4. **"Image URL is not accessible"**
   - 原因: 图片 URL 无效或不可访问
   - 解决: 检查 Cloudinary 配置和网络连接

## 安全考虑

1. **公开访问**: 上传的图片是公开可访问的，请确保不包含敏感信息
2. **文件大小限制**: 最大 10MB
3. **文件类型限制**: 仅支持 JPEG, PNG, WebP
4. **人脸检测**: 自动检测并阻止包含人脸的图片

## 性能优化

1. **CDN 传播**: 上传后等待 3 秒确保 CDN 传播
2. **URL 验证**: 多次重试验证图片可访问性
3. **错误重试**: 自动重试失败的请求

## 监控和日志

所有关键操作都有详细日志：
- 上传进度
- URL 验证状态
- API 调用结果
- 错误详情

## 故障排除

如果遇到问题：

1. 检查环境变量是否正确设置
2. 验证 Cloudinary 上传预设配置
3. 查看服务器日志获取详细错误信息
4. 运行测试脚本验证集成状态

## 参考项目

本实现基于 `../CoverImage` 项目的成功经验，采用了相同的技术方案和最佳实践。
