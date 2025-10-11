# Technical Solution Document: Image ⇄ Prompt AI Platform

## 1. Introduction
This document outlines the detailed product requirements and proposed technical solutions for the Image ⇄ Prompt AI Platform, based on the provided Product Requirements Document (PRD) version 1.2. The platform aims to be an end-to-end AI creative assistant, facilitating the extraction, refinement, translation, and regeneration of visual content through AI prompts.

## 2. Product Vision & Goals
The core vision is to establish an **end-to-end AI creative assistant** that streamlines the process of converting images into prompts, refining these prompts, and subsequently generating new images or videos. This creates a closed-loop system: **Image → Prompt → Image/Video**.

## 3. Target Users
The platform is designed to cater to a diverse user base, including:
*   **AI Artists & Designers**: Users of tools like Midjourney, Stable Diffusion, Flux, Veo3, and Sora2.
*   **Marketers / Agencies**: For creating ad creatives and campaigns.
*   **Content Creators**: For generating thumbnails and social media posts.
*   **Developers & Start-ups**: Interested in embedding prompt-to-image functionalities.

## 4. MVP Feature Roadmap and Technical Solutions

### Phase 1 – Month 1-2 (MVP v1.0)

#### 4.1. Image → Prompt
**Requirement**: Upload / URL (≤4 MB) to extract prompts in General, Midjourney (MJ), Stable Diffusion (SD), or Flux styles.

**Technical Solution**:
1.  **Image Understanding**: A general multimodal large model, specifically **Doubao-Seed-1.6-vision**, will be utilized to interpret the input image and generate a natural language description [1, 2, 3]. This model is noted for its strong visual grounding and reasoning capabilities [4, 5].
2.  **Prompt Translation**: A separate large language model will then translate this natural language description into professional prompts suitable for various AI models (Midjourney, Stable Diffusion, Flux). This translation will leverage predefined prompt templates and syntax rules stored in a knowledge base.
3.  **Backend API**: The backend API for this functionality will be implemented using **Coze workflows** [6, 7]. Coze allows for visual orchestration of large language models, plugins, and code blocks, making it suitable for building complex and stable business processes like prompt translation [8, 9].

#### 4.2. Image/Video Prompt Variants
**Requirement**: Provide 5 AI variations and auto-generate negative prompts, with a special highlight on Sora2.

**Technical Solution**:
1.  **Prompt Variation Generation**: The prompt translation LLM (as described in 4.1.2) will be configured to generate multiple stylistic variations of the prompt based on the target AI model (e.g., Midjourney, Stable Diffusion). This will involve different prompt engineering techniques to ensure diverse and high-quality outputs [10, 11].
2.  **Auto Negative Prompt**: The system will automatically generate negative prompts to guide the AI models away from undesirable elements. This can be achieved through a combination of rule-based systems and an LLM trained on common negative prompt patterns for various styles.
3.  **Video Prompt (Sora2 & Veo3)**: For video generation, particularly with **Sora2**, the system will need to generate highly detailed and descriptive prompts that specify actions, camera movements, and scene details [12, 13]. Sora2 is known for generating physically accurate and realistic videos up to a minute long [14, 15]. The prompt generation for video will require a deeper understanding of temporal dynamics and visual storytelling compared to static image prompts. Google's Veo3, integrated into Canva, also offers text-to-video capabilities and will be considered for its prompt modification guides [16, 17].

#### 4.3. Prompt Library
**Requirement**: Save, search, and tag prompts.

**Technical Solution**:
1.  **Database**: **Neon Postgres** will be used for storing prompts. The `prompts` table will include fields for `prompt_text`, `negative_prompt`, `model_style`, and `s3_key_original` (for the source image). 
2.  **Search & Tagging**: Postgres GIN indexes will be utilized for efficient full-text search and tagging capabilities on the `prompt_text` and `tags` fields (assuming a `tags` field is added to the `prompts` table).

#### 4.4. AI Prompt Editor
**Requirement**: Natural-language refinement of prompts.

**Technical Solution**:
1.  **LLM-powered Editing**: An integrated LLM will allow users to refine prompts using natural language commands (e.g., 

“make this prompt more cinematic,” or “add a cyberpunk style”). This will involve a conversational AI interface that takes user input, modifies the existing prompt, and provides a revised version.

#### 4.5. Auth
**Requirement**: BestAuth: email, magic-link, Google, GitHub, MFA.

**Technical Solution**:
1.  **Authentication Service**: **BestAuth** will be integrated as the primary authentication provider. This will support various authentication methods including email/password, magic links, Google OAuth, GitHub OAuth, and Multi-Factor Authentication (MFA).
2.  **Frontend Integration**: The **BestAuth React SDK** will be used for seamless integration with the Next.js frontend.
3.  **API Integration**: The FastAPI backend will utilize **JWT middleware** for secure authentication and authorization with BestAuth.

#### 4.6. Storage
**Requirement**: AWS S3 buckets `uip-user-uploads` & `uip-renders` + CloudFront.

