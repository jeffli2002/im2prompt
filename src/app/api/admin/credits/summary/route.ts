import { requireAdmin } from '@/lib/admin/auth';
import { db } from '@/server/db';
import { creditTransactions, generatedAsset, user, userCredits } from '@/server/db/schema';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

function getTimezoneAwareStartDate(range: string, tzOffsetMinutes: number): Date {
  const offsetMs = tzOffsetMinutes * 60 * 1000;
  const now = Date.now();
  const localNow = new Date(now - offsetMs);
  localNow.setUTCHours(0, 0, 0, 0);

  if (range !== 'today') {
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    localNow.setUTCDate(localNow.getUTCDate() - daysAgo);
  }

  return new Date(localNow.getTime() + offsetMs);
}

export async function GET(request: Request) {
  try {
    // Verify admin
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';
    const tzOffsetInput = Number.parseInt(searchParams.get('tzOffset') || '0', 10);
    const tzOffsetMinutes = Number.isFinite(tzOffsetInput) ? tzOffsetInput : 0;
    const startDate = getTimezoneAwareStartDate(range, tzOffsetMinutes);

    // Credits summary derived from actual spend transactions, grouped by feature metadata.
    // Wrap in try/catch so that transient DB/network issues don't break the admin UI.
    let summaryStats;
    try {
      summaryStats = await db.execute(sql`
        WITH spend AS (
          SELECT 
            ABS(amount) as amount,
            COALESCE(metadata, '{}')::jsonb as meta,
            description
          FROM ${creditTransactions}
          WHERE type = 'spend'
            AND created_at >= ${startDate}
        )
        SELECT 
          COALESCE(SUM(amount), 0)::int as "totalCredits",
          COALESCE(SUM(CASE WHEN meta->>'feature' = 'image-generation' OR description ILIKE 'Image generation%' THEN amount ELSE 0 END), 0)::int as "imageCredits",
          COALESCE(SUM(CASE WHEN meta->>'feature' = 'video-generation' OR description ILIKE 'Video generation%' THEN amount ELSE 0 END), 0)::int as "videoCredits"
        FROM spend
      `);
    } catch (error) {
      console.error('Error fetching credits summary (DB/network issue?):', error);
      // Fallback to zeros if the query fails
      summaryStats = { rows: [{ totalCredits: 0, imageCredits: 0, videoCredits: 0 }] };
    }

    // Get top 10 users by credit consumption
    let top10Users;
    try {
      top10Users = await db.execute(sql`
        WITH spend AS (
          SELECT 
            user_id,
            ABS(amount) as amount,
            created_at,
            COALESCE(metadata, '{}')::jsonb as meta,
            description
          FROM ${creditTransactions}
          WHERE type = 'spend'
            AND created_at >= ${startDate}
        )
        SELECT 
          u.id,
          u.email,
          u.name,
          COALESCE(SUM(sp.amount), 0)::int as total_consumed,
          COALESCE(SUM(CASE WHEN sp.meta->>'feature' = 'image-generation' OR sp.description ILIKE 'Image generation%' THEN sp.amount ELSE 0 END), 0)::int as image_credits,
          COALESCE(SUM(CASE WHEN sp.meta->>'feature' = 'video-generation' OR sp.description ILIKE 'Video generation%' THEN sp.amount ELSE 0 END), 0)::int as video_credits,
          (COALESCE(MAX(uc.balance), 0) - COALESCE(MAX(uc.frozen_balance), 0))::int as remaining
        FROM ${user} u
        LEFT JOIN spend sp ON sp.user_id = u.id
        LEFT JOIN ${userCredits} uc ON u.id = uc.user_id
        GROUP BY u.id, u.email, u.name
        HAVING COALESCE(SUM(sp.amount), 0) > 0
        ORDER BY total_consumed DESC
        LIMIT 10
      `);
    } catch (error) {
      console.error('Error fetching top 10 credit users (DB/network issue?):', error);
      // Fallback to empty list on failure
      top10Users = { rows: [] };
    }

    // Completed asset counts for context - handle case where table might not exist
    let imageGenerations = 0;
    let videoGenerations = 0;
    try {
      const generationCounts = await db.execute(sql`
        SELECT
          asset_type,
          COUNT(*)::int as count
        FROM ${generatedAsset}
        WHERE status = 'completed' AND created_at >= ${startDate}
        GROUP BY asset_type
      `);

      imageGenerations =
        generationCounts.rows.find((row) => row.asset_type === 'image')?.count ?? 0;
      videoGenerations =
        generationCounts.rows.find((row) => row.asset_type === 'video')?.count ?? 0;
    } catch (error) {
      console.error('Error fetching generation counts (generatedAsset table may not exist):', error);
      // Use default values if table doesn't exist
      imageGenerations = 0;
      videoGenerations = 0;
    }

    // Get daily generation trend based on actual assets - handle case where table might not exist
    let generationTrend;
    try {
      generationTrend = await db.execute(sql`
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(CASE WHEN asset_type = 'image' THEN 1 ELSE 0 END), 0)::int as "imageCount",
          COALESCE(SUM(CASE WHEN asset_type = 'video' THEN 1 ELSE 0 END), 0)::int as "videoCount"
        FROM ${generatedAsset}
        WHERE status = 'completed' AND created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
    } catch (error) {
      console.error('Error fetching generation trend (generatedAsset table may not exist):', error);
      // Return empty trend if table doesn't exist
      generationTrend = { rows: [] };
    }

    const response = NextResponse.json({
      summary: {
        totalConsumed: Number(summaryStats.rows[0]?.totalCredits) || 0,
        imageCredits: Number(summaryStats.rows[0]?.imageCredits) || 0,
        videoCredits: Number(summaryStats.rows[0]?.videoCredits) || 0,
        imageGenerations,
        videoGenerations,
      },
      top10Users: top10Users.rows,
      trend: generationTrend.rows,
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin credits summary error:', error);

    // Handle unauthorized explicitly
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If it's a DB/network connectivity issue (e.g., Neon ECONNRESET), return a safe fallback
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Unknown error while fetching credits summary';

    if (message.includes('fetch failed') || message.includes('ECONNRESET')) {
      console.error('Returning fallback empty credits summary due to DB/network issue.');
      return NextResponse.json(
        {
          summary: {
            totalConsumed: 0,
            imageCredits: 0,
            videoCredits: 0,
            imageGenerations: 0,
            videoGenerations: 0,
          },
          top10Users: [],
          trend: [],
          warning: 'Credits summary is temporarily unavailable due to database connectivity issues.',
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch credits summary', details: message },
      { status: 500 },
    );
  }
}
