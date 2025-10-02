import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, RefreshCw, Mail, Scale, CreditCard, Server, Ban, AlertCircle, FileWarning } from 'lucide-react';
import Link from 'next/link';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <TermsPageContent />
  );
}

function TermsPageContent() {
  const effectiveDate = '2025-01-01';
  const lastUpdated = '2025-01-01';

  const sectionsWithIcons = [
    {
      title: '1. Eligibility',
      icon: Users,
      content: 'You must be at least 18 years old (or the age of majority in your jurisdiction) to use this Service. By using the Service, you represent that you meet these requirements.'
    },
    {
      title: '2. Service Overview',
      icon: FileText,
      content: 'Our platform enables users to: Convert images and text into AI prompts; Generate outputs such as AI images and videos using models like Sora 2, Veo3, Stable Diffusion, Flux, and Midjourney; Save, refine, and manage prompts in a personal or team library.'
    },
    {
      title: '3. Accounts & Authentication',
      icon: Shield,
      content: 'You agree to provide accurate information when creating an account. You are responsible for safeguarding your account credentials. We may suspend or terminate accounts involved in abuse, fraud, or violations of these Terms.'
    },
    {
      title: '4. Acceptable Use',
      icon: Ban,
      content: 'You agree not to use the Service to: Generate content that is unlawful, harmful, abusive, harassing, defamatory, or violates intellectual property rights; Create deepfakes or misleading content intended to deceive, impersonate, or cause harm; Circumvent restrictions, reverse-engineer, or exploit vulnerabilities in the Service; Violate any applicable laws or regulations.'
    },
    {
      title: '5. Content Ownership',
      icon: Scale,
      content: 'User Content: You retain ownership of the inputs (text, images, video prompts) you upload. Generated Content: You own rights to outputs you generate, subject to compliance with these Terms and any restrictions imposed by third-party AI model providers (e.g., Sora 2, Veo3). Platform Rights: By using the Service, you grant us a limited license to store, process, and display content solely for the purpose of operating the Service.'
    },
    {
      title: '6. Credits & Payments',
      icon: CreditCard,
      content: 'The Service uses a credit-based system to meter usage (e.g., prompt extractions, previews, video renders). Credits and subscriptions are managed via Stripe. Payments are non-refundable except as required by law.'
    },
    {
      title: '7. Third-Party Services',
      icon: Server,
      content: 'The Service integrates with third-party AI providers (e.g., OpenAI Sora 2, Google Veo3, Stable Diffusion APIs). We do not control these services and are not responsible for their performance or policies.'
    },
    {
      title: '8. Termination',
      icon: AlertTriangle,
      content: 'We may suspend or terminate access to the Service for violations of these Terms or misuse of the platform.'
    },
    {
      title: '9. Disclaimers',
      icon: AlertCircle,
      content: 'The Service is provided "as is" without warranties of any kind. We do not guarantee accuracy, reliability, or suitability of AI-generated outputs. Use outputs responsibly — do not present them as factual without verification.'
    },
    {
      title: '10. Limitation of Liability',
      icon: FileWarning,
      content: 'To the maximum extent permitted by law, we are not liable for any damages arising from use of the Service, including but not limited to loss of profits, data, or reputation.'
    },
    {
      title: '11. Changes to Terms',
      icon: RefreshCw,
      content: 'We may update these Terms at any time. Updates will be posted on this page with a new effective date.'
    },
    {
      title: '12. Contact Us',
      icon: Mail,
      content: 'If you have questions about these Terms, please contact: support@im2prompt.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
              Legal Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Welcome to im2Prompt. By accessing or using our AI Image/Text ⇄ Prompt ⇄ Image/Video Platform, you agree to comply with these Terms of Service. Please read carefully.
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
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
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
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              If you have any questions about these terms, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="default" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}