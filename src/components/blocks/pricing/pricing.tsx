'use client';

import { CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { PurchaseConfirmationDialog } from '@/components/payment/purchase-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { usePaymentPlans } from '@/hooks/use-config';
import { useCreemPayment } from '@/hooks/useCreemPayment';
import { useRouter } from '@/i18n/navigation';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import { useIsAuthenticated } from '@/store/auth-store';
import { toast } from 'sonner';

const pricingErrorLogger = new ErrorLogger('pricing');

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyTotal?: number;
  features: PricingFeature[];
  popular?: boolean;
  stripePriceIds?: {
    monthly?: string;
    yearly?: string;
  };
  button: {
    text: string;
    url?: string; // Optional, for fallback
  };
  credits?: {
    monthly?: number;
    yearly?: number;
    onSubscribe?: number;
    onSignup?: number;
  };
}

interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
}

const Pricing = ({ heading, description, plans }: Pricing2Props) => {
  const t = useTranslations('pricing');
  const generationCapabilities = [
    'AI text to prompt',
    'AI text to image',
    'AI text to video',
    'AI image to prompt',
    'AI image to image',
    'AI image to video',
  ];

  // 使用i18n翻译或传入的props
  const finalHeading = heading || t('heading');
  const finalDescription = description || t('description');
  const [isYearly, setIsYearly] = useState(true);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState<'month' | 'year' | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const paymentPlans = usePaymentPlans();
  const { createCheckoutSession: createCreemCheckout, isLoading: creemLoading } = useCreemPayment();

  // Fetch current subscription when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPlanId(null);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/payment/get-subscription', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('[Pricing] Subscription data:', data);
          if (data.subscription) {
            // Extract plan ID from priceId (e.g., "pro" or "proplus")
            const planId = data.subscription.priceId?.includes('proplus') ? 'proplus' : 'pro';
            setCurrentPlanId(planId);
            setCurrentInterval(data.subscription.interval);
            setCancelAtPeriodEnd(data.subscription.cancelAtPeriodEnd || false);
            console.log('[Pricing] Set state:', {
              planId,
              interval: data.subscription.interval,
              cancelAtPeriodEnd: data.subscription.cancelAtPeriodEnd,
            });
          } else {
            setCurrentPlanId(null);
            setCurrentInterval(null);
            setCancelAtPeriodEnd(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    };

    fetchSubscription();
  }, [isAuthenticated]);

  // Use configured plans if not provided as props
  // Convert payment plans to pricing plans format if needed
  const pricingPlans =
    plans ||
    paymentPlans.map((plan: any) => ({
      ...plan,
      monthlyPrice: plan.price === 0 ? 'Free' : `$${plan.price}`,
      yearlyPrice:
        plan.price === 0 ? 'Free' : `$${Math.round((plan.yearlyPrice || plan.price * 10) / 12)}`,
      yearlyTotal: plan.price === 0 ? 0 : plan.yearlyPrice || plan.price * 10,
      features: plan.features.map((feature: string) => ({ text: feature })),
      stripePriceIds: plan.stripePriceIds || {
        monthly: plan.stripePriceId,
        yearly: plan.stripePriceId,
      },
      button: {
        text: plan.price === 0 ? t('getStartedText') : t('purchaseText'),
      },
      credits: plan.credits, // Pass through credits configuration
    }));

  const handlePurchaseClick = (plan: PricingPlan) => {
    if (!isAuthenticated) {
      // If user is not logged in, redirect to login page
      router.push('/login');
      return;
    }

    const selectedInterval = isYearly ? 'year' : 'month';

    // Check if user already has this exact plan with same interval
    if (currentPlanId === plan.id && currentInterval === selectedInterval && !cancelAtPeriodEnd) {
      toast.info(`You already have an active ${plan.name} subscription`);
      return;
    }

    // Allow plan changes - the backend will handle cancellation and scheduling
    console.log('[Pricing] Plan change detected:', {
      currentPlanId,
      targetPlanId: plan.id,
      cancelAtPeriodEnd,
    });

    // Free plan redirects to image-to-prompt page
    if (plan.id === 'free') {
      router.push('/image-to-prompt');
      return;
    }

    // For paid plans, show confirmation dialog first
    setSelectedPlan(plan);
    setShowPurchaseDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;

    // Validate plan ID
    const planId = selectedPlan.id;
    if (planId !== 'pro' && planId !== 'proplus') {
      toast.error('Invalid plan selected');
      setShowPurchaseDialog(false);
      return;
    }

    // Set processing state for this specific plan
    setProcessingPlanId(planId);

    try {
      await createCreemCheckout({
        planId,
        interval: isYearly ? 'year' : 'month',
      });
      // The hook automatically redirects to checkout URL on success
      setShowPurchaseDialog(false);
    } catch (error) {
      toast.error('创建支付会话失败');
      pricingErrorLogger.logError(error as Error, {
        operation: 'createCheckoutSession',
        planId: selectedPlan.id,
      });
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCancelPurchase = () => {
    setShowPurchaseDialog(false);
    setSelectedPlan(null);
  };

  // Helper function to adjust feature text based on yearly/monthly
  const adjustFeatureText = (featureText: string, plan: PricingPlan, isYearly: boolean): string => {
    if (!isYearly || plan.monthlyPrice === 'Free') return featureText;

    // Match patterns like "300 Image-to-Text per month" or "500 credits/month"
    const imageToTextMatch = featureText.match(/^(\d+)\s+Image-to-Text per month$/);
    if (imageToTextMatch?.[1]) {
      const monthlyAmount = Number.parseInt(imageToTextMatch[1]);
      return `${monthlyAmount * 12} Image-to-Text per year`;
    }

    const creditsMatch = featureText.match(/^(\d+)\s+credits\/month for generation$/);
    if (creditsMatch?.[1]) {
      const monthlyAmount = Number.parseInt(creditsMatch[1]);
      return `${monthlyAmount * 12} credits/year for generation`;
    }

    return featureText;
  };

  return (
    <section id="pricing" className="relative py-32">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-muted/20" />

      <div className="container relative">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center">
          <h2 className="text-pretty font-bold text-5xl sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              {finalHeading}
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-muted-foreground/80 text-xl leading-relaxed sm:text-2xl">
            {finalDescription}
          </p>

          {/* Enhanced toggle switch */}
          <div className="flex items-center gap-4 rounded-2xl bg-muted/30 p-2 text-lg">
            <span
              className={`rounded-xl px-4 py-2 transition-all duration-300 ${!isYearly ? 'bg-background font-semibold shadow-sm' : 'text-muted-foreground'}`}
            >
              {t('monthly')}
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={() => setIsYearly(!isYearly)}
              className="data-[state=checked]:bg-primary"
            />
            <span
              className={`rounded-xl px-4 py-2 transition-all duration-300 ${isYearly ? 'bg-background font-semibold shadow-sm' : 'text-muted-foreground'}`}
            >
              {t('yearly')}
            </span>
            {isYearly && (
              <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 text-sm dark:bg-green-900 dark:text-green-200">
                Save 20%
              </span>
            )}
          </div>
          <div className="flex flex-col items-stretch justify-center gap-8 md:flex-row">
            {pricingPlans.map((plan: PricingPlan, index: number) => {
              const interval = isYearly ? 'year' : 'month';
              const isActivePlan =
                currentPlanId === plan.id && currentInterval === interval && !cancelAtPeriodEnd;
              const isProcessingPlan = processingPlanId === plan.id;
              const isAnotherPlanProcessing =
                processingPlanId !== null && processingPlanId !== plan.id;
              const isCheckoutDisabled =
                isActivePlan || isProcessingPlan || isAnotherPlanProcessing || creemLoading;

              return (
                <Card
                  key={plan.id}
                  className={`hover:-translate-y-2 relative flex w-80 flex-col justify-between overflow-hidden text-left transition-all duration-300 hover:shadow-2xl ${
                    plan.popular
                      ? 'scale-105 border-primary shadow-primary/20 shadow-xl'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Current Plan or Highlight badge */}
                  <div className="absolute top-4 right-4">
                    {isActivePlan ? (
                      <Badge className="rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 font-semibold text-white text-xs">
                        Current Plan
                      </Badge>
                    ) : plan.popular ? (
                      <Badge className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 font-semibold text-primary-foreground text-xs">
                        Most Popular
                      </Badge>
                    ) : plan.id === 'proplus' ? (
                      <Badge className="rounded-full bg-gradient-to-r from-violet-500 to-violet-600 px-3 py-1 font-semibold text-white text-xs">
                        Best Value
                      </Badge>
                    ) : null}
                  </div>

                  <CardHeader className="p-8">
                    <CardTitle className="mb-2 font-bold text-2xl">
                      <p>{plan.name}</p>
                    </CardTitle>
                    <p className="mb-6 text-base text-muted-foreground">{plan.description}</p>

                    {/* Enhanced Credits Badge */}
                    {plan.credits && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {typeof plan.credits.monthly === 'number' && plan.credits.monthly > 0 && (
                          <Badge
                            variant="secondary"
                            className="rounded-xl bg-blue-100 px-3 py-2 font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {isYearly
                              ? plan.credits.yearly || plan.credits.monthly * 12
                              : plan.credits.monthly}{' '}
                            Credits{isYearly ? '/year' : '/mo'}
                          </Badge>
                        )}
                        {typeof plan.credits.onSubscribe === 'number' &&
                          plan.credits.onSubscribe > 0 && (
                            <Badge
                              variant="outline"
                              className="rounded-xl border-green-200 px-3 py-2 text-green-700 dark:border-green-800 dark:text-green-300"
                            >
                              +{plan.credits.onSubscribe} Bonus
                            </Badge>
                          )}
                        {typeof plan.credits.onSignup === 'number' && plan.credits.onSignup > 0 && (
                          <Badge
                            variant="outline"
                            className="rounded-xl border-purple-200 px-3 py-2 text-purple-700 dark:border-purple-800 dark:text-purple-300"
                          >
                            {plan.credits.onSignup} Free Credits
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-baseline gap-3">
                        <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text font-bold text-5xl text-transparent">
                          {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        {isYearly && plan.monthlyPrice !== 'Free' && (
                          <span className="text-muted-foreground text-xl line-through">
                            {plan.monthlyPrice}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-muted-foreground text-sm">
                        {plan.monthlyPrice === 'Free' ? (
                          'Forever free'
                        ) : (
                          <>
                            Billed{' '}
                            {isYearly
                              ? `$${plan.yearlyTotal} annually`
                              : `$${Number(plan.monthlyPrice.slice(1))} monthly`}
                          </>
                        )}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-6">
                    <Separator className="mb-6" />
                    {plan.id === 'pro' && (
                      <p className="mb-4 font-semibold text-primary">Everything in Free, and:</p>
                    )}
                    <ul className="space-y-3">
                      {plan.features.map((feature: PricingFeature, featureIndex: number) => (
                        <li
                          key={`${plan.id}-feature-${featureIndex}`}
                          className="flex items-center gap-3"
                        >
                          <div className="shrink-0 rounded-full bg-green-100 p-1 dark:bg-green-900">
                            <CircleCheck className="size-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm leading-relaxed">
                            {adjustFeatureText(feature.text, plan, isYearly)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Generation Capabilities */}
                    <ul className="mt-6 space-y-3">
                      {generationCapabilities.map((capability) => (
                        <li key={`${plan.id}-${capability}`} className="flex items-center gap-3">
                          <div className="shrink-0 rounded-full bg-green-100 p-1 dark:bg-green-900">
                            <CircleCheck className="size-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm leading-relaxed">{capability}</span>
                        </li>
                      ))}
                    </ul>
                    {(plan.id === 'pro' || plan.id === 'proplus') && (
                      <div className="mt-4 space-y-1 rounded-lg border border-muted bg-muted/30 p-3">
                        <p className="text-muted-foreground text-xs">
                          → Up to {isYearly ? '1200' : '100'} Nano Banana images
                          {isYearly ? '/year' : '/month'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          → Up to {isYearly ? '400' : '33'} Sora 2 videos{isYearly ? '/year' : '/month'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="mt-auto p-8 pt-0">
                    <Button
                      className="w-full rounded-2xl py-6 font-semibold text-lg transition-all duration-300 hover:shadow-xl"
                      onClick={() => handlePurchaseClick(plan)}
                      disabled={isCheckoutDisabled}
                      variant={
                        isActivePlan ? 'outline' : plan.id === 'free' ? 'secondary' : 'default'
                      }
                    >
                      {isActivePlan
                        ? 'Active Subscription'
                        : isProcessingPlan
                          ? t('processingText')
                          : plan.button.text}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <PurchaseConfirmationDialog
        isOpen={showPurchaseDialog}
        onClose={handleCancelPurchase}
        onConfirm={handleConfirmPurchase}
        planName={selectedPlan?.name}
        isProcessing={processingPlanId === selectedPlan?.id}
      />
    </section>
  );
};

export { Pricing };
