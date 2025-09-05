# =========================
# 1) Install deps
# =========================
FROM node:20-alpine AS deps
WORKDIR /app

# 기본 유틸
RUN apk add --no-cache libc6-compat

# npm 동작 최적화/안정 옵션
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    CI=true

# 의존성 전용 레이어 (캐시 최적화)
COPY package.json package-lock.json* ./

# lock 불일치/peer 충돌 회피
# - devDependencies 포함(React 빌드에 typescript 등 필요할 수 있음)
RUN npm install --legacy-peer-deps && npm cache clean --force

# =========================
# 2) Build (React)
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# CRA/일반 리액트 빌드에서 소스맵 비활성 (용량 절감)
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# 앱 빌드
RUN npm run build

# =========================
# 3) Runtime (nginx-unprivileged)
# =========================
FROM nginxinc/nginx-unprivileged:stable-alpine AS runner
WORKDIR /usr/share/nginx/html

# 정적 산출물 복사
COPY --from=builder /app/build .

USER root

# Nginx 설정
RUN mkdir -p /etc/nginx/conf.d && cat >/etc/nginx/conf.d/default.conf <<'NGINX'
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    server_tokens off;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss image/svg+xml;

    # 헬스체크 (K8s/ALB)
    location = /health {
        access_log off;
        add_header Content-Type text/plain;
        return 200 'ok';
    }

    # 런타임 환경(env.js)은 캐시 금지 (ConfigMap로 마운트됨)
    location = /env.js {
        add_header Cache-Control "no-store";
        try_files $uri =404;
    }

    # 정적 리소스 캐시
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback
    location / {
        try_files $uri /index.html;
    }

    # Ingress가 /api, /socket.io 라우팅 → 내부 프록시 불필요
    # 필요 시 테스트용으로만 사용
    # location /api {
    #     proxy_pass http://backend-service.web-tier.svc.cluster.local:3001;
    #     proxy_http_version 1.1;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    # }
}
NGINX

# 비루트 실행
USER 101
EXPOSE 8080

# (선택) 컨테이너 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
