'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function CreditsDebug({ plan }: { plan: any }) {
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    setRenderCount(c => c + 1);
  }, [plan]);

  if (!plan?.credits) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-background border rounded-lg p-4 shadow-lg z-50 max-w-md text-xs">
      <h4 className="font-bold mb-2">Credits Debug: {plan.name}</h4>
      <div className="space-y-1">
        <p>Render count: {renderCount}</p>
        <p>Raw credits: {JSON.stringify(plan.credits)}</p>
        <div className="space-y-1">
          <p>monthly: {plan.credits.monthly} (type: {typeof plan.credits.monthly})</p>
          <p>onSubscribe: {plan.credits.onSubscribe} (type: {typeof plan.credits.onSubscribe})</p>
          <p>onSignup: {plan.credits.onSignup} (type: {typeof plan.credits.onSignup})</p>
        </div>
        <div className="space-y-1">
          <p>Condition results:</p>
          <p>monthly > 0: {String(plan.credits.monthly > 0)} ({String(plan.credits.monthly && plan.credits.monthly > 0)})</p>
          <p>onSubscribe > 0: {String(plan.credits.onSubscribe > 0)} ({String(plan.credits.onSubscribe && plan.credits.onSubscribe > 0)})</p>
          <p>onSignup > 0: {String(plan.credits.onSignup > 0)} ({String(plan.credits.onSignup && plan.credits.onSignup > 0)})</p>
        </div>
        
        <div className="mt-2 pt-2 border-t">
          <p className="font-semibold mb-1">What should render:</p>
          <div className="flex gap-1 flex-wrap">
            {plan.credits.monthly && plan.credits.monthly > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                Monthly: {plan.credits.monthly}
              </Badge>
            )}
            {plan.credits.onSubscribe && plan.credits.onSubscribe > 0 && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                Bonus: {plan.credits.onSubscribe}
              </Badge>
            )}
            {plan.credits.onSignup && plan.credits.onSignup > 0 && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                Signup: {plan.credits.onSignup}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}