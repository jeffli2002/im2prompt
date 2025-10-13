'use client';

import { CircleCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useIsAuthenticated } from '@/store/auth-store';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import { usePaymentPlans } from '@/hooks/use-config';
import { useCreemPayment } from '@/hooks/useCreemPayment';
import { Badge } from '@/components/ui/badge';
import { PurchaseConfirmationDialog } from '@/components/payment/purchase-confirmation-dialog';
import { creditsConfig } from '@/config/credits.config';

const pricingErrorLogger = new ErrorLogger('pricing');

// Get credit costs from config
const IMAGE_CREDIT_COST = creditsConfig.consumption.imageGeneration['nano-banana'];
const VIDEO_CREDIT_COST = creditsConfig.consumption.videoGeneration['sora-2'];

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

const Pricing = ({
  heading,
  description,
  plans,
}: Pricing2Props) => {
  const t = useTranslations('pricing');

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
            console.log('[Pricing] Set state:', { planId, interval: data.subscription.interval, cancelAtPeriodEnd: data.subscription.cancelAtPeriodEnd });
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
  const pricingPlans = plans || paymentPlans.map((plan: any) => ({
    ...plan,
    monthlyPrice: plan.price === 0 ? 'Free' : `$${plan.price}`,
    yearlyPrice: plan.price === 0 ? 'Free' : `$${Math.round((plan.yearlyPrice || plan.price * 10) / 12)}`,
    yearlyTotal: plan.price === 0 ? 0 : (plan.yearlyPrice || plan.price * 10),
    features: plan.features.map((feature: string) => ({ text: feature })),
    stripePriceIds: plan.stripePriceIds || {
      monthly: plan.stripePriceId,
      yearly: plan.stripePriceId,
    },
    button: {
      text: plan.price === 0
        ? t('getStartedText')
        : t('purchaseText'),
    },
    credits: plan.credits, // Pass through credits configuration
  }));

  const handlePurchaseClick = (plan: PricingPlan) => {
    // Check if plan is disabled (Pro or Pro+ coming soon)
    if (plan.id === 'pro' || plan.id === 'proplus') {
      toast.info('This plan is coming soon! Stay tuned for updates.');
      return;
    }

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
    console.log('[Pricing] Plan change detected:', { currentPlanId, targetPlanId: plan.id, cancelAtPeriodEnd });

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
    } catch (error) {
      toast.error('创建支付会话失败');
      pricingErrorLogger.logError(error as Error, {
        operation: 'createCheckoutSession',
        planId: selectedPlan.id,
      });
      setShowPurchaseDialog(false);
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
    if (imageToTextMatch && imageToTextMatch[1]) {
      const monthlyAmount = parseInt(imageToTextMatch[1]);
      return `${monthlyAmount * 12} Image-to-Text per year`;
    }
    
    const creditsMatch = featureText.match(/^(\d+)\s+credits\/month for generation$/);
    if (creditsMatch && creditsMatch[1]) {
      const monthlyAmount = parseInt(creditsMatch[1]);
      return `${monthlyAmount * 12} credits/year for generation`;
    }
    
    return featureText;
  };

  return (
    <section id="pricing" className="py-32 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-muted/20" />
      
      <div className="container relative">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center">
          <h2 className="text-pretty font-bold text-5xl sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              {finalHeading}
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed">
            {finalDescription}
          </p>
          
          {/* Enhanced toggle switch */}
          <div className="flex items-center gap-4 text-lg bg-muted/30 p-2 rounded-2xl">
            <span className={`px-4 py-2 rounded-xl transition-all duration-300 ${!isYearly ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}`}>
              {t('monthly')}
            </span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={() => setIsYearly(!isYearly)}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`px-4 py-2 rounded-xl transition-all duration-300 ${isYearly ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}`}>
              {t('yearly')}
            </span>
            {isYearly && (
              <span className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full font-medium">
                Save 20%
              </span>
            )}
          </div>
          <div className="flex flex-col items-stretch gap-8 md:flex-row justify-center">
            {pricingPlans.map((plan: PricingPlan, index: number) => (
              <Card 
                key={plan.id} 
                className={`flex w-80 flex-col justify-between text-left relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.id === 'pro' ? 'border-primary shadow-xl shadow-primary/20 scale-105' : 'border-border/50 hover:border-primary/50'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Current Plan, Coming Soon, or Popular badge */}
                <div className="absolute top-4 right-4">
                  {currentPlanId === plan.id && currentInterval === (isYearly ? 'year' : 'month') && !cancelAtPeriodEnd ? (
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </Badge>
                  ) : (plan.id === 'pro' || plan.id === 'proplus') ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Coming Soon
                    </Badge>
                  ) : plan.id === 'pro' ? (
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </Badge>
                  ) : null}
                </div>
                
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-bold mb-2">
                    <p>{plan.name}</p>
                  </CardTitle>
                  <p className="text-muted-foreground text-base mb-6">{plan.description}</p>
                  
                  {/* Enhanced Credits Badge */}
                  {plan.credits && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {typeof plan.credits.monthly === 'number' && plan.credits.monthly > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-2 rounded-xl font-semibold">
                          {isYearly ? plan.credits.yearly || plan.credits.monthly * 12 : plan.credits.monthly} Credits{isYearly ? '/year' : '/mo'}
                        </Badge>
                      )}
                      {typeof plan.credits.onSubscribe === 'number' && plan.credits.onSubscribe > 0 && (
                        <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300 px-3 py-2 rounded-xl">
                          +{plan.credits.onSubscribe} Bonus
                        </Badge>
                      )}
                      {typeof plan.credits.onSignup === 'number' && plan.credits.onSignup > 0 && (
                        <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 px-3 py-2 rounded-xl">
                          {plan.credits.onSignup} Free Credits
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-3">
                      <span className="font-bold text-5xl bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      {isYearly && plan.monthlyPrice !== 'Free' && (
                        <span className="text-xl text-muted-foreground line-through">
                          {plan.monthlyPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">
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
                    {plan.features.map((feature: PricingFeature, index: number) => (
                      <li key={`${plan.id}-feature-${index}`} className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-100 dark:bg-green-900 mt-0.5">
                          <CircleCheck className="size-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm leading-relaxed">{adjustFeatureText(feature.text, plan, isYearly)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Credit Cost Information */}
                  <div className="mt-6 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    <p className="mb-1">• 1 Nano Banana image costs {IMAGE_CREDIT_COST} credits</p>
                    <p>• 1 Sora 2 video costs {VIDEO_CREDIT_COST} credits</p>
                    {plan.credits?.monthly !== undefined && typeof plan.credits.monthly === 'number' && plan.credits.monthly > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="font-medium text-foreground">Maximum generation capacity:</p>
                        <p className="mt-1">→ Up to {Math.floor((isYearly ? (plan.credits.yearly || plan.credits.monthly * 12) : plan.credits.monthly) / IMAGE_CREDIT_COST)} Nano Banana images{isYearly ? '/year' : '/mo'}</p>
                        <p>→ Up to {Math.floor((isYearly ? (plan.credits.yearly || plan.credits.monthly * 12) : plan.credits.monthly) / VIDEO_CREDIT_COST)} Sora 2 videos{isYearly ? '/year' : '/mo'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="mt-auto p-8 pt-0">
                  <Button 
                    className="w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl"
                    onClick={() => handlePurchaseClick(plan)}
                    disabled={processingPlanId !== null || (currentPlanId === plan.id && currentInterval === (isYearly ? 'year' : 'month') && !cancelAtPeriodEnd) || plan.id === 'pro' || plan.id === 'proplus'}
                    variant={(currentPlanId === plan.id && currentInterval === (isYearly ? 'year' : 'month') && !cancelAtPeriodEnd) ? 'outline' : (plan.id === 'pro' || plan.id === 'proplus') ? 'secondary' : 'default'}
                  >
                    {(currentPlanId === plan.id && currentInterval === (isYearly ? 'year' : 'month') && !cancelAtPeriodEnd) ? (
                      'Active Subscription'
                    ) : (plan.id === 'pro' || plan.id === 'proplus') ? (
                      'Coming Soon'
                    ) : processingPlanId === plan.id ? (
                      t('processingText')
                    ) : (
                      <>
                        {plan.button.text}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <PurchaseConfirmationDialog
        isOpen={showPurchaseDialog}
        onClose={handleCancelPurchase}
        onConfirm={handleConfirmPurchase}
        planName={selectedPlan?.name}
        isProcessing={processingPlanId !== null}
      />
    </section>
  );
};

export { Pricing };
