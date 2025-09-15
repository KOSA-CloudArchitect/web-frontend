import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 
  process.env.BACKEND_SERVICE_SERVICE_HOST ? 
    `http://${process.env.BACKEND_SERVICE_SERVICE_HOST}:${process.env.BACKEND_SERVICE_SERVICE_PORT || 3001}` :
    'http://review-analysis-web-alb-2002000396.ap-northeast-2.elb.amazonaws.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productUrl, userId = 'anonymous' } = body;

    if (!productId || !productUrl) {
      return NextResponse.json(
        { success: false, message: '상품 ID와 URL이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`🔄 분석 요청: ${productId}, ${productUrl}`);

    // 백엔드 서버로 분석 요청 전달
    const backendUrl = `${BACKEND_URL}/api/analyze/airflow/single`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js Frontend',
      },
      body: JSON.stringify({ productId, productUrl, userId }),
      signal: AbortSignal.timeout(30000), // 분석 요청은 30초 타임아웃
    });

    if (!response.ok) {
      console.error(`❌ 백엔드 분석 요청 실패: ${response.status}`);
      return NextResponse.json(
        { 
          success: false, 
          message: `분석 서버 오류: ${response.status}`,
          error: `Backend returned ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ 분석 요청 성공:`, data);

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ 분석 요청 API 오류:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false, 
          message: '분석 요청 시간이 초과되었습니다.',
          error: 'Request timeout'
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: '분석 요청 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


