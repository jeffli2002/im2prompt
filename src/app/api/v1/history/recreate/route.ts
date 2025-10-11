import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { historyService } from '@/server/services/history-service';
import { creditService } from '@/lib/credits/credit-service';
import { getModelCost } from '@/config/credits.config';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { historyId } = body;

    if (!historyId) {
      return NextResponse.json(
        { error: 'History ID is required' },
        { status: 400 }
      );
    }

    const history = await historyService.getHistoryById(historyId, session.user.id);

    if (!history) {
      return NextResponse.json(
        { error: 'History not found' },
        { status: 404 }
      );
    }

    if (history.status === 'expired') {
      return NextResponse.json(
        { error: 'Cannot recreate expired content' },
        { status: 400 }
      );
    }

    let creditsRequired = 0;
    
    switch (history.contentType) {
      case 'image_to_prompt':
        creditsRequired = getModelCost('imageToPrompt', history.modelStyle || 'general');
        break;
      case 'image_generation':
        creditsRequired = getModelCost('imageGeneration', history.modelStyle || 'general');
        break;
      case 'video_generation':
        creditsRequired = getModelCost('videoGeneration', history.modelStyle || 'sora2');
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    const userCredits = await creditService.getUserCredits(session.user.id);
    
    if (userCredits.balance < creditsRequired) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          required: creditsRequired,
          available: userCredits.balance
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      success: true,
      history: {
        id: history.id,
        contentType: history.contentType,
        promptText: history.promptText,
        negativePrompt: history.negativePrompt,
        modelStyle: history.modelStyle,
        creditsRequired,
      },
      message: 'You can now recreate this content. Use the original endpoint with these parameters.',
    });
  } catch (error) {
    console.error('Error recreating from history:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === 'History not found') {
      return NextResponse.json(
        { error: 'History not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to recreate from history' },
      { status: 500 }
    );
  }
}
