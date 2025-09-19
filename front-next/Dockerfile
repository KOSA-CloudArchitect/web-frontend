# Next.js 앱을 위한 멀티스테이지 Dockerfile

# 1단계: 의존성 설치 및 빌드
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치 (개발 의존성도 포함하여 빌드)
RUN npm install --legacy-peer-deps --silent

# 소스 코드 복사
COPY . .

# Next.js 앱 빌드
RUN npm run build

# 2단계: 프로덕션 이미지
FROM node:20-alpine AS runner

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apk add --no-cache \
    dumb-init \
    curl

# 사용자 생성 (보안을 위해 root가 아닌 사용자로 실행)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 소유권 변경
RUN chown -R nextjs:nodejs /app
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경변수 설정
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 앱 실행
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
