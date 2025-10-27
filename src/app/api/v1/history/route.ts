import { auth } from '@/lib/auth/auth';
import { historyService } from '@/server/services/history-service';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isEnabled = await historyService.isHistoryFeatureEnabled();
    if (!isEnabled) {
      return NextResponse.json({ error: 'History feature is not enabled' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const contentType = searchParams.get('contentType') as
      | 'image_to_prompt'
      | 'image_generation'
      | 'video_generation'
      | undefined;
    const status = searchParams.get('status') as
      | 'processing'
      | 'completed'
      | 'failed'
      | 'expired'
      | undefined;
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);

    if (limit > 100) {
      return NextResponse.json({ error: 'Limit cannot exceed 100' }, { status: 400 });
    }

    const result = await historyService.getHistory({
      userId: session.user.id,
      contentType,
      status,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const historyId = searchParams.get('id');

    if (!historyId) {
      return NextResponse.json({ error: 'History ID is required' }, { status: 400 });
    }

    const deleted = await historyService.deleteHistory(historyId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting history:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (error instanceof Error && error.message === 'History not found') {
      return NextResponse.json({ error: 'History not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
}
