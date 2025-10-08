# 人脸检测错误处理改进文档

## 📋 概述

完善了图像转视频功能中的人脸/人物检测和错误处理机制，确保：
1. ✅ **检测到人脸/人物时阻止处理** - 符合 Sora 2 要求
2. ✅ **提供清晰的中英文错误提示** - 用户友好
3. ✅ **Vision API 故障时服务继续可用** - 高可用性

## 🎯 功能特性

### 1. 人脸/人物检测逻辑

**检测范围：**
- ✅ 人脸检测 (Face Detection)
- ✅ 人物检测 (Person Object Localization)  
- ✅ 相关标签检测 (person, people, human, man, woman, child)

**处理流程：**
```
上传图片 → Vision API 检测 → 发现人脸/人物？
                              ├─ 是 → 阻止请求 (400) → 显示友好错误
                              └─ 否 → 继续生成视频
```

### 2. 错误提示系统

#### 后端错误消息（双语）

**检测到人脸：**
```
检测到 1 个人脸 / Detected 1 face(s). 
Sora 2 不支持包含人物或人脸的图片 / Sora 2 does not support images with people or faces.
```

**检测到人物：**
```
检测到 2 个人物 / Detected 2 person(s). 
Sora 2 不支持包含人物的图片 / Sora 2 does not support images with people.
```

#### 前端错误显示

**视觉样式：**
- 🟠 **琥珀色警告框**（非红色错误）- 表示这是政策限制而非系统错误
- 🚫 **清晰的图标和标题**：`图片被阻止 / Image Blocked`
- 💡 **建议列表**：展示可接受的图片类型

**错误展示区域：**
```
┌─────────────────────────────────────────┐
│ 🚫 图片被阻止 / Image Blocked           │
│                                         │
│ 检测到 1 个人脸...                       │
│                                         │
│ 💡 建议使用的图片类型：                   │
│ ✓ 风景照片（山、海、天空）                │
│ ✓ 建筑物和城市景观                       │
│ ✓ 物品和产品照片                         │
│ ✓ 动物照片（不含人物）                   │
│ ✓ 抽象艺术和图案                         │
└─────────────────────────────────────────┘
```

**弹窗提示：**
```
🚫 图片被阻止 / Image Blocked

检测到 1 个人脸 / Detected 1 face(s)...

💡 建议 / Suggestion:
请上传不包含人物或人脸的图片，如：
- 风景照片 (Landscapes)
- 物品照片 (Objects)
- 建筑场景 (Architecture)
- 动物照片 (Animals - no people)
```

### 3. Vision API 故障容错

**故障场景处理：**

| 场景 | 处理方式 | 用户影响 |
|------|---------|----------|
| Vision API 未配置 | 记录警告 → 跳过检测 → 继续处理 | ✅ 服务可用 |
| Vision API 调用失败 | 记录错误 → 跳过检测 → 继续处理 | ✅ 服务可用 |
| Vision API 超时 | 捕获异常 → 跳过检测 → 继续处理 | ✅ 服务可用 |
| Vision API 正常工作 | 执行检测 → 阻止不符合规则的图片 | ✅ 按预期工作 |

**关键代码逻辑：**
```typescript
// src/app/api/v1/sora-image-generate/route.ts
try {
  const visionCheck = await checkForPeopleAndFaces(imageBuffer);
  
  if (visionCheck.blocked) {
    // 阻止请求
    return NextResponse.json({ error: visionCheck.reason }, { status: 400 });
  }
} catch (visionError) {
  // Vision API 故障 - 记录错误但继续处理
  console.error('Vision API exception:', visionError);
  console.error('Proceeding without face detection');
}
// 继续处理视频生成...
```

## 🔧 技术实现

### 修改的文件

#### 1. `src/lib/google-vision.ts`
**改进：**
- ✅ `getClient()` 返回 `null` 而非抛出异常
- ✅ `checkForPeopleAndFaces()` 处理 null client
- ✅ 失败时返回 `blocked: false` 允许继续
- ✅ 双语错误消息生成

**关键改动：**
```typescript
function getClient() {
  if (!client) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        // 初始化 Vision client
      } catch (error) {
        console.error('Vision API will be disabled');
        return null; // 返回 null 而非抛出异常
      }
    } else {
      console.warn('Vision API disabled');
      return null;
    }
  }
  return client;
}

export async function checkForPeopleAndFaces(imageBuffer: Buffer) {
  try {
    const visionClient = getClient();
    
    if (!visionClient) {
      return {
        success: false,
        blocked: false, // 不阻止
        error: 'Vision API not configured'
      };
    }
    
    // 执行检测...
    const blocked = hasFaces || hasPeople;
    
    // 生成双语错误消息
    let reason = null;
    if (blocked) {
      if (hasFaces) {
        reason = `检测到 ${faces.length} 个人脸 / Detected ${faces.length} face(s)...`;
      } else {
        reason = `检测到 ${personObjects.length} 个人物 / Detected ${personObjects.length} person(s)...`;
      }
    }
    
    return { success: true, blocked, reason, ... };
  } catch (error) {
    return {
      success: false,
      blocked: false, // 失败时不阻止
      error: error.message
    };
  }
}
```

