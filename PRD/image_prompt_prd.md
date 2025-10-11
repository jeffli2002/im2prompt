# 📄 Product Requirements Document (PRD)

## Product: **Image ⇄ Prompt AI Platform**

### Vision
Build an **end-to-end AI creative assistant** that extracts prompts from images, enhances and translates them, and regenerates new visuals directly within the same platform. This closes the loop: **Image → Prompt → Image**.

---

## 1. Goals & Objectives
- Help creators, marketers, and AI artists **reverse-engineer prompts** from images.
- Enable **prompt refinement, translation, and enhancement**.
- Provide **one-click image regeneration** using top AI models.
- Build a **scalable SaaS business** with free → pro → team monetization tiers.

---

## 2. Target Users
- **AI Artists & Designers** (Midjourney, Stable Diffusion users).
- **Marketers / Agencies** (ad creatives, campaigns).
- **Content Creators** (YouTube, TikTok, social media thumbnails).
- **Developers & Startups** (wanting to integrate prompt → image flows).

---

## 3. Core MVP Features

### Phase 1 (Month 1–2) – **MVP v1.0**
✅ **Image → Prompt Extraction**
- Upload or paste image URL (PNG/JPG/WEBP ≤ 4MB).
- Extract descriptive prompt in natural language.
- Option: Choose output style → General / Midjourney / Stable Diffusion / Flux.

✅ **Prompt Variants + Negative Prompt**
- AI generates 3 variations of extracted prompt.
- Negative prompt suggestion (undesired elements).

✅ **Basic Prompt → Image (Preview Generation)**
- Use **Stable Diffusion mini (128px/256px)** for quick low-cost previews.
- Allow user to test extracted prompt without leaving platform.

✅ **Prompt Library & History**
- Save extracted prompts.
- Search & tag prompts.

---

### Phase 2 (Month 3–4) – **MVP v1.5**
🔹 **Batch Upload + Extraction**
- Upload up to 10 images, auto-generate prompts.

🔹 **AI Prompt Editor**
- Natural language editing of prompts ("make it cyberpunk style").

🔹 **Personalized Style Packs**
- User saves style (e.g., “Anime Neon Tokyo”) and applies to new prompts.

🔹 **Prompt Compare Tool**
- Side-by-side comparison of 2+ prompts and results.

🔹 **Full Prompt → Image Generation**
- Support multiple models: SDXL, DALL·E, Flux, Midjourney.
- Options: resolution, aspect ratio.
- Credit-based usage: free previews, Pro unlocks HD renders.

---

### Phase 3 (Month 5–6) – **Growth**
🌍 **Public Gallery**
- Users showcase prompt + image pairs.
- Community voting & sharing.

👥 **Team Collaboration**
- Shared prompt libraries & brand style packs.
- Export for client decks.

🎨 **Prompt Remix → Image Flow**
- AI auto-creates remixed versions of prompt and regenerates.

📹 **Video Prompt Extension (Optional)**
- Extract prompts from images → convert to video storyboard prompts.

---

## 4. Monetization Strategy

**Free Plan**  
- 20 image → prompt extractions/month.  
- 10 preview generations (low-res).  
- 2 HD renders.  

**Pro ($15/mo)**  
- Unlimited extractions.  
- 300 preview generations.  
- 50 HD renders.  
- Custom style packs.  

**Team ($49+/mo)**  
- Pooled credits for team members.  
- Shared libraries.  
- Brand packs.  

**Pay-as-you-go credits**  
- 100 HD renders = $5.  

---

## 5. Technical Infrastructure

### Frontend
- **Next.js + TailwindCSS** for UI/UX.
- **Drag & drop uploader** + image preview.
- **Prompt editor & preview renderer**.

### Backend
- **Node.js / Python (FastAPI)** microservices.
- Image upload → process → return prompt.
- Prompt → image generation via API calls.
- Job queue system (Redis / BullMQ) for handling renders.

### AI & API Integrations
- **Image → Prompt:** CLIP Interrogator, BLIP-2, LLaVA, custom fine-tuned model.
- **Prompt → Image:** Stability.ai (SDXL), OpenAI (DALL·E), Replicate/Fal.ai (Flux, others).
- **Midjourney:** Discord bot wrapper (optional).

### Storage
- **Supabase Storage or AWS S3** for user images + results.
- **Postgres (Supabase)** for prompt history, credits.

### Authentication & Billing
- **Auth:** Supabase Auth (email + OAuth: Google, GitHub).
- **Payments:** Stripe for subscriptions + credits.

### Monitoring & Analytics
- Track API usage, cost per render, user engagement.
- Log prompts for fine-tuning (with opt-in).

---

## 6. Success Metrics
- **M1:** 1,000 active users, <$200 infra cost.
- **M3:** 10,000 users, $5k MRR from Pro plan.
- **M6:** 50,000 users, $25k+ MRR, community gallery live.

---

## 7. Risks & Mitigations
- **High API costs:** Start with low-res previews, upsell HD credits.
- **Competition:** Differentiate with prompt editing, translation, and closed-loop workflow.
- **Legal/IP issues:** Add disclaimer + safe usage policy.

---

## 8. Roadmap Snapshot
- **Month 1–2:** Core extraction + preview gen.
- **Month 3–4:** Batch, editor, style packs, full HD render.
- **Month 5–6:** Gallery, team, remix flow, optional video.

---

## ✅ Conclusion
This PRD defines a **competitive MVP blueprint**: an **end-to-end Image ⇄ Prompt platform**. By combining **reverse-engineering + generation + collaboration**, it captures both **individual creators** and **teams**, while keeping infra costs under control and building scalable monetization through credits + subscriptions.
