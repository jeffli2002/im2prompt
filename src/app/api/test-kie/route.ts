/**
 * KIE API 测试端点
 * 用于诊断 KIE API 连接和上传问题
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const kieApiKey = process.env.KIE_API_KEY;
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: [] as any[]
  };

  // 测试 1: API Key 配置检查
  results.tests.push({
    name: 'API Key Configuration',
    status: kieApiKey ? 'PASS' : 'FAIL',
    details: {
      configured: !!kieApiKey,
      keyPrefix: kieApiKey ? kieApiKey.substring(0, 10) + '...' : 'NOT SET',
      keyLength: kieApiKey?.length || 0
    }
  });

  if (!kieApiKey) {
    return NextResponse.json({
      success: false,
      message: 'KIE_API_KEY not configured',
      results
    });
  }

  // 测试 2: KIE API 连通性测试
  try {
    console.log('[test-kie] Testing KIE API connectivity...');
    const userInfoResponse = await fetch('https://api.kie.ai/api/v1/user/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
      },
    });

    const userInfoText = await userInfoResponse.text();
    let userInfoData: any = {};
    try {
      userInfoData = JSON.parse(userInfoText);
    } catch (e) {
      userInfoData = { rawText: userInfoText };
    }

    results.tests.push({
      name: 'API Connectivity',
      status: userInfoResponse.ok ? 'PASS' : 'FAIL',
      details: {
        httpStatus: userInfoResponse.status,
        httpStatusText: userInfoResponse.statusText,
        responseData: userInfoData
      }
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json({
        success: false,
        message: 'KIE API authentication failed',
        results
      });
    }
  } catch (error: any) {
    results.tests.push({
      name: 'API Connectivity',
      status: 'ERROR',
      details: {
        error: error.message,
        stack: error.stack
      }
    });
  }

  // 测试 3: 文件上传测试（使用极小的测试图片）
  try {
    console.log('[test-kie] Testing file upload...');
    
    // 创建一个 1x1 像素的 PNG 图片（最小有效图片）
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');
    
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, 'test.png');

    // 测试多个可能的上传端点
    const uploadEndpoints = [
      'https://api.kie.ai/v1/files/upload',
      'https://api.kie.ai/api/v1/files/upload',
      'https://api.kie.ai/v1/file/upload',
      'https://api.kie.ai/api/v1/file/upload',
      'https://api.kie.ai/v1/upload',
    ];
    
    const uploadResults: any[] = [];
    
    for (const endpoint of uploadEndpoints) {
      try {
        console.log(`[test-kie] Testing endpoint: ${endpoint}`);
        const uploadResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${kieApiKey}`,
          },
          body: formData,
        });

        const uploadText = await uploadResponse.text();
        let uploadData: any = {};
        try {
          uploadData = JSON.parse(uploadText);
        } catch (e) {
          uploadData = { rawText: uploadText };
        }

        uploadResults.push({
          endpoint,
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          ok: uploadResponse.ok,
          response: uploadData
        });
        
        // 如果成功，停止测试
        if (uploadResponse.ok) {
          break;
        }
      } catch (error: any) {
        uploadResults.push({
          endpoint,
          error: error.message
        });
      }
    }

    const successfulEndpoint = uploadResults.find(r => r.ok);
    
    results.tests.push({
      name: 'File Upload - Multiple Endpoints',
      status: successfulEndpoint ? 'PASS' : 'FAIL',
      details: {
        testedEndpoints: uploadResults.length,
        successfulEndpoint: successfulEndpoint?.endpoint,
        allResults: uploadResults,
        testImageSize: testImageBuffer.length,
        recommendation: successfulEndpoint 
          ? `Use endpoint: ${successfulEndpoint.endpoint}`
          : 'All tested endpoints failed. Check API documentation or contact KIE support.'
      }
    });

    if (!successfulEndpoint) {
      console.error('[test-kie] All upload endpoints failed');
    }
  } catch (error: any) {
    results.tests.push({
      name: 'File Upload',
      status: 'ERROR',
      details: {
        error: error.message,
        stack: error.stack
      }
    });
  }

  const allPassed = results.tests.every(t => t.status === 'PASS');

  return NextResponse.json({
    success: allPassed,
    message: allPassed ? 'All tests passed' : 'Some tests failed',
    summary: {
      total: results.tests.length,
      passed: results.tests.filter(t => t.status === 'PASS').length,
      failed: results.tests.filter(t => t.status === 'FAIL').length,
      errors: results.tests.filter(t => t.status === 'ERROR').length
    },
    results
  }, {
    status: allPassed ? 200 : 500
  });
}
