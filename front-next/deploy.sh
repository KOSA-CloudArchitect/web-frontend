#!/bin/bash

# 프론트엔드 빌드
echo "Building frontend..."
npm run build

# 프론트엔드 배포
echo "Deploying frontend..."
scp -i your-key.pem -r build/* ec2-user@bastion-host-ip:/tmp/
ssh -i your-key.pem ec2-user@bastion-host-ip "ssh -i your-key.pem ec2-user@frontend-private-ip 'sudo cp -r /tmp/* /usr/share/nginx/html/'"

# 백엔드 배포
echo "Deploying backend..."
scp -i your-key.pem -r backend/* ec2-user@bastion-host-ip:/tmp/
ssh -i your-key.pem ec2-user@bastion-host-ip "ssh -i your-key.pem ec2-user@backend-private-ip 'cp -r /tmp/* /home/ec2-user/app/'"

# 백엔드 서버 재시작
echo "Restarting backend server..."
ssh -i your-key.pem ec2-user@bastion-host-ip "ssh -i your-key.pem ec2-user@backend-private-ip 'cd /home/ec2-user/app && npm install && pm2 restart all || pm2 start npm --name \"backend\" -- start'"

echo "Deployment completed!" 