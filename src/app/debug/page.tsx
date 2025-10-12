'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';

export default function DebugPage() {
  const [renderKey, setRenderKey] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Test data for credits
  const testPlans = [
    { name: 'Free', credits: { monthly: 0, onSubscribe: 0, onSignup: 30 } },
    { name: 'Pro', credits: { monthly: 500, onSubscribe: 0, onSignup: 0 } },
    { name: 'Pro+', credits: { monthly: 900, onSubscribe: 0, onSignup: 0 } },
  ];

  const forceRerender = () => {
    setRenderKey(prev => prev + 1);
    setImageError(false);
  };

  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Debug Page</h1>
        <div className="flex gap-4">
          <Button onClick={forceRerender} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Force Rerender
          </Button>
          <Button onClick={clearCache} variant="destructive">
            Clear Cache & Reload
          </Button>
        </div>
      </div>

      {/* Logo Debug Section */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Display Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Next.js Image (unoptimized)</h3>
              <div className="relative w-32 h-32 border rounded">
                <Image
                  key={`next-image-${renderKey}`}
                  src="/images/logo3.png"
                  alt="Logo test 1"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  unoptimized
                  priority
                  onError={() => setImageError(true)}
                  onLoad={() => console.log('Image loaded successfully')}
                />
              </div>
              <p className="text-sm mt-2">Status: {imageError ? '❌ Failed' : '✅ Success'}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Regular img tag</h3>
              <img 
                key={`img-${renderKey}`}
                src="/images/logo3.png" 
                alt="Logo test 2" 
                className="w-8 h-8 rounded-lg"
                onError={(e) => {
                  console.error('Regular img failed');
                  (e.target as HTMLImageElement).style.border = '2px solid red';
                }}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">With timestamp</h3>
              <img 
                key={`timestamp-${renderKey}`}
                src={`/images/logo3.png?t=${Date.now()}`}
                alt="Logo test 3" 
                className="w-8 h-8 rounded-lg"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Fallback SVG</h3>
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%234f46e5'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3EI2P%3C/text%3E%3C/svg%3E"
                alt="Fallback logo"
                className="w-8 h-8 rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credits Badge Debug Section */}
      <Card>
        <CardHeader>
          <CardTitle>Credits Badge Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {testPlans.map((plan) => (
              <div key={plan.name} className="border p-4 rounded">
                <h3 className="font-semibold mb-4">{plan.name} Plan</h3>
                
                <div className="mb-4 text-sm space-y-1">
                  <p>monthly: {plan.credits.monthly} (type: {typeof plan.credits.monthly})</p>
                  <p>onSubscribe: {plan.credits.onSubscribe} (type: {typeof plan.credits.onSubscribe})</p>
                  <p>onSignup: {plan.credits.onSignup} (type: {typeof plan.credits.onSignup})</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Old implementation (might show "0"):</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.credits.monthly && plan.credits.monthly > 0 && (
                        <Badge variant="secondary">{plan.credits.monthly} Credits/mo</Badge>
                      )}
                      {plan.credits.onSubscribe && plan.credits.onSubscribe > 0 && (
                        <Badge variant="outline">+{plan.credits.onSubscribe} Bonus</Badge>
                      )}
                      {plan.credits.onSignup && plan.credits.onSignup > 0 && (
                        <Badge variant="outline">{plan.credits.onSignup} Free Credits</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">New implementation (with type check):</p>
                    <div className="flex flex-wrap gap-2">
                      {typeof plan.credits.monthly === 'number' && plan.credits.monthly > 0 && (
                        <Badge variant="secondary">{plan.credits.monthly} Credits/mo</Badge>
                      )}
                      {typeof plan.credits.onSubscribe === 'number' && plan.credits.onSubscribe > 0 && (
                        <Badge variant="outline">+{plan.credits.onSubscribe} Bonus</Badge>
                      )}
                      {typeof plan.credits.onSignup === 'number' && plan.credits.onSignup > 0 && (
                        <Badge variant="outline">{plan.credits.onSignup} Free Credits</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Server Check */}
      <Card>
        <CardHeader>
          <CardTitle>Server-Side Logo Check</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={async () => {
              const res = await fetch('/api/debug/check-logo');
              const data = await res.json();
              alert(JSON.stringify(data, null, 2));
            }}
          >
            Check Logo on Server
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}