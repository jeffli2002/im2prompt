'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { creditsConfig } from '@/config/credits.config'

interface QuotaUsage {
  imageToText: {
    daily: number
    dailyLimit: number
  }
  textToPrompt: {
    unlimited: boolean
  }
  credits: {
    dailyUsed: number
    dailyLimit: number
    monthlyUsed: number
    monthlyLimit: number
  }
  consumption: {
    imageGeneration: number
    videoGeneration: number
  }
}

export function useQuota() {
  const { user } = useAuth()
  const [usage, setUsage] = useState<QuotaUsage>({
    imageToText: {
      daily: 0,
      dailyLimit: creditsConfig.freeUser.imageToText.freeQuotaPerDay,
    },
    textToPrompt: {
      unlimited: creditsConfig.freeUser.textToPrompt.unlimited,
    },
    credits: {
      dailyUsed: 0,
      dailyLimit: creditsConfig.freeUser.credits.dailyCredits,
      monthlyUsed: 0,
      monthlyLimit: creditsConfig.freeUser.credits.monthlyCredits,
    },
    consumption: {
      imageGeneration: creditsConfig.consumption.imageGeneration.nanoBanana,
      videoGeneration: creditsConfig.consumption.videoGeneration.sora2,
    },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUsage = async () => {
      setIsLoading(true)
      try {
        if (user) {
          const response = await fetch('/api/v1/usage/status')
          if (response.ok) {
            const data = await response.json()
            setUsage(data)
          }
        } else {
          const localUsage = getLocalUsage()
          setUsage(localUsage)
        }
      } catch (error) {
        console.error('Error loading usage:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsage()
  }, [user])

  const canUseImageToText = () => {
    return usage.imageToText.daily < usage.imageToText.dailyLimit
  }

  const canUseTextToPrompt = () => {
    return usage.textToPrompt.unlimited
  }

  const canGenerateImage = () => {
    const creditsNeeded = usage.consumption.imageGeneration
    return (
      usage.credits.dailyUsed + creditsNeeded <= usage.credits.dailyLimit &&
      usage.credits.monthlyUsed + creditsNeeded <= usage.credits.monthlyLimit
    )
  }

  const canGenerateVideo = () => {
    const creditsNeeded = usage.consumption.videoGeneration
    return (
      usage.credits.dailyUsed + creditsNeeded <= usage.credits.dailyLimit &&
      usage.credits.monthlyUsed + creditsNeeded <= usage.credits.monthlyLimit
    )
  }

  const trackImageToText = async () => {
    if (user) {
      try {
        await fetch('/api/v1/usage/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'imageToText' }),
        })
        setUsage(prev => ({
          ...prev,
          imageToText: {
            ...prev.imageToText,
            daily: prev.imageToText.daily + 1,
          },
        }))
      } catch (error) {
        console.error('Error tracking image to text:', error)
      }
    } else {
      incrementLocalUsage('imageToText')
    }
  }

  const trackImageGeneration = async () => {
    const creditsUsed = usage.consumption.imageGeneration
    if (user) {
      try {
        await fetch('/api/v1/usage/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'imageGeneration' }),
        })
        setUsage(prev => ({
          ...prev,
          credits: {
            ...prev.credits,
            dailyUsed: prev.credits.dailyUsed + creditsUsed,
            monthlyUsed: prev.credits.monthlyUsed + creditsUsed,
          },
        }))
      } catch (error) {
        console.error('Error tracking image generation:', error)
      }
    } else {
      incrementLocalUsage('imageGeneration', creditsUsed)
    }
  }

  const trackVideoGeneration = async () => {
    const creditsUsed = usage.consumption.videoGeneration
    if (user) {
      try {
        await fetch('/api/v1/usage/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'videoGeneration' }),
        })
        setUsage(prev => ({
          ...prev,
          credits: {
            ...prev.credits,
            dailyUsed: prev.credits.dailyUsed + creditsUsed,
            monthlyUsed: prev.credits.monthlyUsed + creditsUsed,
          },
        }))
      } catch (error) {
        console.error('Error tracking video generation:', error)
      }
    } else {
      incrementLocalUsage('videoGeneration', creditsUsed)
    }
  }

  const getLocalUsage = (): QuotaUsage => {
    const today = new Date().toDateString()
    const month = new Date().toISOString().slice(0, 7)
    const stored = localStorage.getItem('im2prompt_usage')
    
    if (!stored) {
      return usage
    }
    
    const parsed = JSON.parse(stored)
    return {
      imageToText: {
        daily: parsed.imageToText?.date === today ? parsed.imageToText?.count || 0 : 0,
        dailyLimit: creditsConfig.freeUser.imageToText.freeQuotaPerDay,
      },
      textToPrompt: {
        unlimited: creditsConfig.freeUser.textToPrompt.unlimited,
      },
      credits: {
        dailyUsed: parsed.credits?.date === today ? parsed.credits?.dailyUsed || 0 : 0,
        dailyLimit: creditsConfig.freeUser.credits.dailyCredits,
        monthlyUsed: parsed.credits?.month === month ? parsed.credits?.monthlyUsed || 0 : 0,
        monthlyLimit: creditsConfig.freeUser.credits.monthlyCredits,
      },
      consumption: {
        imageGeneration: creditsConfig.consumption.imageGeneration.nanoBanana,
        videoGeneration: creditsConfig.consumption.videoGeneration.sora2,
      },
    }
  }

  const incrementLocalUsage = (type: 'imageToText' | 'imageGeneration' | 'videoGeneration', credits = 0) => {
    const today = new Date().toDateString()
    const month = new Date().toISOString().slice(0, 7)
    const stored = localStorage.getItem('im2prompt_usage')
    const usageData = stored ? JSON.parse(stored) : {}
    
    if (type === 'imageToText') {
      if (!usageData.imageToText || usageData.imageToText.date !== today) {
        usageData.imageToText = { date: today, count: 0 }
      }
      usageData.imageToText.count += 1
      setUsage(prev => ({
        ...prev,
        imageToText: {
          ...prev.imageToText,
          daily: usageData.imageToText.count,
        },
      }))
    } else {
      // For image/video generation, track credits
      if (!usageData.credits || usageData.credits.date !== today) {
        usageData.credits = { date: today, dailyUsed: 0, month, monthlyUsed: 0 }
      }
      if (usageData.credits.month !== month) {
        usageData.credits.monthlyUsed = 0
        usageData.credits.month = month
      }
      usageData.credits.dailyUsed += credits
      usageData.credits.monthlyUsed += credits
      setUsage(prev => ({
        ...prev,
        credits: {
          ...prev.credits,
          dailyUsed: usageData.credits.dailyUsed,
          monthlyUsed: usageData.credits.monthlyUsed,
        },
      }))
    }
    
    localStorage.setItem('im2prompt_usage', JSON.stringify(usageData))
  }

  return {
    usage,
    isLoading,
    canUseImageToText,
    canUseTextToPrompt,
    canGenerateImage,
    canGenerateVideo,
    trackImageToText,
    trackImageGeneration,
    trackVideoGeneration,
  }
}