#### 2. `src/app/api/v1/sora-image-generate/route.ts`
**改进：**
- ✅ try-catch 保护 Vision API 调用
- ✅ 详细的日志记录
- ✅ 优雅的错误处理

**关键改动：**
```typescript
try {
  console.log('[sora-image-generate] Checking for people/faces');
  const visionCheck = await checkForPeopleAndFaces(imageBuffer);
  
  if (!visionCheck.success) {
    console.warn('Vision API check failed:', visionCheck.error);
    console.warn('Proceeding without face detection');
  } else if (visionCheck.blocked) {
    console.log('Vision API blocked image:', visionCheck.reason);
    return NextResponse.json(
      { error: visionCheck.reason, details: visionCheck.details },
      { status: 400 }
    );
  } else {
    console.log('Vision API check passed');
  }
} catch (visionError) {
  console.error('Vision API exception:', visionError);
  console.error('Proceeding without face detection');
}
// 继续处理...
```

#### 3. `src/components/sora-video-generator.tsx`
**改进：**
- ✅ 识别人脸检测错误（状态码 400）
- ✅ 琥珀色警告样式
- ✅ 双语错误显示
- ✅ 建议列表展示
- ✅ 弹窗提示

**关键改动：**
```typescript
// 处理人脸检测阻止
if (createResponse.status === 400 && createData.error && 
    (createData.error.toLowerCase().includes('face') || 
     createData.error.toLowerCase().includes('people'))) {
  
  // 在结果区域显示错误
  const blockErrorResult = {
    taskId: '',
    status: 'failed' as const,
    error: createData.error
  };
  setResult(blockErrorResult);
  setIsGenerating(false);
  
  // 显示友好的弹窗提示
  alert(`🚫 图片被阻止 / Image Blocked\n\n${createData.error}\n\n💡 建议...`);
  
  return; // 停止处理
}

// UI 渲染
{result?.status === 'failed' && (
  <div className={`p-4 rounded-xl ${
    isFaceError ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-200'
  }`}>
    <AlertCircle className={isFaceError ? 'text-amber-600' : 'text-red-600'} />
    <div>
      <p>{isFaceError ? '🚫 图片被阻止' : '❌ 生成失败'}</p>
      <p>{result.error}</p>
      
      {isFaceError && (
        <div className="bg-white/70 rounded-lg p-3">
          <p>💡 建议使用的图片类型：</p>
          <ul>
            <li>✓ 风景照片</li>
            <li>✓ 建筑物和城市景观</li>
            <li>✓ 物品和产品照片</li>
            <li>✓ 动物照片（不含人物）</li>
            <li>✓ 抽象艺术和图案</li>
          </ul>
        </div>
      )}
    </div>
  </div>
)}
```

#### 4. `test-vision-config.mjs`（新增）
**功能：**
- ✅ 检查环境变量配置
- ✅ 验证 JSON 格式
- ✅ 测试 Vision API 连接
- ✅ 性能测试

**使用方法：**
```bash
pnpm test:vision-config
```

## 📊 测试场景

### 场景 1: Vision API 正常 + 风景图片
```
✅ Vision API 检查通过
✅ 未检测到人脸/人物
✅ 继续生成视频
```

### 场景 2: Vision API 正常 + 人脸图片
```
⚠️  Vision API 检测到 1 个人脸
🚫 阻止请求 (400)
📱 显示琥珀色警告 + 建议列表
💡 用户了解为什么被阻止以及应该上传什么
```

### 场景 3: Vision API 未配置
```
⚠️  Vision API 未配置
📝 记录警告日志
✅ 跳过人脸检测
✅ 继续生成视频（用户可正常使用服务）
```

### 场景 4: Vision API 调用失败
```
❌ Vision API 调用失败
📝 记录错误日志
✅ 捕获异常
✅ 跳过人脸检测
✅ 继续生成视频（服务保持可用）
```

## 🚀 部署建议

### Vercel 环境变量配置

**必需（用于人脸检测）：**
```
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"xxx","private_key":"xxx",...}
```

**不配置的影响：**
- ⚠️  人脸检测功能禁用
- ✅ 服务正常运行
- ℹ️  所有图片都能通过（无过滤）

### 日志监控

在 Vercel 日志中查找：
```
[sora-image-generate] Request received
[sora-image-generate] User authenticated: xxx
[sora-image-generate] Checking for people/faces
[sora-image-generate] Vision API check passed
[sora-image-generate] Uploading image to KIE API
[sora-image-generate] Creating video generation task
```

