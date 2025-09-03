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
  // @ts-ignore - window.__RUNTIME_CONFIG__는 런타임에 주입됨
  return window.__RUNTIME_CONFIG__ || {};
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
    console.log('✅ Using runtime WS_URL:', runtimeConfig.WS_URL);
    return runtimeConfig.WS_URL;
  }
  
  // 런타임 환경변수가 없으면 기본값 사용: 현재 호스트 기반으로 구성
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const scheme = isHttps ? 'wss' : 'ws';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost';
  const defaultUrl = `${scheme}://${host}/ws`;
  console.log('⚠️ Using default WS_URL (derived):', defaultUrl);
  return defaultUrl;
};

// 디버깅용 로그
console.log('🔧 API Configuration Debug:', {
  runtimeConfigExists: !!window.__RUNTIME_CONFIG__,
  runtimeConfig: getRuntimeConfig(),
  finalApiUrl: getApiBaseUrl(),
  finalWsUrl: getWebSocketUrl(),
  timestamp: new Date().toISOString()
});