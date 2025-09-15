import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: '이미지 URL이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log(`🖼️ 이미지 프록시 요청: ${imageUrl}`);

    // URL 유효성 검사
    let targetUrl: URL;
    try {
      targetUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 이미지 URL입니다.' },
        { status: 400 }
      );
    }

    // 허용된 도메인만 프록시
    const allowedDomains = [
      'coupangcdn.com',
      'thumbnail.coupangcdn.com',
      'thumbnail1.coupangcdn.com',
      'thumbnail2.coupangcdn.com',
      'thumbnail3.coupangcdn.com',
      'thumbnail4.coupangcdn.com',
      'thumbnail5.coupangcdn.com',
      'thumbnail6.coupangcdn.com',
      'thumbnail7.coupangcdn.com',
      'thumbnail8.coupangcdn.com',
      'thumbnail9.coupangcdn.com',
      'www.coupang.com',
    ];

    if (!allowedDomains.some(domain => targetUrl.hostname.includes(domain))) {
      return NextResponse.json(
        { success: false, message: '허용되지 않은 이미지 도메인입니다.' },
        { status: 403 }
      );
    }

    // 이미지 요청
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.coupang.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      // 타임아웃 설정 (5초)
      signal: AbortSignal.timeout(5000),
    });

    if (!imageResponse.ok) {
      console.error(`❌ 이미지 로드 실패: ${imageResponse.status} ${imageResponse.statusText}`);
      return NextResponse.json(
        { 
          success: false, 
          message: `이미지 로드 실패: ${imageResponse.status}`,
          error: `Image server returned ${imageResponse.status}`
        },
        { status: imageResponse.status }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    console.log(`✅ 이미지 프록시 성공: ${imageBuffer.byteLength} bytes, ${contentType}`);

    // 이미지 데이터를 그대로 반환
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ 이미지 프록시 오류:', error);
    
    // 타임아웃 오류 처리
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false, 
          message: '이미지 로드 시간이 초과되었습니다.',
          error: 'Request timeout'
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: '이미지 프록시 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


