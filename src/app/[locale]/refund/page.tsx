import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, DollarSign, Shield, XCircle, CreditCard, RefreshCw, Mail, AlertCircle, Calendar, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';

interface RefundPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RefundPage({ params }: RefundPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RefundPageContent />
  );
}

function RefundPageContent() {
  const effectiveDate = '2025-01-01';
  const lastUpdated = '2025-01-01';

  const sectionsWithIcons = [
    {
      title: '1. No Refunds Policy',
      icon: XCircle,
      content: `All sales are final. Due to the digital nature of our services, we do not offer refunds for:

• Subscription plans (Pro, Pro+)
• Credit packages
• One-time purchases
• Generated content (images, videos, prompts)

Once payment is processed and credits are issued or services are rendered, refunds will not be provided.`
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

To cancel your subscription, visit Settings → Billing → Cancel Subscription.`
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

We will investigate legitimate billing errors and issue corrections or refunds where appropriate.`
    },
    {
      title: '4. Service Availability',
      icon: AlertCircle,
      content: `While we strive for 99.9% uptime, the Service is provided "as is" without guarantees of uninterrupted availability.

• Temporary service disruptions do not qualify for refunds
• Scheduled maintenance will be announced in advance
• Extended outages (>24 hours) may be eligible for credit compensation at our discretion`
    },
    {
      title: '5. Credit Expiration',
      icon: Calendar,
      content: `Credits have the following policies:

• Monthly subscription credits reset at the start of each billing cycle
• Unused credits do not roll over to the next month
• No refunds for expired or unused credits
• Free plan credits reset daily (3 images + 1 video per day)`
    },
    {
      title: '6. Account Termination',
      icon: Shield,
      content: `If your account is terminated for violations of our Terms of Service:

• No refunds will be issued for remaining credits or subscription time
• Termination is at our sole discretion
• Appeals can be submitted to support@im2prompt.com`
    },
    {
      title: '7. Payment Processor',
      icon: DollarSign,
      content: `All payments are processed through Creem payment service. Disputes must be resolved according to:

• Creem's terms and conditions
• Your card issuer's dispute resolution process
• Applicable consumer protection laws in your jurisdiction

Chargebacks may result in immediate account suspension.`
    },
    {
      title: '8. Free Trial Policy',
      icon: CheckCircle,
      content: `If we offer promotional free trials:

• No payment required during trial period
• Cancel before trial ends to avoid charges
• Trials are limited to one per user/email
• Trial abuse may result in account termination`
    },
    {
      title: '9. Exceptional Circumstances',
      icon: FileText,
      content: `In rare cases, we may consider refunds for:

• Documented technical failures preventing service use
• Serious errors on our part
• Legal requirements in your jurisdiction

All refund requests must be submitted within 30 days of purchase to support@im2prompt.com with detailed documentation.`
    },
    {
      title: '10. Changes to Refund Policy',
      icon: RefreshCw,
      content: 'We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with a new effective date. Continued use of the Service after changes constitutes acceptance of the updated policy.'
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

We aim to respond within 48-72 business hours.`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
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

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            Refund Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            This Refund Policy explains our policies regarding refunds, cancellations, and billing for the im2Prompt platform. Please read carefully before making a purchase.
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Effective Date: {effectiveDate}
            </div>
            <div>Last Updated: {lastUpdated}</div>
          </div>
        </div>

        <div className="mb-12 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Important Notice</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All sales are final. We do not offer refunds for digital services. You may cancel your subscription at any time to prevent future charges. Billing errors will be corrected within 30 days of the charge.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {sectionsWithIcons.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="group hover:shadow-lg transition-all duration-300 border border-border/50 shadow-md bg-card/80 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-3">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-border/50">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Questions About Billing?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              If you have questions about our refund policy or billing, please contact our support team.
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
