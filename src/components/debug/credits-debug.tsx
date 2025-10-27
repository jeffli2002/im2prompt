'use client';

import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

export function CreditsDebug({ plan }: { plan: any }) {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount((c) => c + 1);
  }, [plan]);

  if (!plan?.credits) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md rounded-lg border bg-background p-4 text-xs shadow-lg">
      <h4 className="mb-2 font-bold">Credits Debug: {plan.name}</h4>
      <div className="space-y-1">
        <p>Render count: {renderCount}</p>
        <p>Raw credits: {JSON.stringify(plan.credits)}</p>
        <div className="space-y-1">
          <p>
            monthly: {plan.credits.monthly} (type: {typeof plan.credits.monthly})
          </p>
          <p>
            onSubscribe: {plan.credits.onSubscribe} (type: {typeof plan.credits.onSubscribe})
          </p>
          <p>
            onSignup: {plan.credits.onSignup} (type: {typeof plan.credits.onSignup})
          </p>
        </div>
        <div className="space-y-1">
          <p>Condition results:</p>
          <p>
            monthly {'>'} 0: {String(plan.credits.monthly > 0)} (
            {String(plan.credits.monthly && plan.credits.monthly > 0)})
          </p>
          <p>
            onSubscribe {'>'} 0: {String(plan.credits.onSubscribe > 0)} (
            {String(plan.credits.onSubscribe && plan.credits.onSubscribe > 0)})
          </p>
          <p>
            onSignup {'>'} 0: {String(plan.credits.onSignup > 0)} (
            {String(plan.credits.onSignup && plan.credits.onSignup > 0)})
          </p>
        </div>

        <div className="mt-2 border-t pt-2">
          <p className="mb-1 font-semibold">What should render:</p>
          <div className="flex flex-wrap gap-1">
            {plan.credits.monthly && plan.credits.monthly > 0 && (
              <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                Monthly: {plan.credits.monthly}
              </Badge>
            )}
            {plan.credits.onSubscribe && plan.credits.onSubscribe > 0 && (
              <Badge variant="outline" className="px-1 py-0 text-[10px]">
                Bonus: {plan.credits.onSubscribe}
              </Badge>
            )}
            {plan.credits.onSignup && plan.credits.onSignup > 0 && (
              <Badge variant="outline" className="px-1 py-0 text-[10px]">
                Signup: {plan.credits.onSignup}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
