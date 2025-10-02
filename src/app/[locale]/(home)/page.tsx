import { Hero } from '@/components/blocks/hero/hero';
import { HowItWorks } from '@/components/blocks/how-it-works/how-it-works';
import { WhyChoose } from '@/components/blocks/why-choose/why-choose';
import { WhoIsItFor } from '@/components/blocks/who-is-it-for/who-is-it-for';
import { Features } from '@/components/blocks/features/features';
import { Pricing } from '@/components/blocks/pricing/pricing';
import { UseCases } from '@/components/blocks/use-cases/use-cases';
import { Faq } from '@/components/blocks/faq/faq';
import { FinalCTA } from '@/components/blocks/cta/final-cta';
import React from 'react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WhyChoose />
      <WhoIsItFor />
      <Features />
      <UseCases />
      <Pricing />
      <Faq />
      <FinalCTA />
    </>
  );
}
