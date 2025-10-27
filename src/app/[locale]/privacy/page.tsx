import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Baby,
  Clock,
  Cookie,
  CreditCard,
  Database,
  Eye,
  FileText,
  Globe,
  Image,
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  Server,
  Share2,
  Shield,
  UserCheck,
  Zap,
} from 'lucide-react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Privacy Policy | im2Prompt - AI Image & Video Generation',
    description:
      'Learn how im2Prompt protects your privacy and handles your data. Comprehensive privacy policy covering data collection, usage, security, and your rights.',
    openGraph: {
      title: 'Privacy Policy | im2Prompt',
      description: 'Learn how we protect your privacy and handle your data',
      type: 'website',
    },
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PrivacyPageContent />;
}

function PrivacyPageContent() {
  const effectiveDate = 'October 1, 2025';
  const lastUpdated = 'October 1, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Enhanced header with better contrast */}
      <div className="sticky top-0 z-10 border-gray-200 border-b bg-white/95 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/95">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Back to Home
              </Button>
            </Link>
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-700 text-xs dark:bg-gray-800 dark:text-gray-300"
            >
              Privacy Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg dark:from-blue-600 dark:to-blue-700">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 font-bold text-4xl text-gray-900 md:text-5xl dark:text-gray-100">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <Lock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <p className="text-lg">Last Updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="mb-12 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/30">
          <h2 className="mb-4 font-semibold text-2xl text-gray-900 dark:text-gray-100">
            Our Privacy Commitment
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed dark:text-gray-300">
            At im2Prompt, we take your privacy seriously. This policy explains how we collect, use,
            protect, and share your information in compliance with global privacy regulations
            including GDPR, CCPA, and other applicable laws. Your data security is our top priority.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-12 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <a
              href="#data-collection"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Data Collection
            </a>
            <a
              href="#data-usage"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              How We Use Data
            </a>
            <a
              href="#data-sharing"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Data Sharing
            </a>
            <a
              href="#data-security"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Security Measures
            </a>
            <a
              href="#your-rights"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Your Rights
            </a>
            <a
              href="#cookies"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Cookies
            </a>
            <a
              href="#retention"
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Data Retention
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
          {/* Data Collection */}
          <section
            id="data-collection"
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Information We Collect
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-3 font-semibold text-gray-900 text-lg dark:text-gray-100">
                  Personal Information
                </h3>
                <p className="mb-3 text-gray-600 text-sm dark:text-gray-400">
                  Information you provide directly:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500 dark:text-blue-400">•</span>
                    <span>Email address (for account creation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500 dark:text-blue-400">•</span>
                    <span>Name (optional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500 dark:text-blue-400">•</span>
                    <span>Authentication details (via Auth0)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500 dark:text-blue-400">•</span>
                    <span>Payment information (processed securely via Creem)</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-3 font-semibold text-gray-900 text-lg dark:text-gray-100">
                  Usage Information
                </h3>
                <p className="mb-3 text-gray-600 text-sm dark:text-gray-400">
                  Information collected automatically:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-indigo-500 dark:text-indigo-400">•</span>
                    <span>Uploaded images and text inputs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-indigo-500 dark:text-indigo-400">•</span>
                    <span>Generated prompts and AI outputs (images/videos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-indigo-500 dark:text-indigo-400">•</span>
                    <span>Platform preferences and settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-indigo-500 dark:text-indigo-400">•</span>
                    <span>Device, browser, and IP address information</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
              <p className="text-blue-800 text-sm dark:text-blue-300">
                <strong>Note:</strong> We use privacy-preserving analytics (PostHog) that do not
                track individual users across websites. Your uploaded content is stored securely in
                Cloudinary and Cloudflare R2.
              </p>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section
            id="data-usage"
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-6 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              How We Use Your Information
            </h2>

            <div className="space-y-4">
              <div className="border-blue-500 border-l-4 pl-6 dark:border-blue-600">
                <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
                  Service Delivery
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm dark:text-gray-300">
                  <li>• Provide AI-powered prompt generation from images and text</li>
                  <li>
                    • Generate images and videos using Sora 2, Nano Banana, Flux, and Stable
                    Diffusion
                  </li>
                  <li>• Process face detection and image analysis</li>
                  <li>• Manage your account, credits, and subscriptions</li>
                </ul>
              </div>

              <div className="border-indigo-500 border-l-4 pl-6 dark:border-indigo-600">
                <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
                  Improvement & Personalization
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm dark:text-gray-300">
                  <li>• Improve our AI models and generation quality</li>
                  <li>• Personalize your experience based on preferences</li>
                  <li>• Develop new features and services</li>
                  <li>• Monitor platform performance and reliability</li>
                </ul>
              </div>

              <div className="border-purple-500 border-l-4 pl-6 dark:border-purple-600">
                <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
                  Communication
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm dark:text-gray-300">
                  <li>• Send service-related notifications and updates</li>
                  <li>• Respond to your inquiries and support requests</li>
                  <li>• Send marketing communications (with your consent)</li>
                  <li>• Notify you about credit usage and subscription changes</li>
                </ul>
              </div>

              <div className="border-amber-500 border-l-4 pl-6 dark:border-amber-600">
                <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-gray-100">
                  Legal & Security
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm dark:text-gray-300">
                  <li>• Comply with legal obligations and regulations</li>
                  <li>• Protect against fraud, abuse, and security threats</li>
                  <li>• Enforce our terms of service and usage policies</li>
                  <li>• Prevent misuse of AI-generated content</li>
                  <li>
                    • Monitor and remove prohibited content (adult, violence, hate speech, copyright
                    violations)
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                <span className="text-red-600 dark:text-red-400">⚠️</span> Content Moderation
              </h3>
              <p className="text-gray-700 text-sm dark:text-gray-300">
                We reserve the right to review, monitor, and remove content that violates our
                content policies. This includes content containing adult/sexual material, violence,
                hate speech, racism, copyright infringement, or other prohibited material. Content
                moderation is performed to ensure a safe, user-friendly platform for all users.
              </p>
            </div>
          </section>

          {/* Data Sharing */}
          <section
            id="data-sharing"
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-6 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              Information Sharing & Disclosure
            </h2>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30">
              <p className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                We DO NOT sell, trade, or rent your personal information to third parties.
              </p>
            </div>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We may share your information only in these circumstances:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                    AI Service Providers
                  </h4>
                  <p className="text-gray-600 text-sm dark:text-gray-400">
                    We share necessary data with AI providers (OpenAI Sora 2, Stable Diffusion,
                    Flux, Nano Banana via KIE.AI, Google Vision API) to process your prompts and
                    generate outputs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                    Payment Processors
                  </h4>
                  <p className="text-gray-600 text-sm dark:text-gray-400">
                    Creem payment service processes billing (we do not store credit card numbers)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                    Infrastructure & Analytics
                  </h4>
                  <p className="text-gray-600 text-sm dark:text-gray-400">
                    Trusted partners including Cloudinary, Cloudflare R2, Neon Postgres, PostHog,
                    and Sentry (under strict confidentiality)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                    Legal Requirements
                  </h4>
                  <p className="text-gray-600 text-sm dark:text-gray-400">
                    When required by law or to protect rights and safety
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section
            id="data-security"
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Data Security Measures
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-gray-900 text-lg dark:text-gray-100">
                  Technical Safeguards
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm dark:text-gray-300">
                  <li>✓ 256-bit SSL encryption for all data transfers</li>
                  <li>✓ Encrypted data in Cloudflare R2 and Neon Postgres</li>
                  <li>✓ Secure authentication via Auth0</li>
                  <li>✓ Regular security audits and monitoring (Sentry)</li>
                  <li>✓ Secure cloud infrastructure with redundancy</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900 text-lg dark:text-gray-100">
                  Operational Security
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm dark:text-gray-300">
                  <li>✓ Limited access on need-to-know basis</li>
                  <li>✓ Environment variable protection for API keys</li>
                  <li>✓ Regular backups and disaster recovery</li>
                  <li>✓ Incident response procedures</li>
                  <li>✓ Continuous security monitoring</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-amber-800 text-sm dark:text-amber-300">
                While we implement robust security measures, no system is 100% secure. We encourage
                users to use strong passwords and safeguard their account credentials.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section
            id="your-rights"
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Your Privacy Rights
            </h2>

            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Depending on your location (GDPR, CCPA, etc.), you may have the following rights
              regarding your personal data:
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                  Access & Portability
                </h4>
                <p className="text-gray-700 text-sm dark:text-gray-300">
                  Request a copy of your personal data in a portable format
                </p>
              </div>

              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Correction</h4>
                <p className="text-gray-700 text-sm dark:text-gray-300">
                  Update or correct inaccurate information
                </p>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Deletion</h4>
                <p className="text-gray-700 text-sm dark:text-gray-300">
                  Request deletion of your account and associated data
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Opt-out</h4>
                <p className="text-gray-700 text-sm dark:text-gray-300">
                  Unsubscribe from marketing communications
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-gray-700 text-sm dark:text-gray-300">
                <strong>To exercise these rights:</strong> Contact us at{' '}
                <a
                  href="mailto:support@im2prompt.com"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  support@im2prompt.com
                </a>{' '}
                or use the options in your account settings.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section
            id="cookies"
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <Cookie className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              Cookies & Tracking Technologies
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We use cookies and similar technologies to enhance your experience, maintain your
              session, and analyze platform performance. You can control cookie settings in your
              browser.
            </p>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-gray-700 text-sm dark:text-gray-300">
                <strong>Analytics:</strong> We use PostHog for privacy-preserving analytics to
                improve our service without tracking individual users across websites.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section
            id="retention"
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Data Retention
            </h2>

            <div className="space-y-4">
              <div className="border-blue-500 border-l-4 pl-6 dark:border-blue-600">
                <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                  Active Accounts
                </h3>
                <p className="text-gray-700 text-sm dark:text-gray-300">
                  We retain your data as long as your account is active or as needed to provide
                  services
                </p>
              </div>

              <div className="border-purple-500 border-l-4 pl-6 dark:border-purple-600">
                <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                  Generated Content
                </h3>
                <p className="text-gray-700 text-sm dark:text-gray-300">
                  Uploaded images, generated prompts, and AI outputs are stored securely in
                  Cloudinary and Cloudflare R2. We store your content according to your subscription
                  plan.
                </p>
              </div>

              <div className="border-amber-500 border-l-4 pl-6 dark:border-amber-600">
                <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                  After Account Deletion
                </h3>
                <p className="text-gray-700 text-sm dark:text-gray-300">
                  Personal data is deleted within 30 days, except where retention is required by law
                </p>
              </div>
            </div>
          </section>

          {/* International Transfers */}
          <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              International Data Transfers
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place to protect your data in accordance with
              this policy.
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
              <p className="text-blue-800 text-sm dark:text-blue-300">
                We use standard contractual clauses and other approved mechanisms for international
                data transfers. Our services use cloud infrastructure providers (Cloudinary,
                Cloudflare R2, Neon) with global compliance certifications.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <Baby className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              Children's Privacy
            </h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-gray-700 dark:text-gray-300">
                Our Service is not intended for children under 13 years of age (or the minimum age
                of digital consent in your region). We do not knowingly collect personal information
                from children under 13. If you are a parent or guardian and believe we have
                collected information from your child, please contact us immediately at
                support@im2prompt.com.
              </p>
            </div>
          </section>

          {/* Updates to Policy */}
          <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Changes to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time to reflect changes in our
              practices or for legal, operational, or regulatory reasons. We will notify you of any
              material changes via email or through the Service. Continued use of the Service after
              changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section
            id="contact"
            className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-sm dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/30"
          >
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Contact Us About Privacy
            </h2>

            <div className="rounded-lg border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
                Privacy & Support
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-gray-600 text-sm dark:text-gray-400">Email</p>
                    <a
                      href="mailto:support@im2prompt.com"
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      support@im2prompt.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-gray-600 text-sm dark:text-gray-400">Privacy Requests</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      For data access, correction, or deletion requests, please email us with
                      "Privacy Request" in the subject line.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-blue-100 p-4 dark:bg-blue-900/40">
              <p className="text-center text-blue-800 text-sm dark:text-blue-300">
                We are committed to protecting your privacy and will respond to inquiries within 48
                hours.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                Your Privacy Matters
              </h3>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We are committed to protecting your privacy and ensuring your data is secure.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/">
                <Button
                  variant="outline"
                  className="gap-2 border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Back to Home
                </Button>
              </Link>
              <Link href="/terms">
                <Button
                  variant="default"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-gray-600 text-sm dark:text-gray-400">
              Effective Date: {effectiveDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
