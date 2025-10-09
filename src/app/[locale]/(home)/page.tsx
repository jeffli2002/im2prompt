import { Hero } from '@/components/blocks/hero/hero';
import { AIToolsIntro } from '@/components/blocks/ai-tools-showcase/ai-tools-showcase';
import { HowItWorks } from '@/components/blocks/how-it-works/how-it-works';
import { PromptShowcase } from '@/components/blocks/prompt-showcase/prompt-showcase';
import { WhyChoose } from '@/components/blocks/why-choose/why-choose';
import { Pricing } from '@/components/blocks/pricing/pricing';
import { Faq } from '@/components/blocks/faq/faq';
import { FinalCTA } from '@/components/blocks/cta/final-cta';
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
