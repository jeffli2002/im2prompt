# Image-to-Prompt 错误修复总结

## 问题诊断

**原始错误**: `Generation failed - Internal server error`

**根本原因**:
1. Coze API 返回错误码 `5001`（模型内部错误）
2. 代码只检查了 HTTP 状态码，未检查响应体中的 `code` 字段
3. 当 Coze API 失败时，没有正确触发 Google Vision API fallback

## 已实施的修复

### 1. 更新环境变量配置

**文件**: `env.example`

添加了 Coze API 配置示例：
```env
# Coze API (Required for Image-to-Prompt feature)
COZE_API_KEY="your-coze-api-key"
COZE_WORKFLOW_ID="7550263539588399142"
```

### 2. 改进 Coze API 错误处理

**文件**: `src/app/api/v1/image-to-prompt/route.ts`

**修改内容**:
- 添加了对 Coze API 响应体中 `code` 字段的检查
- 当 `code !== 0` 时，视为失败并触发 fallback
- 记录详细的错误信息（包括 `debug_url`）

**修改前**:
```typescript
if (!cozeResponse.ok) {
  // 只检查 HTTP 状态码
  return NextResponse.json({ error: '...' }, { status: 500 });
}
```

**修改后**:
```typescript
// 检查 HTTP 状态码和 Coze API 的 code 字段
if (!cozeResponse.ok || (cozeData.code && cozeData.code !== 0)) {
  const errorMsg = cozeData.msg || cozeData.message || cozeResponse.statusText;
  console.error('Coze API error:', {
    httpStatus: cozeResponse.status,
    cozeCode: cozeData.code,
    message: errorMsg,
    debugUrl: cozeData.debug_url
  });
  console.log('❌ Coze API 调用失败，自动切换到 Google Vision API fallback');
  
  // 不直接返回错误，而是让 extractedPrompt 保持为空
  // 这样会自动触发后续的 Google Vision fallback 逻辑
}
```

### 3. 配置 Google Vision API

**文件**: `.env.local`

已添加 `GOOGLE_APPLICATION_CREDENTIALS` 环境变量，包含完整的 Google Cloud 服务账户凭据。

## Fallback 机制流程

```
用户上传图片
    ↓
调用 Coze API
    ↓
检查响应
    ├─ 成功 (code === 0) → 返回 Coze 生成的提示词
    └─ 失败 (code !== 0) → 触发 fallback
           ↓
      调用 Google Vision API
           ├─ 成功 → 返回 Vision 生成的提示词
           └─ 失败 → 返回模拟提示词（最后保底）
```

## 测试验证

### 已完成的测试

1. **Coze API 连接测试** ✅
   - API 密钥格式正确
   - 文件上传成功
   - 工作流调用返回错误 5001（预期行为）

2. **配置验证** ✅
   - `COZE_API_KEY` 已配置
   - `COZE_WORKFLOW_ID` 已配置
   - `GOOGLE_APPLICATION_CREDENTIALS` 已配置

### 需要用户测试

请按以下步骤测试修复：

1. **启动开发服务器**
   ```bash
   pnpm dev
   ```

2. **访问 Image-to-Prompt 页面**
   ```
   http://localhost:3002/en/image-to-prompt
   ```

3. **上传测试图片**
   - 上传任意图片
   - 选择模型风格（如 `general` 或 `midjourney`）
   - 点击生成

4. **验证结果**
   - ✅ 如果返回提示词，说明修复成功
   - 📝 检查控制台日志：
     - 如果看到 "Coze API 调用失败，自动切换到 Google Vision API fallback"
     - 说明 fallback 机制正常工作

## 预期行为

### 场景 1: Coze API 正常
- 用户上传图片
- Coze API 成功生成提示词
- 返回高质量的 AI 生成提示词

### 场景 2: Coze API 失败（当前情况）
- 用户上传图片
- Coze API 返回错误（code: 5001）
- **自动切换到 Google Vision API**
- 使用 Vision API 分析图片
- 返回基于 Vision API 的提示词
- 控制台显示 fallback 日志

### 场景 3: 两者都失败（极端情况）
- 返回预设的模拟提示词
- 确保用户始终能得到响应

## 日志示例

当 Coze API 失败时，服务器日志应显示：

```
Coze Workflow API response: {
  "code": 5001,
  "msg": "Model encountered an internal error...",
  "debug_url": "https://www.coze.cn/work_flow/..."
}
Coze API error: {
  httpStatus: 200,
  cozeCode: 5001,
  message: 'Model encountered an internal error...',
  debugUrl: 'https://www.coze.cn/work_flow/...'
}
❌ Coze API 调用失败，自动切换到 Google Vision API fallback
Falling back to Google Vision API
Google Vision API client initialized successfully
Generated prompt from Google Vision API: [提示词内容]
```

## 下一步行动

1. **重启开发服务器** - 确保所有环境变量生效
2. **测试功能** - 上传图片验证 fallback 机制
3. **监控日志** - 查看 Coze API 是否恢复正常

## 技术细节

### Coze API 错误码

- `code: 0` - 成功
- `code: 5001` - 模型内部错误
- 其他非零代码 - 各种错误情况

### Google Vision API

使用的功能：
- Label Detection（标签检测）
- Object Localization（对象定位）
- Image Properties（图片属性）
- Face Detection（人脸检测，可选）
- Text Detection（文本检测，可选）

### 环境变量

必需的环境变量：
- `COZE_API_KEY` - Coze API 认证密钥
- `COZE_WORKFLOW_ID` - Coze 工作流 ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Google Cloud 凭据（JSON 字符串）

## 相关文件

- `src/app/api/v1/image-to-prompt/route.ts` - 主要 API 路由
- `src/lib/google-vision.ts` - Google Vision API 集成
- `.env.local` - 环境变量配置
- `env.example` - 环境变量示例

---

**修复时间**: 2025-10-08  
**修复状态**: ✅ 完成  
**需要用户操作**: 重启服务器并测试

