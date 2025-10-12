import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, Shield, Database, Share2, Lock, Cookie, UserCheck, RefreshCw, Mail, FileText, Server, Baby, Eye, Globe, Clock, MapPin, CreditCard, Image, Zap } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: 'Privacy Policy | im2Prompt - AI Image & Video Generation',
    description: 'Learn how im2Prompt protects your privacy and handles your data. Comprehensive privacy policy covering data collection, usage, security, and your rights.',
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

  return (
    <PrivacyPageContent />
  );
}

function PrivacyPageContent() {
  const effectiveDate = 'October 1, 2025';
  const lastUpdated = 'October 1, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Enhanced header with better contrast */}
      <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              Privacy Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Privacy Policy</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <Lock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <p className="text-lg">Last Updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 mb-12 border border-blue-100 dark:border-blue-900">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Our Privacy Commitment</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            At im2Prompt, we take your privacy seriously. This policy explains how we collect, use, protect, and share your information in compliance with global privacy regulations including GDPR, CCPA, and other applicable laws. Your data security is our top priority.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 mb-12 border border-blue-100 dark:border-blue-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="#data-collection" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Data Collection</a>
            <a href="#data-usage" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">How We Use Data</a>
            <a href="#data-sharing" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Data Sharing</a>
            <a href="#data-security" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Security Measures</a>
            <a href="#your-rights" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Your Rights</a>
            <a href="#cookies" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Cookies</a>
            <a href="#retention" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Data Retention</a>
            <a href="#contact" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm">Contact Us</a>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Data Collection */}
          <section id="data-collection" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Information We Collect
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Personal Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Information you provide directly:</p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>Email address (for account creation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>Name (optional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>Authentication details (via Auth0)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>Payment information (processed securely via Creem)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Usage Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Information collected automatically:</p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400 mt-1">•</span>
                    <span>Uploaded images and text inputs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400 mt-1">•</span>
                    <span>Generated prompts and AI outputs (images/videos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400 mt-1">•</span>
                    <span>Platform preferences and settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400 mt-1">•</span>
                    <span>Device, browser, and IP address information</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> We use privacy-preserving analytics (PostHog) that do not track individual users across websites. Your uploaded content is stored securely in AWS S3 and Cloudinary.
              </p>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section id="data-usage" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6">How We Use Your Information</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 dark:border-blue-600 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Service Delivery</h3>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                  <li>• Provide AI-powered prompt generation from images and text</li>
                  <li>• Generate images and videos using Sora 2, Nano Banana, Flux, and Stable Diffusion</li>
                  <li>• Process face detection and image analysis</li>
                  <li>• Manage your account, credits, and subscriptions</li>
                </ul>
              </div>

              <div className="border-l-4 border-indigo-500 dark:border-indigo-600 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Improvement & Personalization</h3>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                  <li>• Improve our AI models and generation quality</li>
                  <li>• Personalize your experience based on preferences</li>
                  <li>• Develop new features and services</li>
                  <li>• Monitor platform performance and reliability</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 dark:border-purple-600 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Communication</h3>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                  <li>• Send service-related notifications and updates</li>
                  <li>• Respond to your inquiries and support requests</li>
                  <li>• Send marketing communications (with your consent)</li>
                  <li>• Notify you about credit usage and subscription changes</li>
                </ul>
              </div>

              <div className="border-l-4 border-amber-500 dark:border-amber-600 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Legal & Security</h3>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                  <li>• Comply with legal obligations and regulations</li>
                  <li>• Protect against fraud, abuse, and security threats</li>
                  <li>• Enforce our terms of service and usage policies</li>
                  <li>• Prevent misuse of AI-generated content</li>
                  <li>• Monitor and remove prohibited content (adult, violence, hate speech, copyright violations)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <span className="text-red-600 dark:text-red-400">⚠️</span> Content Moderation
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We reserve the right to review, monitor, and remove content that violates our content policies. This includes content containing adult/sexual material, violence, hate speech, racism, copyright infringement, or other prohibited material. Content moderation is performed to ensure a safe, user-friendly platform for all users.
              </p>
            </div>
          </section>

          {/* Data Sharing */}
          <section id="data-sharing" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Information Sharing & Disclosure</h2>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                We DO NOT sell, trade, or rent your personal information to third parties.
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">We may share your information only in these circumstances:</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Service Providers</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">We share necessary data with AI providers (OpenAI Sora 2, Stable Diffusion, Flux, Nano Banana via KIE.AI, Google Vision API) to process your prompts and generate outputs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Processors</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Creem payment service processes billing (we do not store credit card numbers)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Infrastructure & Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Trusted partners including AWS S3, Cloudinary, Neon Postgres, PostHog, and Sentry (under strict confidentiality)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Legal Requirements</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">When required by law or to protect rights and safety</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section id="data-security" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Data Security Measures
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Technical Safeguards</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li>✓ 256-bit SSL encryption for all data transfers</li>
                  <li>✓ Encrypted data in AWS S3 and Neon Postgres</li>
                  <li>✓ Secure authentication via Auth0</li>
                  <li>✓ Regular security audits and monitoring (Sentry)</li>
                  <li>✓ Secure cloud infrastructure with redundancy</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Operational Security</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li>✓ Limited access on need-to-know basis</li>
                  <li>✓ Environment variable protection for API keys</li>
                  <li>✓ Regular backups and disaster recovery</li>
                  <li>✓ Incident response procedures</li>
                  <li>✓ Continuous security monitoring</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                While we implement robust security measures, no system is 100% secure. We encourage users to use strong passwords and safeguard their account credentials.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section id="your-rights" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Your Privacy Rights
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Depending on your location (GDPR, CCPA, etc.), you may have the following rights regarding your personal data:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Access & Portability</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Request a copy of your personal data in a portable format</p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Correction</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Update or correct inaccurate information</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Deletion</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Request deletion of your account and associated data</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Opt-out</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Unsubscribe from marketing communications</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>To exercise these rights:</strong> Contact us at <a href="mailto:support@im2prompt.com" className="text-blue-600 dark:text-blue-400 hover:underline">support@im2prompt.com</a> or use the options in your account settings.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section id="cookies" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              <Cookie className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              Cookies & Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies and similar technologies to enhance your experience, maintain your session, and analyze platform performance. You can control cookie settings in your browser.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Analytics:</strong> We use PostHog for privacy-preserving analytics to improve our service without tracking individual users across websites.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section id="retention" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Data Retention
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 dark:border-blue-600 pl-6">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Active Accounts</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  We retain your data as long as your account is active or as needed to provide services
                </p>
              </div>

              <div className="border-l-4 border-purple-500 dark:border-purple-600 pl-6">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Generated Content</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Uploaded images, generated prompts, and AI outputs are stored securely in AWS S3 and Cloudinary. Content is retained according to your subscription plan.
                </p>
              </div>

              <div className="border-l-4 border-amber-500 dark:border-amber-600 pl-6">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">After Account Deletion</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Personal data is deleted within 30 days, except where retention is required by law
                </p>
              </div>
            </div>
          </section>

          {/* International Transfers */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                We use standard contractual clauses and other approved mechanisms for international data transfers. Our services use cloud infrastructure providers (AWS, Cloudinary, Neon) with global compliance certifications.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
              <Baby className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Children's Privacy
            </h2>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Our Service is not intended for children under 13 years of age (or the minimum age of digital consent in your region). We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information from your child, please contact us immediately at support@im2prompt.com.
              </p>
            </div>
          </section>

          {/* Updates to Policy */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Changes to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section id="contact" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900 p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Contact Us About Privacy
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Privacy & Support</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <a href="mailto:support@im2prompt.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      support@im2prompt.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Privacy Requests</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      For data access, correction, or deletion requests, please email us with "Privacy Request" in the subject line.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                We are committed to protecting your privacy and will respond to inquiries within 48 hours.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Privacy Matters</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We are committed to protecting your privacy and ensuring your data is secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Effective Date: {effectiveDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
