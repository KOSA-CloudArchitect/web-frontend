// 런타임 환경변수 타입 정의
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      API_BASE_URL?: string;
      WS_URL?: string;
      APP_ENV?: string;
    };
  }
}

// 런타임 환경변수 지원 (Docker 컨테이너에서 /env.js로 주입)
const getRuntimeConfig = () => {
  // @ts-expect-error - window.__RUNTIME_CONFIG__는 런타임에 주입됨
  return (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__) || {};
};

export const getApiBaseUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  
  // 런타임 환경변수만 사용 (빌드타임 환경변수 완전 무시)
  if (runtimeConfig.API_BASE_URL) {
    console.log('✅ Using runtime API_BASE_URL:', runtimeConfig.API_BASE_URL);
    return runtimeConfig.API_BASE_URL;
  }
  
  // 런타임 환경변수가 없으면 기본값 사용: 상대 경로로 프록시/Ingress를 통과
  const defaultUrl = '/api';
  console.log('⚠️ Using default API_BASE_URL (relative):', defaultUrl);
  return defaultUrl;
};

export const getWebSocketUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  
  // 런타임 환경변수만 사용 (빌드타임 환경변수 완전 무시)
  if (runtimeConfig.WS_URL) {
    // Socket.IO가 자동으로 /socket.io 경로를 추가하므로, URL에서 /socket.io 제거
    let wsUrl = runtimeConfig.WS_URL;
    if (wsUrl.endsWith('/socket.io')) {
      wsUrl = wsUrl.replace('/socket.io', '');
    }
    console.log('✅ Using runtime WS_URL (cleaned):', wsUrl);
    return wsUrl;
  }
  
  // 런타임 환경변수가 없으면 기본값 사용: 현재 도메인 사용
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const scheme = isHttps ? 'wss' : 'ws';
    const defaultUrl = `${scheme}://${window.location.host}`;
    console.log('⚠️ Using default WS_URL (current host):', defaultUrl);
    return defaultUrl;
  }
  
  // 서버사이드 렌더링시 기본값
  const defaultUrl = '';
  console.log('⚠️ Using default WS_URL (SSR fallback):', defaultUrl);
  return defaultUrl;
};

// 디버깅용 로그 (클라이언트 사이드에서만 실행)
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration Debug:', {
    runtimeConfigExists: !!window.__RUNTIME_CONFIG__,
    runtimeConfig: getRuntimeConfig(),
    finalApiUrl: getApiBaseUrl(),
    finalWsUrl: getWebSocketUrl(),
    timestamp: new Date().toISOString()
  });
}