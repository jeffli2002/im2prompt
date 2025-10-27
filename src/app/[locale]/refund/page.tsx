import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Mail,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

interface RefundPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RefundPage({ params }: RefundPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RefundPageContent />;
}

function RefundPageContent() {
  const effectiveDate = '2025-10-01';
  const lastUpdated = '2025-10-01';

  const sectionsWithIcons = [
    {
      title: '1. No Refunds Policy',
      icon: XCircle,
      content: `All sales are final. Due to the digital nature of our services, we do not offer refunds for:

• Subscription plans (Pro, Pro+)
• Credit packages
• One-time purchases
• Generated content (images, videos, prompts)

Once payment is processed and credits are issued or services are rendered, refunds will not be provided.`,
    },
    {
      title: '2. Subscription Management',
      icon: RefreshCw,
      content: `You have full control over your subscription:

• Cancel anytime through your account settings
• Cancellation prevents future charges
• Access continues until the end of your current billing period
• No refunds for unused time in the current billing cycle
• Cancellations take effect at the end of the billing period

To cancel your subscription, visit Settings → Billing → Cancel Subscription.`,
    },
    {
      title: '3. Billing Error Corrections',
      icon: CreditCard,
      content: `If you believe you were charged incorrectly due to a billing error, please contact us within 30 days of the charge.

Eligible billing errors include:
• Duplicate charges for the same transaction
• Charges after subscription cancellation
• Incorrect pricing applied to your plan
• Technical errors in payment processing

We will investigate legitimate billing errors and issue corrections or refunds where appropriate.`,
    },
    {
      title: '4. Service Availability',
      icon: AlertCircle,
      content: `While we strive for 99.9% uptime, the Service is provided "as is" without guarantees of uninterrupted availability.

• Temporary service disruptions do not qualify for refunds
• Scheduled maintenance will be announced in advance
• Extended outages (>24 hours) may be eligible for credit compensation at our discretion`,
    },
    {
      title: '5. Credit Expiration',
      icon: Calendar,
      content: `Credits have the following policies:

• Monthly subscription credits reset at the start of each billing cycle
• Unused credits do not roll over to the next month
• No refunds for expired or unused credits
• Free plan users receive 30 credits on signup (one-time only, no daily/monthly resets)`,
    },
    {
      title: '6. Account Termination',
      icon: Shield,
      content: `If your account is terminated for violations of our Terms of Service:

• No refunds will be issued for remaining credits or subscription time
• Termination is at our sole discretion
• Appeals can be submitted to support@im2prompt.com

Violations include but are not limited to:
• Uploading or generating prohibited content (adult, violence, hate speech, copyright infringement)
• Creating content that violates our content safety policies
• Abuse of service, fraud, or repeated policy violations`,
    },
    {
      title: '7. Payment Processor',
      icon: DollarSign,
      content: `All payments are processed through Creem payment service. Disputes must be resolved according to:

• Creem's terms and conditions
• Your card issuer's dispute resolution process
• Applicable consumer protection laws in your jurisdiction

Chargebacks may result in immediate account suspension.`,
    },
    {
      title: '8. Free Plan Policy',
      icon: CheckCircle,
      content: `Our free plan offers:

• 30 credits on signup (one-time)
• 3 Image-to-Prompt conversions per day (10/month)
• Unlimited Text-to-Prompt generation
• Credits can be used for generation (5 credits/Nano Banana image, 15 credits/Sora 2 video)`,
    },
    {
      title: '9. Exceptional Circumstances',
      icon: FileText,
      content: `In rare cases, we may consider refunds for:

• Documented technical failures preventing service use
• Serious errors on our part
• Legal requirements in your jurisdiction

All refund requests must be submitted within 30 days of purchase to support@im2prompt.com with detailed documentation.`,
    },
    {
      title: '10. Changes to Refund Policy',
      icon: RefreshCw,
      content:
        'We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with a new effective date. Continued use of the Service after changes constitutes acceptance of the updated policy.',
    },
    {
      title: '11. Contact Us',
      icon: Mail,
      content: `For billing inquiries, cancellation assistance, or to report billing errors:

Email: support@im2prompt.com

Please include:
• Your account email
• Transaction details (date, amount)
• Detailed description of the issue

We aim to respond within 48-72 business hours.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text font-bold text-4xl text-transparent md:text-5xl">
            Refund Policy
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
            This Refund Policy explains our policies regarding refunds, cancellations, and billing
            for the im2Prompt platform. Please read carefully before making a purchase.
          </p>
          <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Effective Date: {effectiveDate}
            </div>
            <div>Last Updated: {lastUpdated}</div>
          </div>
        </div>

        <div className="mb-12 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-500" />
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Important Notice</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All sales are final. We do not offer refunds for digital services. You may cancel
                your subscription at any time to prevent future charges. Billing errors will be
                corrected within 30 days of the charge.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {sectionsWithIcons.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="group rounded-xl border border-border/50 bg-card/80 p-6 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="mb-3 font-semibold text-foreground text-xl">{section.title}</h2>
                    <p className="whitespace-pre-wrap text-base text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-md backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">Questions About Billing?</h3>
            </div>
            <p className="mb-6 text-muted-foreground">
              If you have questions about our refund policy or billing, please contact our support
              team.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/">
                <Button variant="outline" className="gap-2">
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
