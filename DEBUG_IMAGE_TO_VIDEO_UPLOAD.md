# Debug Image-to-Video Upload Error

## 问题

错误信息：`Failed to upload image to video generation service`

## 已知信息

✅ **KIE_API_KEY 已在 Vercel 配置**

## 可能的原因

### 1. KIE API 认证失败
- API Key 格式不正确
- API Key 已过期或被撤销
- API Key 权限不足

### 2. 图片问题
- 图片大小超过限制
- 图片格式不支持
- 图片已损坏

### 3. KIE API 服务问题
- API 服务暂时不可用
- API 端点变更
- 速率限制

### 4. 网络问题
- Vercel 到 KIE API 的网络连接问题
- 超时设置太短

## 诊断步骤

### 步骤 1: 检查 Vercel 日志

1. 访问 Vercel 项目控制台
2. 进入 **Logs** 页面
3. 查找包含 `[sora-image-generate]` 的日志
4. 特别关注：
   ```
   [sora-image-generate] Upload response status: XXX
   [sora-image-generate] Error data: {...}
   [sora-image-generate] KIE API Key configured: Yes (xxxxxxxxxx...)
   ```

### 步骤 2: 验证 KIE API Key

**在 Vercel 环境变量中检查**:
1. 确认 `KIE_API_KEY` 格式正确
2. 确认没有多余的空格或引号
3. 确认 Key 有效期未过期

**测试 API Key**:
```bash
curl -X GET "https://api.kie.ai/api/v1/user/info" \
  -H "Authorization: Bearer YOUR_KIE_API_KEY"
```

预期返回：
- 200: API Key 有效
- 401/403: API Key 无效或过期

### 步骤 3: 检查图片要求

**KIE API 图片上传要求**:
- 最大文件大小: 通常 10MB
- 支持格式: JPEG, PNG, WebP
- 最小分辨率: 512x512
- 最大分辨率: 4096x4096

### 步骤 4: 测试上传端点

使用 curl 测试图片上传：

```bash
curl -X POST "https://api.kie.ai/api/v1/files/upload" \
  -H "Authorization: Bearer YOUR_KIE_API_KEY" \
  -F "file=@test.jpg"
```

预期响应：
```json
{
  "code": 200,
  "data": {
    "url": "https://...",
    "file_id": "..."
  }
}
```

### 步骤 5: 查看详细错误

最新的代码改进增加了详细的错误日志。在 Vercel 日志中查找：

```
[sora-image-generate] Image upload failed
[sora-image-generate] Status: 401 Unauthorized
[sora-image-generate] Error data: { ... }
```

## 常见错误及解决方案

### Error 401: Unauthorized
**原因**: API Key 无效或过期

**解决方案**:
1. 检查 Vercel 环境变量中的 `KIE_API_KEY`
2. 确认 API Key 没有多余的空格
3. 从 KIE 平台重新生成 API Key
4. 更新 Vercel 环境变量
5. 重新部署应用

### Error 413: Payload Too Large
**原因**: 图片文件太大

**解决方案**:
1. 在前端添加文件大小限制（建议 5MB）
2. 自动压缩大图片
3. 提示用户调整图片大小

### Error 415: Unsupported Media Type
**原因**: 图片格式不支持

**解决方案**:
1. 在前端验证文件类型
2. 只允许 JPEG, PNG, WebP
3. 转换不支持的格式

### Error 429: Too Many Requests
**原因**: 超过速率限制

**解决方案**:
1. 实施请求队列
2. 添加请求延迟
3. 升级 KIE API 计划

### Error 500: Internal Server Error
**原因**: KIE API 服务问题

**解决方案**:
1. 稍后重试
2. 联系 KIE 技术支持
3. 实施重试机制

## 临时解决方案

如果问题持续存在，可以实施以下临时方案：

### 1. 添加重试机制

在 `src/app/api/v1/sora-image-generate/route.ts` 中添加：

```typescript
// 重试上传函数
async function uploadWithRetry(url: string, formData: FormData, apiKey: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData,
      });
      
      if (response.ok) {
        return response;
      }
      
      // 如果是认证错误，不重试
      if (response.status === 401 || response.status === 403) {
        return response;
      }
      
      // 其他错误，等待后重试
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 2. 使用备用上传服务

如果 KIE API 不稳定，考虑：
1. 先上传到你自己的 R2/S3
2. 将公开 URL 传递给 KIE API
3. 避免直接依赖 KIE 的文件上传

## 需要的信息

为了更好地诊断问题，请提供：

1. **Vercel 日志截图**（包含错误详情）
2. **上传的图片规格**（大小、格式、分辨率）
3. **错误发生的频率**（每次都失败？偶尔失败？）
4. **KIE API 响应状态码**（从日志中获取）

## 下一步

1. ✅ 改进了错误日志（已在代码中完成）
2. ✅ 更新了环境变量示例
3. ⏳ 等待 Vercel 重新部署后查看详细日志
4. ⏳ 根据日志确定具体问题
5. ⏳ 实施针对性修复

## 联系支持

如果问题仍未解决：

1. **KIE API 支持**: 检查 KIE.ai 文档或联系其技术支持
2. **提供日志**: 将完整的错误日志发给开发者
3. **测试环境**: 在本地开发环境测试 KIE API
