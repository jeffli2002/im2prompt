import { AIToolsIntro } from '@/components/blocks/ai-tools-showcase/ai-tools-showcase';
import { FinalCTA } from '@/components/blocks/cta/final-cta';
import { Faq } from '@/components/blocks/faq/faq';
import { Hero } from '@/components/blocks/hero/hero';
import { HowItWorks } from '@/components/blocks/how-it-works/how-it-works';
import { Pricing } from '@/components/blocks/pricing/pricing';
import { PromptShowcase } from '@/components/blocks/prompt-showcase/prompt-showcase';
import { WhyChoose } from '@/components/blocks/why-choose/why-choose';
import React from 'react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AIToolsIntro />
      <HowItWorks />
      <PromptShowcase />
      <WhyChoose />
      <Pricing />
      <Faq />
      <FinalCTA />
    </>
  );
}
