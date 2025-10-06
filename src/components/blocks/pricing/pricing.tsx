'use client';

import { ArrowRight, CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useIsAuthenticated } from '@/store/auth-store';
import { useRouter } from '@/i18n/navigation';
import { createCheckoutSession } from '@/server/actions/payment/create-subscription';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import { usePaymentPlans } from '@/hooks/use-config';
import { Badge } from '@/components/ui/badge';
import { PurchaseConfirmationDialog } from '@/components/payment/purchase-confirmation-dialog';

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
  const [isYearly, setIsYearly] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const paymentPlans = usePaymentPlans();
  
  // Use configured plans if not provided as props
  // Convert payment plans to pricing plans format if needed
  const pricingPlans = plans || paymentPlans.map((plan) => ({
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
    if (!isAuthenticated) {
      // If user is not logged in, redirect to login page
      router.push('/login');
      return;
    }

    // Free plan redirects to image-to-prompt page
    if (plan.id === 'free') {
      router.push('/image-to-prompt');
      return;
    }

    // For paid plans, show confirmation dialog first
    setSelectedPlan(plan);
    setShowPurchaseDialog(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedPlan) return;

    // Get corresponding price ID
    const priceId = isYearly 
      ? selectedPlan.stripePriceIds?.yearly 
      : selectedPlan.stripePriceIds?.monthly;

    if (!priceId) {
      toast.error('价格配置错误，请联系客服');
      setShowPurchaseDialog(false);
      return;
    }

    // Create payment session
    startTransition(async () => {
      try {
        const result = await createCheckoutSession({
          priceId,
          successUrl: `${window.location.origin}/settings/billing?success=true`,
          // Redirect to billing page when user cancels payment, showing cancellation notice
          cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
        });

        if (result.success && result.data?.url) {
          window.location.href = result.data.url;
        } else {
          toast.error(result.error || '创建支付会话失败');
          setShowPurchaseDialog(false);
        }
      } catch (error) {
        toast.error('创建支付会话失败');
        pricingErrorLogger.logError(error as Error, {
          operation: 'createCheckoutSession',
          priceId,
          planId: selectedPlan.id,
        });
        setShowPurchaseDialog(false);
      }
    });
  };

  const handleCancelPurchase = () => {
    setShowPurchaseDialog(false);
    setSelectedPlan(null);
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
                {/* Popular badge */}
                {plan.id === 'pro' && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {/* Coming Soon badge for paid plans */}
                {plan.id !== 'free' && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1 rounded-full text-xs font-semibold">
                      Coming Soon
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-bold mb-2">
                    <p>{plan.name}</p>
                  </CardTitle>
                  <p className="text-muted-foreground text-base mb-6">{plan.description}</p>
                  
                  {/* Enhanced Credits Badge */}
                  {plan.credits && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {plan.credits.monthly && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-2 rounded-xl font-semibold">
                          💎 {isYearly ? plan.credits.yearly || plan.credits.monthly * 12 : plan.credits.monthly} Credits
                          {isYearly ? '/year' : '/month'}
                        </Badge>
                      )}
                      {plan.credits.onSubscribe && (
                        <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300 px-3 py-2 rounded-xl">
                          🎁 +{plan.credits.onSubscribe} Bonus
                        </Badge>
                      )}
                      {plan.credits.onSignup && (
                        <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 px-3 py-2 rounded-xl">
                          ✨ {plan.credits.onSignup} Free Credits
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <span className="font-bold text-5xl bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
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
                    <p className="mb-4 font-semibold text-primary">Everything in Plus, and:</p>
                  )}
                  <ul className="space-y-3">
                    {plan.features.map((feature: PricingFeature, index: number) => (
                      <li key={`${plan.id}-feature-${index}`} className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-100 dark:bg-green-900 mt-0.5">
                          <CircleCheck className="size-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm leading-relaxed">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto p-8 pt-0">
                  {plan.id === 'free' ? (
                    <Button 
                      className="w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl"
                      onClick={() => handlePurchaseClick(plan)}
                      disabled={isPending}
                    >
                      {isPending ? t('processingText') : plan.button.text}
                      <ArrowRight className="ml-2 size-5" />
                    </Button>
                  ) : (
                    <Button 
                      className="w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 bg-muted text-muted-foreground cursor-not-allowed"
                      disabled={true}
                    >
                      Coming Soon
                    </Button>
                  )}
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
        isProcessing={isPending}
      />
    </section>
  );
};

export { Pricing };
