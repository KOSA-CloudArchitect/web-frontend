import { NextRequest, NextResponse } from 'next/server';

// 백엔드 서버 URL (클러스터 내부 서비스 우선, 그 다음 외부 ALB)
const BACKEND_URL = process.env.BACKEND_URL || 
  process.env.BACKEND_SERVICE_SERVICE_HOST ? 
    `http://${process.env.BACKEND_SERVICE_SERVICE_HOST}:${process.env.BACKEND_SERVICE_SERVICE_PORT || 3001}` :
    'http://review-analysis-web-alb-2002000396.ap-northeast-2.elb.amazonaws.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    if (!query) {
      return NextResponse.json(
        { success: false, message: '검색어가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`🔍 검색 요청: "${query}", 페이지: ${page}, 제한: ${limit}`);

    // 백엔드 서버로 검색 요청 전달 (products 엔드포인트 사용)
    const backendUrl = `${BACKEND_URL}/api/products?q=${encodeURIComponent(query)}&page=${page}&page_size=${limit}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js Frontend',
      },
      // 타임아웃 설정 (10초)
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`❌ 백엔드 검색 실패: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          success: false, 
          message: `검색 서버 오류: ${response.status}`,
          error: `Backend returned ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ 검색 성공: ${data.data?.length || 0}개 상품`);

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ 검색 API 오류:', error);
    
    // 타임아웃 오류 처리
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false, 
          message: '검색 요청 시간이 초과되었습니다. 다시 시도해주세요.',
          error: 'Request timeout'
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: '검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔄 Next.js API Route: Proxying search POST request to backend', {
      backendUrl: `${BACKEND_URL}/api/products`,
      body
    });

    // 백엔드로 POST 요청 전달 (products 엔드포인트 사용)
    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js Frontend',
      },
      body: JSON.stringify(body),
      // 타임아웃 설정 (60초 - 크롤링은 시간이 오래 걸릴 수 있음)
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      console.error(`❌ 백엔드 검색 POST 실패: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          success: false, 
          message: `검색 서버 오류: ${response.status}`,
          error: `Backend returned ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ 검색 POST 성공:`, data);

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ 검색 POST API 오류:', error);
    
    // 타임아웃 오류 처리
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false, 
          message: '검색 요청 시간이 초과되었습니다. 다시 시도해주세요.',
          error: 'Request timeout'
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: '검색 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