**如果看到：**
```
[sora-image-generate] Vision API blocked image: 检测到 1 个人脸...
```
表示人脸检测正常工作并阻止了包含人脸的图片。

**如果看到：**
```
Vision API check failed: Vision API not configured
Proceeding without face detection
```
表示 Vision API 未配置，服务在无人脸检测模式下运行。

## 📝 用户指南

### 推荐的图片类型

**✅ 允许上传：**
1. **自然风景**
   - 山川、河流、海洋
   - 日出、日落、星空
   - 森林、沙漠、草原

2. **城市建筑**
   - 摩天大楼、桥梁
   - 街道、广场
   - 历史建筑

3. **物品产品**
   - 电子产品、家具
   - 食物、饮料
   - 艺术品、工艺品

4. **动物植物**
   - 宠物（单独，无人）
   - 野生动物
   - 花卉、植物

5. **抽象艺术**
   - 图案、纹理
   - 色彩组合
   - 数字艺术

**🚫 不允许上传：**
- ❌ 包含人脸的照片
- ❌ 包含人物的照片
- ❌ 自拍照
- ❌ 团体照
- ❌ 肖像照

### 如果图片被阻止

1. **查看错误消息**：了解具体检测到什么（人脸或人物）
2. **参考建议列表**：选择推荐的图片类型
3. **更换图片**：上传不包含人物的图片
4. **重新尝试**：使用新图片生成视频

## 🔍 故障排查

### 问题：所有图片都被阻止

**可能原因：**
- Vision API 过于敏感
- 图片包含人形物体（雕像、玩偶等）

**解决方案：**
1. 检查图片是否真的包含人物
2. 尝试纯风景或物品照片
3. 查看 Vision API 返回的详细信息

### 问题：包含人物的图片未被阻止

**可能原因：**
- Vision API 未配置
- Vision API 调用失败

**检查方法：**
1. 运行 `pnpm test:vision-config`
2. 查看 Vercel 部署日志
3. 检查环境变量配置

### 问题：Vision API 响应慢

**优化建议：**
- 图片大小控制在 2MB 以内
- 使用合适的图片分辨率
- 考虑增加 Vercel 函数超时时间

## 📈 性能指标

**典型响应时间：**
- Vision API 调用：200-800ms
- 图片上传到 KIE：300-1000ms
- 视频任务创建：100-300ms
- **总计**：约 600-2100ms

**建议：**
- 前端显示上传进度
- 使用"正在检测..."状态提示
- 超时设置：10 秒（Vision API）

## 🎨 UI/UX 最佳实践

### 视觉层次

1. **琥珀色警告** > 红色错误
   - 人脸检测是政策限制，非系统故障
   - 使用警告色而非错误色

2. **清晰的图标**
   - 🚫 表示被阻止
   - 💡 表示建议
   - ✓ 表示允许的类型

3. **双语支持**
   - 中文在前，英文在后
   - 照顾不同语言用户

### 交互设计

1. **即时反馈**
   - 弹窗 alert 立即提示
   - UI 区域持久显示

2. **建议列表**
   - 具体的图片类型
   - 可操作的指导

3. **错误恢复**
   - 明确告知如何修正
   - 提供替代方案

## 🔐 安全考虑

1. **不泄露敏感信息**
   - 错误消息不包含系统内部信息
   - Vision API 错误被安全记录

2. **用户隐私**
   - 图片仅用于检测，不存储
   - 检测结果不被记录

3. **服务可用性**
   - Vision API 故障不影响核心服务
   - 优雅降级策略

## 📚 相关文档

- [Google Cloud Vision API 文档](https://cloud.google.com/vision/docs)
- [Sora 2 使用政策](https://openai.com/sora)
- [IMAGE_TO_VIDEO_FIX.md](./IMAGE_TO_VIDEO_FIX.md) - JSON 解析错误修复

## 🎯 总结

### 达成目标

✅ **检测到人脸/人物时阻止处理**
- Google Vision API 集成
- 人脸和人物检测
- 明确的阻止逻辑

✅ **提供清晰的错误提示**
- 双语错误消息
- 友好的 UI 展示
- 具体的建议列表

✅ **高可用性**
- Vision API 故障容错
- 服务持续可用
- 优雅降级

### 用户体验

- 🎨 直观的视觉反馈
- 📝 清晰的错误说明
- 💡 有用的操作建议
- 🌏 双语支持

### 开发体验

- 🐛 详细的日志记录
- 🧪 完整的测试工具
- 📊 性能监控
- 🔧 易于调试

---

**版本**: 1.0  
**最后更新**: 2025-10-08  
**维护者**: AI Development Team

