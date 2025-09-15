window.__RUNTIME_CONFIG__ = {
  // 로컬 개발 환경에서 백엔드 서버로 직접 연결
  API_BASE_URL: '/api',
  WS_URL: 'ws://localhost:3001'
};

// 디버깅을 위한 로그
console.log('🔧 Runtime Config Loaded:', window.__RUNTIME_CONFIG__);
console.log('🌐 Current Location:', window.location.href);
console.log('📡 API Base URL:', window.__RUNTIME_CONFIG__.API_BASE_URL);
console.log('📡 WebSocket URL:', window.__RUNTIME_CONFIG__.WS_URL);

// EKS 환경에서 API 연결 테스트
console.log('🔍 EKS 환경 API 연결 테스트 시작...');

// 1. 현재 환경 정보
console.log('🔍 환경 정보:', {
  hostname: window.location.hostname,
  port: window.location.port,
  protocol: window.location.protocol,
  pathname: window.location.pathname,
  search: window.location.search
});

// 2. API URL 구성 요소 분석
const apiUrl = new URL(window.__RUNTIME_CONFIG__.API_BASE_URL, window.location.origin);
console.log('🔍 API URL 분석:', {
  protocol: apiUrl.protocol,
  hostname: apiUrl.hostname,
  port: apiUrl.port,
  pathname: apiUrl.pathname,
  fullUrl: apiUrl.href
});

// 3. 네트워크 연결 테스트
fetch('/api/health', { 
  method: 'GET',
  mode: 'cors'
})
.then(response => {
  console.log('✅ API 서버 연결 성공:', response.status);
})
.catch(error => {
  console.error('❌ API 서버 연결 실패:', error.message);
  console.log('💡 연결 실패 원인 분석:');
  console.log('   - CORS 정책 문제일 수 있음');
  console.log('   - 네트워크 방화벽 문제일 수 있음');
  console.log('   - 로드밸런서 설정 문제일 수 있음');
  console.log('   - 백엔드 서비스가 실행되지 않았을 수 있음');
});
