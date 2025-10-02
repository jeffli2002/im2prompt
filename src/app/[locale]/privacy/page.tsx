import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, Shield, Database, Share2, Lock, Cookie, UserCheck, RefreshCw, Mail, FileText, CreditCard, Server, Trash2, Baby } from 'lucide-react';
import Link from 'next/link';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PrivacyPageContent />
  );
}

function PrivacyPageContent() {
  const effectiveDate = '2025-01-01';
  const lastUpdated = '2025-01-01';

  const sectionsWithIcons = [
    {
      title: '1. Information We Collect',
      icon: Database,
      content: `Account Information: Name, email, authentication details.

Usage Data: Uploaded images, text inputs, generated prompts, and outputs.

Payment Data: Managed by third-party providers (e.g., Stripe). We do not store credit card numbers.

Technical Data: IP address, device/browser type, cookies, and analytics.`
    },
    {
      title: '2. How We Use Information',
      icon: UserCheck,
      content: `We use your data to:

• Provide and improve the Service
• Generate prompts, images, and videos
• Manage credits, billing, and subscriptions
• Secure accounts and prevent misuse
• Provide customer support and service updates`
    },
    {
      title: '3. Sharing of Information',
      icon: Share2,
      content: `We may share limited data with:

• AI providers (e.g., OpenAI Sora 2, Google Veo3, Stable Diffusion, Flux) for processing prompts and outputs
• Payment processors (e.g., Stripe) for billing
• Analytics & monitoring tools (e.g., PostHog, Sentry) for platform performance

We do not sell personal information to third parties.`
    },
    {
      title: '4. Data Retention',
      icon: Server,
      content: `• User data is stored securely in Neon Postgres and AWS S3.
• We retain content only as long as necessary for Service operation or as required by law.
• You may request deletion of your account and associated data at any time.`
    },
    {
      title: '5. Security',
      icon: Lock,
      content: 'We use modern security practices including encryption, authentication, and access controls. However, no system is 100% secure. You are responsible for safeguarding your account credentials.'
    },
    {
      title: '6. Your Rights',
      icon: Shield,
      content: `Depending on your jurisdiction (GDPR, CCPA, etc.), you may have rights to:

• Access your data
• Request correction or deletion
• Object to processing
• Export your data

Requests can be submitted to support@im2prompt.com.`
    },
    {
      title: '7. Cookies & Tracking',
      icon: Cookie,
      content: 'We use cookies and analytics tools to improve user experience and platform performance. You can control cookie settings in your browser.'
    },
    {
      title: '8. Children\'s Privacy',
      icon: Baby,
      content: 'The Service is not intended for children under 13 years old (or the minimum age of digital consent in your region). We do not knowingly collect data from children.'
    },
    {
      title: '9. Changes to Privacy Policy',
      icon: RefreshCw,
      content: 'We may update this Privacy Policy from time to time. Changes will be posted with a new effective date.'
    },
    {
      title: '10. Contact Us',
      icon: Mail,
      content: `For privacy-related questions:
support@im2prompt.com`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="text-xs">
              Privacy Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our AI Image/Text ⇄ Prompt ⇄ Image/Video Platform.
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Effective Date: {effectiveDate}
            </div>
            <div>Last Updated: {lastUpdated}</div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sectionsWithIcons.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/70 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border-0">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Privacy Matters</h3>
            </div>
            <p className="text-gray-600 mb-6">
              We are committed to protecting your privacy and ensuring your data is secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="default" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}