# Image to Prompt API Documentation

## Overview
The Image to Prompt API allows users to extract AI prompts from images using the Coze API. It supports multiple AI model styles including Midjourney, Stable Diffusion, Flux, Sora2, and Veo3.

## Endpoints

### POST /api/v1/image-to-prompt
Extract prompts from an uploaded image or image URL.

#### Authentication
Requires authenticated session (user must be logged in).

#### Request
- **Method**: POST
- **Content-Type**: multipart/form-data

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| image | File | No* | Image file to analyze (max 4MB, JPEG/PNG/WebP/GIF) |
| imageUrl | string | No* | URL of image to analyze |
| modelStyle | string | No | Target AI model style: 'general', 'midjourney', 'stable-diffusion', 'flux', 'sora2', 'veo3' (default: 'general') |

*Either `image` or `imageUrl` must be provided.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "prompt_id",
    "prompt": "Extracted prompt text...",
    "negativePrompt": "Negative prompt (for stable-diffusion)",
    "modelStyle": "midjourney",
    "creditsUsed": 1,
    "remainingCredits": 99
  }
}
```

#### Error Responses
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Invalid input (missing image, invalid style, file too large)
- `402 Payment Required` - Insufficient credits
- `500 Internal Server Error` - Server error

#### Example cURL
```bash
# Upload image file
curl -X POST http://localhost:3002/api/v1/image-to-prompt \
  -H "Cookie: your-session-cookie" \
  -F "image=@/path/to/image.jpg" \
  -F "modelStyle=midjourney"

# Use image URL
curl -X POST http://localhost:3002/api/v1/image-to-prompt \
  -H "Cookie: your-session-cookie" \
  -F "imageUrl=https://example.com/image.jpg" \
  -F "modelStyle=stable-diffusion"
```

### GET /api/v1/image-to-prompt
Retrieve user's extracted prompts with pagination.

#### Authentication
Requires authenticated session.

#### Request
- **Method**: GET

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |
| modelStyle | string | No | Filter by model style |

#### Response
```json
{
  "success": true,
  "data": {
    "prompts": [
      {
        "id": "prompt_id",
        "promptText": "Prompt text...",
        "negativePrompt": "Negative prompt...",
        "modelStyle": "midjourney",
        "tags": ["midjourney", "extracted"],
        "createdAt": "2025-01-01T12:00:00Z",
        "creditsSpent": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 50,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

#### Example cURL
```bash
# Get all prompts
curl http://localhost:3002/api/v1/image-to-prompt \
  -H "Cookie: your-session-cookie"

# Get prompts with filters
curl "http://localhost:3002/api/v1/image-to-prompt?page=2&limit=20&modelStyle=midjourney" \
  -H "Cookie: your-session-cookie"
```

## Credit System
- Each image-to-prompt extraction costs **1 credit**
- Users must have sufficient credits in their account
- Credits are deducted immediately upon successful extraction
- Free tier users get 20 extractions per month

## Supported Model Styles
1. **general** - Basic descriptive prompt
2. **midjourney** - Midjourney-style prompt with parameters
3. **stable-diffusion** - SD prompt with positive/negative prompts
4. **flux** - Photorealistic Flux AI prompts
5. **sora2** - Video generation prompts for Sora2
6. **veo3** - Video generation prompts for Google Veo3

## Rate Limits
- 60 requests per minute per user
- Maximum file size: 4MB
- Supported formats: JPEG, PNG, WebP, GIF