**Technical Solution**:
1.  **Object Storage**: **AWS S3** will be used for storing user uploads (`uip-user-uploads`) and generated renders (`uip-renders`).
2.  **Content Delivery**: **CloudFront** will be used in conjunction with S3 to provide fast and secure content delivery, especially for presigned URLs for uploads (POST) and access (GET).

#### 4.7. Credits
**Requirement**: Neon `credit_ledger` table; Creem metered usage.

**Technical Solution**:
1.  **Credit Management**: A `credit_ledger` table in **Neon Postgres** will track user credit balances and transactions. This table will record `user_id`, `amount`, `reason`, and `created_at`.
2.  **Usage Metering**: **Creem** will handle metered usage tracking, integrating with the `credit_ledger` table to deduct credits based on platform usage (e.g., extractions, previews, HD renders).

### Phase 2 – Month 3-4 (MVP v1.5)

#### 4.8. Batch Upload
**Requirement**: Upload up to 10 images simultaneously.

**Technical Solution**:
1.  **Frontend**: Implement a multi-file upload interface.
2.  **Backend**: The FastAPI API will handle multiple file uploads, potentially using asynchronous processing to manage the increased load.

#### 4.9. Personal Style Packs
**Requirement**: Store personal style packs as JSON in Neon.

**Technical Solution**:
1.  **Database Schema**: A new table or a JSONB column in the `users` table will store user-defined style packs.

#### 4.10. Prompt Compare Tool
**Requirement**: Side-by-side comparison of prompts.

**Technical Solution**:
1.  **Frontend**: Develop a UI that allows users to view and compare two prompts and their generated outputs side-by-side.

#### 4.11. Image Preview Generation
**Requirement**: Stable Diffusion 256 px via Fal.ai (credit tracked in Neon).

**Technical Solution**:
1.  **AI Integration**: Integrate with **Fal.ai** for generating 256px Stable Diffusion image previews.
2.  **Credit Tracking**: Usage will be metered and tracked in the `credit_ledger` table.

#### 4.12. Full HD Render
**Requirement**: SDXL, DALL·E, Flux via Replicate / Fal.ai.

**Technical Solution**:
1.  **AI Integration**: Integrate with **Replicate** or **Fal.ai** for generating full HD renders using models like SDXL, DALL·E, and Flux.
2.  **Credit Tracking**: Usage will be metered and tracked in the `credit_ledger` table.

#### 4.13. Neon Branching for CI
**Requirement**: PR → preview DB.

**Technical Solution**:
1.  **CI/CD Integration**: Configure CI/CD pipelines (e.g., GitHub Actions, Vercel) to automatically create a new **Neon Postgres branch** for each pull request, providing an isolated preview database for testing.

### Phase 3 – Month 5-6 (Growth)

#### 4.14. Public Gallery & Community Voting
**Requirement**: Public gallery with community voting features.

**Technical Solution**:
1.  **Frontend**: Develop a public-facing gallery UI.
2.  **Backend**: Implement voting mechanisms and moderation tools.

#### 4.15. Team Workspaces
**Requirement**: BestAuth orgs → Neon `teams`.

**Technical Solution**:
1.  **BestAuth Integration**: Leverage BestAuth's organizational features to manage teams.
2.  **Database**: A `teams` table in Neon Postgres will store team-specific data, including `bestauth_org_id`, `name`, and `pooled_credits`.

#### 4.16. Prompt Remix → Auto-Regeneration
**Requirement**: Remix prompts and auto-regenerate visuals.

**Technical Solution**:
1.  **Prompt Manipulation**: Allow users to modify existing prompts and trigger new image/video generation based on the altered prompt.

#### 4.17. Optional Video Storyboard Extension
**Requirement**: Provide an optional video storyboard extension.

**Technical Solution**:
1.  **Integration**: Explore third-party tools or develop an in-house solution for creating video storyboards.

## 5. Monetization (Creem)

**Creem** will manage all aspects of monetization, including checkout, customer portal, proration, tax, dunning, and usage metering. The pricing plans are structured as follows:

| Plan   | Price | Monthly Quota                                |
|--------|-------|----------------------------------------------|
| Free   | $0    | 20 extractions, 10 previews, 2 HD renders    |
| Pro    | $15   | ∞ extractions, 300 previews, 50 HD renders   |
| Team   | $49+  | pooled credits, shared libraries, brand packs |
| PAYG   | $5    | 100 HD renders (wallet top-up)               |

Creem webhooks will integrate with the `subscriptions` and `credit_ledger` tables in Neon Postgres to manage user subscriptions and credit balances.

## 6. Technical Infrastructure

The platform's technical infrastructure is built upon a modern, scalable, and robust stack:

