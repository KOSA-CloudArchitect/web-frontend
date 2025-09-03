# KOSA Frontend

쿠팡 상품 리뷰 분석을 위한 React 프론트엔드 애플리케이션입니다.

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd kosa-frontend

# 환경 변수 설정
cp env.example .env
# .env 파일을 편집하여 필요한 설정을 변경합니다.

# 의존성 설치
npm install
```

### 2. 개발 서버 시작

```bash
# 개발 모드로 실행
npm start
```

## 📋 서비스 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001 (개발용)

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# 커버리지 포함 테스트
npm run test:coverage

# CI용 테스트
npm run test:ci
```

## 🔧 개발 도구

```bash
# 코드 린팅
npm run lint
npm run lint:fix

# 코드 포맷팅
npm run format
npm run format:check

# 타입 체크
npm run type-check

# 번들 분석
npm run analyze

# 빌드 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
frontend/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── analysis/       # 분석 관련 컴포넌트
│   │   ├── auth/          # 인증 관련 컴포넌트
│   │   ├── charts/        # 차트 컴포넌트
│   │   ├── common/        # 공통 컴포넌트
│   │   ├── layout/        # 레이아웃 컴포넌트
│   │   └── search/        # 검색 관련 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── hooks/             # 커스텀 훅
│   ├── services/          # API 서비스
│   ├── stores/            # Zustand 스토어
│   ├── types/             # TypeScript 타입 정의
│   ├── utils/             # 유틸리티 함수
│   └── mocks/             # Mock 데이터
├── Dockerfile             # Docker 설정
├── package.json           # 의존성 관리
└── README.md              # 프로젝트 문서
```

## 🛠️ 기술 스택

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **Performance**: Lighthouse CI

## 🔐 환경 변수

주요 환경 변수들:

```bash
# 애플리케이션
REACT_APP_NAME=KOSA Review Analysis
REACT_APP_ENVIRONMENT=development

# 백엔드 API
REACT_APP_API_BASE_URL=http://localhost:3001

# WebSocket
REACT_APP_WS_URL=http://localhost:3001

# 기능 플래그
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG_MODE=false
```

전체 환경 변수는 `env.example` 파일을 참고하세요.

## 🎨 주요 기능

### 분석 기능
- 상품 URL 입력 및 분석 요청
- 실시간 분석 진행 상황 표시
- 감성 분석 결과 시각화
- 키워드 클라우드 표시

### 사용자 관리
- 회원가입/로그인
- 관심 상품 관리
- 분석 히스토리

### 데이터 시각화
- 감성 분석 파이 차트
- 평점 분포 차트
- 가격 변동 차트
- 트렌드 분석

## 🐳 Docker

```bash
# Docker 이미지 빌드
docker build -t kosa-frontend .

# Docker 컨테이너 실행
docker run -p 3000:3000 --env-file .env kosa-frontend
```

## 🚀 배포

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -la build/
```

### 정적 파일 서빙

```bash
# Nginx로 서빙
docker run -p 80:80 -v $(pwd)/build:/usr/share/nginx/html nginx:alpine

# 또는 serve로 서빙
npx serve -s build -l 3000
```

## 📊 성능 최적화

- **코드 분할**: React.lazy()를 사용한 지연 로딩
- **이미지 최적화**: WebP 형식 지원
- **번들 분석**: webpack-bundle-analyzer 사용
- **캐싱**: Service Worker를 통한 오프라인 지원
- **가상화**: 대용량 리스트 가상화

## 🧪 테스트 전략

- **단위 테스트**: Jest + React Testing Library
- **통합 테스트**: MSW를 사용한 API 모킹
- **E2E 테스트**: Cypress (선택사항)
- **성능 테스트**: Lighthouse CI

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.

---

**KOSA Team** - 리뷰 분석 서비스
