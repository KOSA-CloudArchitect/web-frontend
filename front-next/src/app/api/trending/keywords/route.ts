import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 
  process.env.BACKEND_SERVICE_SERVICE_HOST ? 
    `http://${process.env.BACKEND_SERVICE_SERVICE_HOST}:${process.env.BACKEND_SERVICE_SERVICE_PORT || 3001}` :
    'http://review-analysis-web-alb-2002000396.ap-northeast-2.elb.amazonaws.com';

export async function GET(request: NextRequest) {
  try {
    console.log('🔥 인기 키워드 요청');

    // 백엔드 서버로 요청 전달
    const backendUrl = `${BACKEND_URL}/api/trending/keywords`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js Frontend',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`❌ 백엔드 인기 키워드 실패: ${response.status}`);
      return NextResponse.json(
        { 
          success: false, 
          message: `인기 키워드 서버 오류: ${response.status}`,
          error: `Backend returned ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ 인기 키워드 성공: ${data.data?.length || 0}개`);

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ 인기 키워드 API 오류:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false, 
          message: '인기 키워드 요청 시간이 초과되었습니다.',
          error: 'Request timeout'
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: '인기 키워드 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


