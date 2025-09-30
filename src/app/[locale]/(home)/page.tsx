import { Hero } from '@/components/blocks/hero/hero';
import { WorkflowDemo } from '@/components/blocks/workflow/workflow-demo';
import { Features } from '@/components/blocks/features/features';
import { TrustedBy } from '@/components/blocks/social-proof/trusted-by';
import { Testimonials } from '@/components/blocks/social-proof/testimonials';
import { Pricing } from '@/components/blocks/pricing/pricing';
import { UseCases } from '@/components/blocks/use-cases/use-cases';
import { Faq } from '@/components/blocks/faq/faq';
import { CallToAction } from '@/components/blocks/cta/call-to-action';
import React from 'react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <WorkflowDemo />
      <Features />
      <UseCases />
      <Testimonials />
      <Pricing />
      <Faq />
      <CallToAction />
    </>
  );
}
