import { NextRequest, NextResponse } from 'next/server';

const COZE_API_KEY = process.env.COZE_API_KEY;

export async function GET(req: NextRequest) {
  try {
    if (!COZE_API_KEY) {
      return NextResponse.json(
        { error: 'COZE_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Test basic Coze API authentication
    const testUrl = 'https://api.coze.cn/open_api/v2/user/info';
    
    console.log('Testing Coze API authentication with key:', COZE_API_KEY.substring(0, 10) + '...');

    const cozeResponse = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await cozeResponse.text();
    console.log('Coze API auth response status:', cozeResponse.status);
    console.log('Coze API auth response:', responseText);

    if (!cozeResponse.ok) {
      return NextResponse.json(
        { 
          error: 'Coze API authentication failed',
          status: cozeResponse.status,
          response: responseText
        },
        { status: 500 }
      );
    }

    const cozeData = JSON.parse(responseText);
    
    return NextResponse.json({
      success: true,
      message: 'Coze API authentication successful',
      data: cozeData
    });

  } catch (error) {
    console.error('Coze API auth test error:', error);
    return NextResponse.json(
      { error: 'Coze API auth test failed', details: error },
      { status: 500 }
    );
  }
}
