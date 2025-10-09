# Daily & Monthly Quota Usage Implementation

## Overview
This document describes the implementation of daily and monthly quota tracking for free and paid users in the im2Prompt platform.

## Features Implemented

### 1. Quota Service Extensions
**File**: `src/lib/quota/quota-service.ts`

Added new service types to track:
- `image_generation` - Image generation quota
- `video_generation` - Video generation quota  
- `image_extraction` - Image-to-prompt extraction quota

Each service now supports both:
- **Monthly tracking** (period format: `YYYY-MM`)
- **Daily tracking** (period format: `YYYY-MM-DD`)

### 2. API Action Updates
**File**: `src/server/actions/credit-actions.ts`

Updated `getQuotaUsage()` to return:
```typescript
{
  imageGeneration: {
    daily: { used, limit, isUnlimited },
    monthly: { used, limit, isUnlimited }
  },
  videoGeneration: {
    daily: { used, limit, isUnlimited },
    monthly: { used, limit, isUnlimited }
  },
  imageExtraction: {
    daily: { used, limit, isUnlimited },
    monthly: { used, limit, isUnlimited }
  }
}
```

### 3. Usage Page UI
**File**: `src/components/usage/usage-page.tsx`

The usage page now displays:
- **Daily quotas** for images and videos (color-coded with left border)
  - Blue: Daily images
  - Purple: Daily videos
- **Monthly quotas** for images, videos, and extractions
  - Indigo: Monthly images
  - Pink: Monthly videos
  - Green: Image-to-prompt extractions

Each quota card shows:
- Used/Limit ratio
- Progress bar (for limited quotas)
- ∞ symbol for unlimited quotas

### 4. Database Schema
**File**: `src/server/db/schema.ts`

Updated `userQuotaUsage` table service enum to include:
```sql
['api_call', 'storage', 'custom', 'image_generation', 'video_generation', 'image_extraction']
```

**Migration**: `drizzle/0004_add_generation_quota_services.sql`

## Plan Configuration

### Free Plan Limits
**File**: `src/config/payment.config.ts`

```typescript
limits: {
  extractions: 5,        // Monthly image-to-prompt extractions
  images: 10,           // Monthly image generations
  videos: 5,            // Monthly video generations
  dailyImages: 1,       // Daily image generation limit
  dailyVideos: 1,       // Daily video generation limit
  batchSize: 1,
  quality: 'standard',
}
```

### Pro Plan Limits
```typescript
limits: {
  extractions: 300,
  dailyImages: -1,      // -1 = unlimited
  dailyVideos: -1,      // -1 = unlimited
  batchSize: 5,
  quality: 'hd',
}
```

## Usage in Code

### Tracking Generation Usage

#### When user generates an image:
```typescript
import { quotaService } from '@/lib/quota/quota-service';

// Track monthly
await quotaService.trackImageGeneration(userId, 1);

// Track daily (for free users)
await quotaService.trackImageGenerationDaily(userId, 1);
```

#### When user generates a video:
```typescript
// Track monthly
await quotaService.trackVideoGeneration(userId, 1);

// Track daily (for free users)
await quotaService.trackVideoGenerationDaily(userId, 1);
```

#### When user extracts a prompt from an image:
```typescript
// Track monthly
await quotaService.trackImageExtraction(userId, 1);

// Track daily
await quotaService.trackImageExtractionDaily(userId, 1);
```

### Checking Quota Before Generation

```typescript
import { getQuotaUsage } from '@/server/actions/credit-actions';

const quotaResult = await getQuotaUsage();

if (quotaResult.success && quotaResult.data) {
  const { imageGeneration } = quotaResult.data;
  
  // Check daily limit for free users
  if (!imageGeneration.daily.isUnlimited) {
    const remaining = imageGeneration.daily.limit - imageGeneration.daily.used;
    if (remaining <= 0) {
      throw new Error('Daily image generation limit reached');
    }
  }
  
  // Check monthly limit
  if (!imageGeneration.monthly.isUnlimited) {
    const remaining = imageGeneration.monthly.limit - imageGeneration.monthly.used;
    if (remaining <= 0) {
      throw new Error('Monthly image generation limit reached');
    }
  }
}
```

## Database Migration

To apply the schema changes:

```bash
# Generate migration (if not already created)
npm run db:generate

# Push to database
npm run db:push

# Or apply migration
npm run db:migrate
```

## Testing

1. **Sign in as a free user**
2. **Navigate to** Settings → Usage
3. **Verify display shows:**
   - Daily image quota (e.g., 0/1)
   - Daily video quota (e.g., 0/1)
   - Monthly image quota (e.g., 0/10)
   - Monthly video quota (e.g., 0/5)
   - Monthly extraction quota (e.g., 0/5)
4. **Generate an image** - verify daily and monthly counters increment
5. **Generate a video** - verify daily and monthly counters increment
6. **Test daily limits** - reach daily limit, verify error message
7. **Check quota reset** - wait until next day, verify daily quota resets to 0

## Benefits for Free Users

✅ **Clear visibility** of daily and monthly limits
✅ **Real-time tracking** of quota consumption
✅ **Visual progress bars** showing remaining quota
✅ **Separate tracking** for images, videos, and extractions
✅ **Better planning** - users know exactly what they have left

## Next Steps

1. **Add quota check middleware** to prevent over-usage
2. **Implement automatic daily reset** (cron job)
3. **Send notifications** when quota is running low
4. **Add upgrade prompts** when limits are reached
5. **Track historical usage** for analytics

## Notes

- Daily quotas use `YYYY-MM-DD` format for period tracking
- Monthly quotas use `YYYY-MM` format
- Unlimited quotas (paid plans) show ∞ symbol
- Storage tracking is deprecated per recent updates
- The system is designed to scale to additional quota types easily
