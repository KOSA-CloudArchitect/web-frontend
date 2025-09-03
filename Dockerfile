# =========================
# 1) Build (React)
# =========================
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# =========================
# 2) Runtime (nginx-unprivileged)
# =========================
FROM nginxinc/nginx-unprivileged:stable-alpine AS runner
WORKDIR /usr/share/nginx/html

# React 정적 파일 복사
COPY --from=builder /app/build .

USER root

# Nginx 설정을 heredoc으로 한 번에 작성
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

    # ⚠️ Ingress가 /api, /socket.io 라우팅 하므로 컨테이너 내부 프록시는 불필요
    # 필요 시 테스트 용으로만 사용하세요.
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

USER 101
EXPOSE 8080