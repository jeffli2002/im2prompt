import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import db from '@/server/db'
import { usageTracking } from '@/server/db/schema'
import { eq, and, gte, lte, sum } from 'drizzle-orm'
import { creditsConfig } from '@/config/credits.config'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const today = new Date().toISOString().split('T')[0] as string
    const month = new Date().toISOString().slice(0, 7) as string

    const [dailyUsage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.date, today)
        )
      )
      .limit(1)

    const monthlyUsage = await db
      .select({
        totalCredits: sum(usageTracking.creditsUsedDaily),
      })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.date, `${month}-01`),
          lte(usageTracking.date, `${month}-31`)
        )
      )

    const imageToTextDaily = dailyUsage?.imageToTextCount || 0
    const creditsUsedDaily = dailyUsage?.creditsUsedDaily || 0
    const creditsUsedMonthly = Number(monthlyUsage[0]?.totalCredits || 0)

    return NextResponse.json({
      imageToText: {
        daily: imageToTextDaily,
        dailyLimit: creditsConfig.freeUser.imageToText.freeQuotaPerDay,
      },
      textToPrompt: {
        unlimited: creditsConfig.freeUser.textToPrompt.unlimited,
      },
      credits: {
        dailyUsed: creditsUsedDaily,
        dailyLimit: creditsConfig.freeUser.credits.dailyCredits,
        monthlyUsed: creditsUsedMonthly,
        monthlyLimit: creditsConfig.freeUser.credits.monthlyCredits,
      },
      consumption: {
        imageGeneration: creditsConfig.consumption.imageGeneration.nanoBanana,
        videoGeneration: creditsConfig.consumption.videoGeneration.sora2,
      },
    })
  } catch (error) {
    console.error('Error fetching usage status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
