&lt;!-- image_prompt_prd_neon_bestauth_creem.md --&gt;
# 📄 Product Requirements Document (PRD)
## Image ⇄ Prompt AI Platform – **REVISED 2025-09-29**
*Neon + BestAuth + Creem Edition*

---

## 0. Stack Change Summary
| Layer        | Old (Supabase) | New |
|--------------|----------------|-----|
| **Database** | Supabase Postgres | Neon Postgres (serverless, branching) |
| **Auth**     | Supabase Auth | BestAuth (JWT, OAuth, SAML, MFA) |
| **Storage**  | Supabase Storage | AWS S3 + CloudFront (presigned URLs) |
| **Payments** | Stripe | Creem (usage-based billing & subscriptions) |

---

## 1. Vision & Goals
Build an **end-to-end AI creative assistant** that extracts prompts from images, refines & translates them, and regenerates new visuals in one closed loop: **Image → Prompt → Image/Video**.

---

## 2. Target Users
- AI Artists & Designers (Midjourney, Stable Diffusion, Flux， Veo3, Sora2, so called 5 AI variations 
- Marketers / Agencies (ad creatives, campaigns)  
- Content Creators (thumbnails, social posts)  
- Developers & Start-ups (embeddable prompt→image flows)

---

## 3. MVP Feature Roadmap

### Phase 1 – Month 1-2 (MVP v1.0)
| Feature | Description |
|---------|-------------|
| **Image → Prompt** | Upload / URL ≤4 MB → extract prompt in General / MJ / SD / Flux style |
| **Image/Video Prompt Variants** | 5 AI variations + auto negative prompt, highlight Sora2|
| **Prompt Library** | Save, search, tag (Postgres GIN index) |
| ** AI prompt editor (natural-language refinement)  |
| **Auth** | BestAuth: email, magic-link, Google, GitHub, MFA |
| **Storage** | AWS S3 buckets `uip-user-uploads` & `uip-renders` + CloudFront |
| **Credits** | Neon `credit_ledger` table; Creem metered usage |


Image to Prompt technical solution:
使用一个通用的多模态大模型(豆包 Doubao-Seed-1.6-vision)先对图片进行理解，生成一段自然的语言描述。
再用另一个大模型，结合我们提供的提示词模板和语法规则(通过知识库)，将这段自然语言描述“翻译”成适用于Midjourney,Stable Diffusion等不同模型的专业提示词。后端API我们可以直接用“扣子(Coze)"的工作流来实现.

Video (Veo3, Sora2) prompt variant:
Needs to provide best techincal soltuion. Especially highlight Sora2.

### Phase 2 – Month 3-4 (MVP v1.5)
- Batch upload (10 images)  
- Personal style packs (JSON stored in Neon)  
- Prompt compare tool (side-by-side)  
| **Image Preview Generation** | Stable Diffusion 256 px via Fal.ai (credit tracked in Neon) |
- Full HD render (SDXL, DALL·E, Flux) via Replicate / Fal.ai  
- Neon branching for CI (PR → preview DB)  

### Phase 3 – Month 5-6 (Growth)
- Public gallery & community voting  
- Team workspaces (BestAuth orgs → Neon `teams`)  
- Prompt remix → auto-regeneration  
- Optional video storyboard extension

---

## 4. Monetization (Creem)
| Plan | Price | Monthly Quota |
|------|-------|---------------|
| Free | $0 | 20 extractions, 10 previews, 2 HD renders |
| Pro | $15 | ∞ extractions, 300 previews, 50 HD renders |
| Team | $49+ | pooled credits, shared libraries, brand packs |
| PAYG | $5 | 100 HD renders (wallet top-up) |

Creem handles checkout, customer portal, proration, tax, dunning, and usage metering.

---

## 5. Technical Infrastructure
| Component | Technology |
|-----------|------------|
| Frontend | Next.js + Tailwind + BestAuth React SDK |
| API | FastAPI (Python) – JWT middleware for BestAuth |
| DB | Neon Postgres (extensions: uuid-ossp, pg_trgm, btree_gist) |
| Storage | AWS S3 + CloudFront (presigned POST/GET) |
| Queue | Redis (Upstash) + BullMQ |
| AI APIs | Replicate, Fal.ai, Stability, OpenAI |
| Payments | Creem webhooks → Neon `subscriptions`, `credit_ledger` |
| Monitoring | PostHog, Sentry, Neon Insights |
| IaC | Terraform (Neon, S3, CloudFront, IAM, Vercel) |

---

## 6. Core Tables (Neon)
```sql
users               (id UUID PK, bestauth_id TEXT, email, ...)
prompts             (id UUID PK, user_id FK, prompt_text, negative_prompt, model_style, s3_key_original, s3_key_render, credits_spent, created_at)
credit_ledger       (id UUID PK, user_id FK, amount INT, reason TEXT, created_at)
subscriptions       (id UUID PK, user_id FK, creem_subscription_id, status, price_id, current_period_end)
teams               (id UUID PK, bestauth_org_id TEXT, name, pooled_credits, ...)