module.exports = {
  apps: [{
    name: "backend",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 3001,
      // 필요한 환경 변수 추가
      DB_HOST: "your-db-host",
      DB_USER: "your-db-user",
      DB_PASSWORD: "your-db-password",
      DB_NAME: "your-db-name"
    }
  }]
} 