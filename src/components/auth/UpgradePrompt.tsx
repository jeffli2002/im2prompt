'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Shield, Check } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { creditsConfig } from '@/config/credits.config'
import { useEffect, useState } from 'react'
import { getUserSubscription } from '@/server/actions/payment/get-billing-info'
import { paymentConfig } from '@/config/payment.config'

interface UpgradePromptProps {
  onClose?: () => void
  creditsUsed?: number
  creditsLimit?: number
  type?: 'imageToText' | 'textToPrompt' | 'imageGeneration' | 'videoGeneration' | 'credits'
  isAuthenticated?: boolean
  limitType?: 'daily' | 'monthly'
}

export default function UpgradePrompt({ 
  onClose, 
  creditsUsed = 0,
  creditsLimit = 5,
  type = 'credits',
  isAuthenticated = true,
  limitType = 'daily'
}: UpgradePromptProps) {
  const pathname = usePathname()
  const pathParts = pathname.split('/').filter(Boolean)
  const locale = pathParts[0] && ['en', 'zh', 'es', 'fr', 'ja'].includes(pathParts[0]) ? pathParts[0] : 'en'
  const [userPlanId, setUserPlanId] = useState<string>('free')
  
  useEffect(() => {
    if (isAuthenticated) {
      getUserSubscription().then((result) => {
        if (result.success && result.data) {
          const priceId = result.data.priceId
          const plan = paymentConfig.plans.find(p => 
            p.stripePriceIds?.monthly === priceId || 
            p.stripePriceIds?.yearly === priceId
          )
          if (plan) {
            setUserPlanId(plan.id)
          }
        }
      })
    }
  }, [isAuthenticated])
  
  // Get configured credit costs
  const imageCreditCost = creditsConfig.consumption.imageGeneration['nano-banana']
  const videoCreditCost = creditsConfig.consumption.videoGeneration['sora-2']
  
  // Determine which plan to recommend
  const targetPlan = userPlanId === 'pro' ? 'proplus' : 'pro'
  const targetPlanConfig = paymentConfig.plans.find(p => p.id === targetPlan)
  const targetPlanName = targetPlan === 'proplus' ? 'Pro+' : 'Pro'
  const targetPlanPrice = targetPlanConfig?.price || 14.9
  
  const getContentType = () => {
    switch (type) {
      case 'imageToText':
        return 'Image-to-Text conversions'
      case 'textToPrompt':
        return 'Text-to-Prompt generations'
      case 'credits':
        return 'credits'
      default:
        return 'credits'
    }
  }

  const contentType = getContentType()
  
  const features = targetPlanConfig?.features.map((text, index) => ({
    icon: [Zap, Sparkles, Shield, Check, Check, Check][index] || Check,
    text
  })) || [
    { icon: Zap, text: '300 Image-to-Text per month' },
    { icon: Sparkles, text: '500 credits/month (100 images or 33 videos)' },
    { icon: Shield, text: 'No Ads' },
    { icon: Check, text: 'Commercial license' },
    { icon: Check, text: 'HD quality exports' },
    { icon: Check, text: 'Priority support' },
  ]

  const resetTime = limitType === 'daily' ? 'midnight UTC' : 'the 1st of next month'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {!isAuthenticated ? 'Sign In Required' : `${limitType === 'daily' ? 'Daily' : 'Monthly'} Limit Reached`}
            </CardTitle>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-2">
            {!isAuthenticated 
              ? `Please sign in to use this feature. Free users get ${creditsLimit} ${contentType} per ${limitType}!`
              : type === 'imageToText'
              ? `You've used all ${creditsLimit} free ${contentType} for ${limitType === 'daily' ? 'today' : 'this month'}.`
              : `You've used all ${creditsLimit} free ${contentType} for ${limitType === 'daily' ? 'today' : 'this month'}. (1 image = ${imageCreditCost} credits, 1 video = ${videoCreditCost} credits)`
            }
          </p>
          {isAuthenticated && (
            <div className="mt-2 text-center">
              <Badge variant="outline" className="text-xs">
                Used {creditsUsed} / {creditsLimit} {type === 'credits' ? 'credits' : contentType} {limitType === 'daily' ? 'today' : 'this month'}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Upgrade to {targetPlanName}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-purple-600">${targetPlanPrice}/mo</span>
            </div>
            <Badge className="mt-2 bg-purple-500">Save 20% with yearly</Badge>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {!isAuthenticated ? (
              <>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    window.location.href = `/${locale}?auth=signin`
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    window.location.href = `/${locale}?auth=signup`
                  }}
                >
                  Create Free Account
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => window.location.href = `/${locale}/pricing`}
                >
                  Upgrade to {targetPlanName}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onClose}
                >
                  Try Again {limitType === 'daily' ? 'Tomorrow' : 'Next Month'}
                </Button>
              </>
            )}
          </div>

          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>Your {limitType} limit resets at {resetTime}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
