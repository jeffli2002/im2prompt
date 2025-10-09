import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { setRequestLocale } from 'next-intl/server';
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  Users, 
  AlertTriangle, 
  RefreshCw, 
  Mail, 
  Scale, 
  CreditCard, 
  Server, 
  Ban, 
  AlertCircle, 
  FileWarning,
  CheckCircle2,
  Globe,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Terms of Service - im2Prompt',
  description: 'Terms of service for im2Prompt AI platform. Read our terms and conditions for using our AI-powered prompt generation and image/video creation services.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'user agreement',
    'legal terms',
    'service agreement',
    'usage terms',
    'sora 2 terms',
    'ai service terms'
  ],
};

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TermsPageContent />
  );
}

function TermsPageContent() {
  const effectiveDate = '2025-01-01';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-lg border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-foreground hover:bg-muted/50">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
              Legal Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-lg">Effective Date: {effectiveDate}</p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 mb-12 border border-blue-100 dark:border-blue-900">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="#accounts" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">User Accounts</a>
            <a href="#subscription" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Subscription & Payment</a>
            <a href="#content" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Content & Licensing</a>
            <a href="#acceptable-use" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Acceptable Use</a>
            <a href="#privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Privacy</a>
            <a href="#liability" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Liability</a>
            <a href="#termination" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Termination</a>
            <a href="#contact" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Contact Us</a>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Agreement to Terms */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using im2Prompt ("Service", "Platform", or "We"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have permission to access our Service.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> These Terms constitute a legally binding agreement between you and im2Prompt. Please read them carefully.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Service Description */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Our Service</h2>
            <p className="text-muted-foreground mb-6">
              im2Prompt is an AI-powered platform that enables users to:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground mb-2">Core Features</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Image to Prompt generation</li>
                  <li>• Text to Prompt conversion</li>
                  <li>• Text to Image (Flux, Stable Diffusion)</li>
                  <li>• Text to Video (Sora 2)</li>
                  <li>• Image to Video (Sora 2)</li>
                </ul>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground mb-2">AI Models</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• OpenAI Sora 2</li>
                  <li>• Google Veo3</li>
                  <li>• Stable Diffusion</li>
                  <li>• Flux</li>
                  <li>• Nano Banana (via KIE.AI)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: User Accounts - Following CoverImage format */}
          <section id="accounts" className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              3. User Accounts
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-3">3.1 Account Registration</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>You must provide accurate and complete information during registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>You must be at least 18 years old (or age of majority in your jurisdiction)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>One person or legal entity may maintain only one free account</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-3">3.2 Account Security</h3>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <p className="text-muted-foreground">
                    You are responsible for:
                  </p>
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
          <section id="subscription" className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              4. Subscription Plans & Payment
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-4">4.1 Available Plans</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="text-lg font-medium text-foreground mb-2">Free Plan</h4>
                    <p className="text-sm font-medium text-foreground mb-2">$0/forever</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ 3 images + 1 video per day</li>
                      <li>✓ Basic AI models</li>
                      <li>✓ Email support</li>
                      <li>✓ Personal use only</li>
                    </ul>
                  </div>
                  <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-foreground mb-2">Pro Plan</h4>
                    <p className="text-sm font-medium text-foreground mb-2">$16.99/month</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ 100 images + 30 videos/month</li>
                      <li>✓ All AI models</li>
                      <li>✓ Priority support</li>
                      <li>✓ Commercial usage rights</li>
                    </ul>
                  </div>
                  <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-foreground mb-2">Pro+ Plan</h4>
                    <p className="text-sm font-medium text-foreground mb-2">$29.99/month</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✓ 200 images + 60 videos/month</li>
                      <li>✓ Full commercial license</li>
                      <li>✓ Dedicated support</li>
                      <li>✓ API access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-3">4.2 Billing & Payment Terms</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-muted-foreground">• <strong>Billing Cycles:</strong> Subscriptions are billed monthly in advance</p>
                  <p className="text-muted-foreground">• <strong>Payment Methods:</strong> We accept credit cards via Creem payment service</p>
                  <p className="text-muted-foreground">• <strong>Currency:</strong> Prices displayed in USD</p>
                  <p className="text-muted-foreground">• <strong>Failed Payments:</strong> Service may be suspended if payment fails</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-3">4.3 Cancellation Policy</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-muted-foreground">• <strong>Cancel Anytime:</strong> You can cancel your subscription at any time</p>
                  <p className="text-muted-foreground">• <strong>Access Until End of Period:</strong> You'll retain access until the end of your current billing period</p>
                  <p className="text-muted-foreground">• <strong>No Partial Refunds:</strong> We don't offer refunds for partial billing periods</p>
                  <p className="text-muted-foreground">• <strong>See Refund Policy:</strong> For detailed refund information, see our <Link href="/refund" className="text-blue-600 hover:underline">Refund Policy</Link></p>
                </div>
              </div>
            </div>
          </section>

          {/* Content & Licensing - Following CoverImage structure */}
          <section id="content" className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">5. Content Rights & Licensing</h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-3">5.1 Your Content</h3>
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
                    <p className="text-muted-foreground text-sm">
                      <strong>You retain all rights</strong> to content you upload. We only use your content to provide our services to you.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-foreground mb-3">5.2 Generated Content</h3>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <p className="text-muted-foreground text-sm">
                      <strong>You own all generated content</strong>, subject to compliance with applicable laws and these Terms.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-3">5.3 AI Generation Disclaimer</h3>
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>Important:</strong> im2Prompt uses advanced AI models. Please understand:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• <strong>Quality Variance:</strong> Results depend on prompt quality and AI model capabilities</li>
                    <li>• <strong>No Guarantee:</strong> We cannot guarantee every generation meets your expectations</li>
                    <li>• <strong>Network Dependencies:</strong> Service quality affected by connectivity and server availability</li>
                    <li>• <strong>AI Limitations:</strong> AI may produce unexpected or unsuitable results</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section id="acceptable-use" className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">6. Acceptable Use Policy</h2>
            
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-3">Prohibited Uses</h3>
              <p className="text-muted-foreground mb-3">You may NOT use our Service to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>❌ Generate illegal, harmful, or abusive content</li>
                <li>❌ Create misleading or deceptive materials</li>
                <li>❌ Violate third-party intellectual property rights</li>
                <li>❌ Bypass service limitations or security measures</li>
                <li>❌ Use automated systems without permission</li>
              </ul>
            </div>
          </section>

          {/* Liability */}
          <section id="liability" className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">7. Disclaimers & Limitations</h2>
            
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-foreground mb-3">7.1 Service Disclaimer</h3>
                <p className="text-muted-foreground">
                  The Service is provided "AS IS" and "AS AVAILABLE". We do not guarantee uninterrupted, error-free operation or consistent AI generation quality.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-foreground mb-3">7.2 Limitation of Liability</h3>
                <p className="text-muted-foreground mb-3">
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
          <section id="privacy" className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy & Data Protection</h2>
            <p className="text-muted-foreground mb-4">
              Your privacy is important to us. Our use of your personal information is governed by our Privacy Policy.
            </p>
            <Link href="/privacy" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View Privacy Policy
              <span className="text-sm">→</span>
            </Link>
          </section>

          {/* Termination */}
          <section id="termination" className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">By You</h3>
                <p className="text-muted-foreground text-sm">
                  You may terminate your account at any time through account settings.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">By Us</h3>
                <p className="text-muted-foreground text-sm">
                  We may suspend or terminate accounts for violations of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
              <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              10. Governing Law & Disputes
            </h2>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
              <p className="text-muted-foreground mb-3">
                These Terms are governed by applicable laws. Any disputes shall be subject to the jurisdiction of competent courts.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section id="contact" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900 p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">11. Contact Us</h2>
            
            <div className="bg-card rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href="mailto:support@im2prompt.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      support@im2prompt.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            © 2025 im2Prompt. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