| Component    | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | Next.js + Tailwind + BestAuth React SDK         |
| API          | FastAPI (Python) – JWT middleware for BestAuth  |
| DB           | Neon Postgres (extensions: uuid-ossp, pg_trgm, btree_gist) |
| Storage      | AWS S3 + CloudFront (presigned POST/GET)        |
| Queue        | Redis (Upstash) + BullMQ                        |
| AI APIs      | Replicate, Fal.ai, Stability, OpenAI            |
| Payments     | Creem webhooks → Neon `subscriptions`, `credit_ledger` |
| Monitoring   | PostHog, Sentry, Neon Insights                  |
| IaC          | Terraform (Neon, S3, CloudFront, IAM, Vercel)   |

## 7. Core Database Tables (Neon Postgres)

The core database schema in Neon Postgres will include the following tables:

| Table Name      | Description                                                                                               |
|-----------------|-----------------------------------------------------------------------------------------------------------|
| `users`         | Stores user information (id UUID PK, bestauth_id TEXT, email, ...).                                       |
| `prompts`       | Stores generated prompts (id UUID PK, user_id FK, prompt_text, negative_prompt, model_style, s3_key_original, s3_key_render, credits_spent, created_at). |
| `credit_ledger` | Tracks user credit transactions (id UUID PK, user_id FK, amount INT, reason TEXT, created_at).            |
| `subscriptions` | Manages user subscriptions (id UUID PK, user_id FK, creem_subscription_id, status, price_id, current_period_end). |
| `teams`         | Stores team-specific data (id UUID PK, bestauth_org_id TEXT, name, pooled_credits, ...).                  |

## 8. References
[1] ByteDance Unveils DouBao 1.6 and Seedance 1.0 with ... (2025, June 11). Retrieved from [https://www.aibase.com/news/www.aibase.com/news/18831](https://www.aibase.com/news/www.aibase.com/news/18831)
[2] AI Native Foundation. (n.d.). Retrieved from [https://x.com/AINativeF/status/1933510090163720410](https://x.com/AINativeF/status/1933510090163720410)
[3] ByteDance's AI Legacy and Strategy: Doubao, Volcano ... (n.d.). Retrieved from [https://aiproem.substack.com/p/bytedances-ai-legacy-and-strategy](https://aiproem.substack.com/p/bytedances-ai-legacy-and-strategy)
[4] Choose a model - (AI UI Automation, AI Testing, Computer ... (n.d.). Retrieved from [https://midscenejs.com/choose-a-model](https://midscenejs.com/choose-a-model)
[5] Doubao Seed 1.6 Thinking · AI Models. (n.d.). Retrieved from [https://chat.evanth.io/discover/model/doubao-seed-1.6-thinking](https://chat.evanth.io/discover/model/doubao-seed-1.6-thinking)
[6] Coze: Next-Gen AI App Developing Platform. (n.d.). Retrieved from [https://www.coze.com/](https://www.coze.com/)
[7] Workflow overview - Document - Coze. (n.d.). Retrieved from [https://www.coze.com/open/docs/guides/workflow](https://www.coze.com/open/docs/guides/workflow)
[8] Use workflows - Document - Coze. (n.d.). Retrieved from [https://www.coze.com/open/docs/guides/agent_workflow](https://www.coze.com/open/docs/guides/agent_workflow)
[9] Confused by Coze Agents? The 3-Step Guide That Finally ... (n.d.). Retrieved from [https://medium.com/cloud-believers/confused-by-coze-agents-the-3-step-guide-that-finally-made-workflow-building-click-for-me-1f1097d0768c](https://medium.com/cloud-believers/confused-by-coze-agents-the-3-step-guide-that-finally-made-workflow-building-click-for-me-1f1097d0768c)
[10] Optimizing translation for low-resource languages: Efficient fine-tuning with custom prompt engineering in large language models. (2025). Retrieved from [https://www.sciencedirect.com/science/article/pii/S2666827025000325](https://www.sciencedirect.com/science/article/pii/S2666827025000325)
[11] Prompt overview - Document - Coze. (n.d.). Retrieved from [https://www.coze.com/open/docs/guides/prompt](https://www.coze.com/open/docs/guides/prompt)
[12] Sora: Creating video from text. (2025, February 15). Retrieved from [https://openai.com/index/sora/](https://openai.com/index/sora/)
[13] Sora Prompt Generator​ [Free & AI Powered]. (n.d.). Retrieved from [https://www.feedough.com/sora-prompt-generator/](https://www.feedough.com/sora-prompt-generator/)
[14] Sora 2 is here. (2025, September 30). Retrieved from [https://openai.com/index/sora-2/](https://openai.com/index/sora-2/)
[15] Generating videos on Sora. (n.d.). Retrieved from [https://help.openai.com/en/articles/9957612-generating-videos-on-sora](https://help.openai.com/en/articles/9957612-generating-videos-on-sora)
[16] Bring your best ideas to life with Canva's AI video generator. (n.d.). Retrieved from [https://www.canva.com/features/ai-video-generator/](https://www.canva.com/features/ai-video-generator/)
[17] Veo on Vertex AI video generation prompt guide. (n.d.). Retrieved from [https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide](https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide)

