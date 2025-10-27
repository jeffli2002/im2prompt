import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { paymentConfig } from '@/config';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  CreditCard,
  FileText,
  FileWarning,
  Globe,
  Mail,
  MapPin,
  RefreshCw,
  Scale,
  Server,
  Shield,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Terms of Service - im2Prompt',
  description:
    'Terms of service for im2Prompt AI platform. Read our terms and conditions for using our AI-powered prompt generation and image/video creation services.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'user agreement',
    'legal terms',
    'service agreement',
    'usage terms',
    'sora 2 terms',
    'ai service terms',
  ],
  robots: {
    index: false,
    follow: true,
  },
};

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TermsPageContent />;
}

function TermsPageContent() {
  const effectiveDate = '2025-10-01';
  const plans = paymentConfig.plans;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 border-border/50 border-b bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:bg-muted/50">
                Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
              Legal Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg dark:from-blue-600 dark:to-blue-700">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text font-bold text-4xl text-transparent md:text-5xl">
            Terms of Service
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-lg">Effective Date: {effectiveDate}</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-12 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground text-xl">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <a
              href="#accounts"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              User Accounts
            </a>
            <a
              href="#subscription"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Subscription & Payment
            </a>
            <a
              href="#content"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Content & Licensing
            </a>
            <a
              href="#acceptable-use"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Acceptable Use
            </a>
            <a
              href="#privacy"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Privacy
            </a>
            <a
              href="#liability"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Liability
            </a>
            <a
              href="#termination"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Termination
            </a>
            <a
              href="#contact"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Agreement to Terms */}
          <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">1. Agreement to Terms</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using im2Prompt ("Service", "Platform", or "We"), you agree to be
                bound by these Terms of Service ("Terms"). If you disagree with any part of these
                terms, you do not have permission to access our Service.
              </p>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-amber-800 text-sm dark:text-amber-200">
                    <strong>Important:</strong> These Terms constitute a legally binding agreement
                    between you and im2Prompt. Please read them carefully.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Service Description */}
          <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">2. Our Service</h2>
            <p className="mb-6 text-muted-foreground">
              im2Prompt is an AI-powered platform that enables users to:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 font-medium text-foreground text-lg">Core Features</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Image to Prompt generation</li>
                  <li>• Text to Prompt conversion</li>
                  <li>• Text to Image (Nano Banana, Flux, etc.)</li>
                  <li>• Text to Video (Sora 2)</li>
                  <li>• Image to Video (Sora 2)</li>
                  <li>• Free users: Credit-based generation only</li>
                </ul>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 font-medium text-foreground text-lg">AI Models</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• OpenAI Sora 2</li>
                  <li>• Nano Banana</li>
                  <li>• etc.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: User Accounts - Following CoverImage format */}
          <section id="accounts" className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl text-foreground">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              3. User Accounts
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-medium text-foreground text-xl">
                  3.1 Account Registration
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>
                      You must provide accurate and complete information during registration
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>
                      You must be at least 18 years old (or age of majority in your jurisdiction)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>One person or legal entity may maintain only one free account</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-medium text-foreground text-xl">3.2 Account Security</h3>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                  <p className="text-muted-foreground">You are responsible for:</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground text-sm">
                    <li>• Maintaining the confidentiality of your account credentials</li>
                    <li>• All activities that occur under your account</li>
                    <li>• Notifying us immediately of any unauthorized access</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Subscription & Payment Section - Based on CoverImage comprehensive format */}
          <section
            id="subscription"
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl text-foreground">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              4. Subscription Plans & Payment
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-foreground text-xl">4.1 Available Plans</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {plans.map((plan, index) => {
                    const isFree = plan.id === 'free';
                    const isPro = plan.id === 'pro';
                    const isProPlus = plan.id === 'proplus';
                    const borderColor = isFree
                      ? 'border-border'
                      : isPro
                        ? 'border-blue-200 dark:border-blue-800'
                        : 'border-purple-200 dark:border-purple-800';
                    const bgColor = isFree
                      ? ''
                      : isPro
                        ? 'bg-blue-50 dark:bg-blue-950/30'
                        : 'bg-purple-50 dark:bg-purple-950/30';
                    const priceDisplay = isFree ? '$0/forever' : `$${plan.price}/month`;

                    return (
                      <div
                        key={plan.id}
                        className={`border ${borderColor} ${bgColor} rounded-lg p-4`}
                      >
                        <h4 className="mb-2 font-medium text-foreground text-lg">
                          {plan.name} Plan
                        </h4>
                        <p className="mb-2 font-medium text-foreground text-sm">{priceDisplay}</p>
                        <ul className="space-y-1 text-muted-foreground text-sm">
                          {plan.features.map((feature, idx) => (
                            <li key={idx}>✓ {feature}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-medium text-foreground text-xl">
                  4.2 Billing & Payment Terms
                </h3>
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-muted-foreground">
                    • <strong>Billing Cycles:</strong> Monthly subscriptions are billed monthly in
                    advance; Yearly subscriptions are billed annually in advance
                  </p>
                  <p className="text-muted-foreground">
                    • <strong>Yearly Plans:</strong> Save 20% with annual billing. Pro: $143.04/year
                    ($11.92/mo), Pro+: $239.04/year ($19.92/mo)
                  </p>
                  <p className="text-muted-foreground">
                    • <strong>Yearly Credits:</strong> Annual plans receive 12x monthly credits
                    allocation (Pro: 6,000 credits/year, Pro+: 10,800 credits/year)
                  </p>
                  <p className="text-muted-foreground">
                    • <strong>Payment Methods:</strong> We accept credit cards via Creem payment
                    service
                  </p>
                  <p className="text-muted-foreground">
                    • <strong>Currency:</strong> Prices displayed in USD
                  </p>
                  <p className="text-muted-foreground">
                    • <strong>Failed Payments:</strong> Service may be suspended if payment fails
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-medium text-foreground text-xl">
                  4.3 Cancellation Policy
                </h3>
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-muted-foreground">
                    • <strong>Cancel Anytime:</strong> You can cancel your subscription at any time
                  </p>
                  <p className="text-muted-foreground">
                    • <strong>Access Until End of Period:</strong> You'll retain access until the
                    end of your current billing period
                  </p>
                  <p className="text-muted-foreground">
                    • <strong>No Partial Refunds:</strong> We don't offer refunds for partial
                    billing periods
                  </p>
                  <p className="text-muted-foreground">
                    • <strong>See Refund Policy:</strong> For detailed refund information, see our{' '}
                    <Link href="/refund" className="text-blue-600 hover:underline">
                      Refund Policy
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Content & Licensing - Following CoverImage structure */}
          <section id="content" className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-6 font-semibold text-2xl text-foreground">
              5. Content Rights & Licensing
            </h2>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-medium text-foreground text-xl">5.1 Your Content</h3>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                    <p className="text-muted-foreground text-sm">
                      <strong>You retain all rights</strong> to content you upload. We only use your
                      content to provide our services to you.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-medium text-foreground text-xl">
                    5.2 Generated Content
                  </h3>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                    <p className="text-muted-foreground text-sm">
                      <strong>You own all generated content</strong>, subject to compliance with
                      applicable laws and these Terms.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-medium text-foreground text-xl">
                  5.3 AI Generation Disclaimer
                </h3>
                <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                  <p className="text-muted-foreground">
                    <strong>Important:</strong> im2Prompt uses advanced AI models. Please
                    understand:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>
                      • <strong>Quality Variance:</strong> Results depend on prompt quality and AI
                      model capabilities
                    </li>
                    <li>
                      • <strong>No Guarantee:</strong> We cannot guarantee every generation meets
                      your expectations
                    </li>
                    <li>
                      • <strong>Network Dependencies:</strong> Service quality affected by
                      connectivity and server availability
                    </li>
                    <li>
                      • <strong>AI Limitations:</strong> AI may produce unexpected or unsuitable
                      results
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section
            id="acceptable-use"
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <h2 className="mb-6 font-semibold text-2xl text-foreground">
              6. Acceptable Use Policy
            </h2>

            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
              <h3 className="mb-3 font-semibold text-lg text-red-900 dark:text-red-200">
                Prohibited Content
              </h3>
              <p className="mb-3 text-muted-foreground">
                You may NOT create, upload, or generate content that contains:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  ❌ <strong>Adult/Sexual Content:</strong> Pornography, nudity, or sexually
                  explicit material
                </li>
                <li>
                  ❌ <strong>Violence:</strong> Graphic violence, gore, or content promoting harm to
                  others
                </li>
                <li>
                  ❌ <strong>Hate Speech:</strong> Racism, discrimination, or content targeting
                  protected groups
                </li>
                <li>
                  ❌ <strong>Copyright Infringement:</strong> Unauthorized use of copyrighted
                  images, characters, or trademarks
                </li>
                <li>
                  ❌ <strong>Illegal Activities:</strong> Content promoting illegal activities or
                  substances
                </li>
                <li>
                  ❌ <strong>Harmful Content:</strong> Self-harm, dangerous activities, or abuse
                </li>
                <li>
                  ❌ <strong>Misleading Content:</strong> Deepfakes, misinformation, or deceptive
                  materials
                </li>
              </ul>
            </div>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
              <h3 className="mb-3 font-semibold text-blue-900 text-lg dark:text-blue-200">
                Content Safety Requirements
              </h3>
              <p className="mb-3 text-muted-foreground">All content must be:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  ✓ <strong>Safe for Work (SFW):</strong> Appropriate for general audiences
                </li>
                <li>
                  ✓ <strong>User-Friendly:</strong> Respectful and non-offensive
                </li>
                <li>
                  ✓ <strong>Legal:</strong> Compliant with applicable laws and regulations
                </li>
                <li>
                  ✓ <strong>Original or Licensed:</strong> You must own rights or have permission to
                  use uploaded content
                </li>
                <li>
                  ✓ <strong>Non-Harmful:</strong> Does not promote violence, hate, or dangerous
                  activities
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
              <h3 className="mb-3 font-semibold text-amber-900 text-lg dark:text-amber-200">
                Prohibited Actions
              </h3>
              <p className="mb-3 text-muted-foreground">You may NOT:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>❌ Bypass service limitations or security measures</li>
                <li>❌ Use automated systems without permission</li>
                <li>❌ Attempt to reverse-engineer our AI models</li>
                <li>❌ Share or resell your account access</li>
                <li>❌ Create multiple free accounts to abuse free credits</li>
              </ul>
            </div>

            <div className="mt-6 rounded-lg bg-red-100 p-4 dark:bg-red-900/40">
              <p className="font-medium text-red-900 text-sm dark:text-red-200">
                ⚠️ Violation of this policy may result in immediate account suspension or termination
                without refund. We reserve the right to monitor content and remove materials that
                violate these guidelines.
              </p>
            </div>
          </section>

          {/* Liability */}
          <section
            id="liability"
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <h2 className="mb-6 font-semibold text-2xl text-foreground">
              7. Disclaimers & Limitations
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg bg-muted/50 p-6">
                <h3 className="mb-3 font-medium text-foreground text-lg">7.1 Service Disclaimer</h3>
                <p className="text-muted-foreground">
                  The Service is provided "AS IS" and "AS AVAILABLE". We do not guarantee
                  uninterrupted, error-free operation or consistent AI generation quality.
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-6">
                <h3 className="mb-3 font-medium text-foreground text-lg">
                  7.2 Limitation of Liability
                </h3>
                <p className="mb-3 text-muted-foreground">
                  To the fullest extent permitted by law, im2Prompt shall not be liable for:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Any indirect, incidental, or consequential damages</li>
                  <li>• Lost profits or business opportunities</li>
                  <li>• Damages from AI generation failures</li>
                  <li>• Any damages exceeding fees paid in the past 12 months</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section id="privacy" className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              8. Privacy & Data Protection
            </h2>
            <p className="mb-4 text-muted-foreground">
              Your privacy is important to us. Our use of your personal information is governed by
              our Privacy Policy.
            </p>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Privacy Policy
              <span className="text-sm">→</span>
            </Link>
          </section>

          {/* Termination */}
          <section
            id="termination"
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <h2 className="mb-4 font-semibold text-2xl text-foreground">9. Termination</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium text-foreground text-lg">By You</h3>
                <p className="text-muted-foreground text-sm">
                  You may terminate your account at any time through account settings.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-foreground text-lg">By Us</h3>
                <p className="text-muted-foreground text-sm">
                  We may suspend or terminate accounts for violations of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-4 flex items-center gap-3 font-semibold text-2xl text-foreground">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              10. Governing Law & Disputes
            </h2>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
              <p className="mb-3 text-muted-foreground">
                These Terms are governed by applicable laws. Any disputes shall be subject to the
                jurisdiction of competent courts.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section
            id="contact"
            className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-sm dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/30"
          >
            <h2 className="mb-6 font-semibold text-2xl text-foreground">11. Contact Us</h2>

            <div className="rounded-lg bg-card p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-sm">Email</p>
                    <a
                      href="mailto:support@im2prompt.com"
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      support@im2prompt.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="mb-2 text-muted-foreground text-sm">Address</p>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1 font-medium text-foreground text-sm">English Address</p>
                        <p className="text-muted-foreground text-sm">im2Prompt, Legal Department</p>
                        <p className="text-muted-foreground text-sm">
                          Datun Road, Chaoyang District
                        </p>
                        <p className="text-muted-foreground text-sm">Beijing, China</p>
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-foreground text-sm">Chinese Address</p>
                        <p className="text-muted-foreground text-sm">im2Prompt 法务部门</p>
                        <p className="text-muted-foreground text-sm">中国北京市朝阳区大屯路</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">© 2025 im2Prompt. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
