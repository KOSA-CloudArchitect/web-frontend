// Jenkinsfile (Final Version for Frontend Monorepo)

pipeline {
    agent {
        kubernetes {
            cloud 'kubernetes'
            yamlFile 'pod-template.yaml'
        }
    }

    environment {
        AWS_ACCOUNT_ID    = '914215749228'
        AWS_REGION        = 'ap-northeast-2'
        ECR_REGISTRY      = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        ECR_REPOSITORY    = 'web-server-frontend'
        INFRA_REPO_URL    = 'git@github.com:KOSA-CloudArchitect/infra.git'
        GITHUB_REPO       = 'https://github.com/KOSA-CloudArchitect/web-frontend'
    }

    stages {
        // Stage 1: 모든 브랜치에서 공통으로 변수 초기화
        stage('⚙️ Initialize') {
            steps {
                script {
                    env.COMMIT_HASH        = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.GITHUB_COMMIT_URL  = "${env.GITHUB_REPO}/commit/${env.COMMIT_HASH}"
                }
            }
        }

        // Stage 2: develop 브랜치 및 PR에서 코드 및 빌드 검증
        stage('✅ Verification & Build Check') {
            when {
                anyOf {
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                // 'front-next' 폴더로 이동하여 빌드 수행
                dir('front-next') {
                    container('node') {
                        echo "Running clean install and build for front-next..."
                        sh 'npm install'
                        sh 'npm run build'
                    }
                }
                container('podman') {
                    echo "Verifying Docker build for front-next..."
                    // 빌드 컨텍스트와 Dockerfile 경로를 'front-next'로 지정
                    sh "podman build -t frontend-build-test -f front-next/Dockerfile ."
                }
            }
        }

        // Stage 3 & 4: main 브랜치에서만 실제 빌드, 푸시, 배포
        stage('🚀 Build & Push to ECR') {
            when { branch 'main' }
            steps {
                script {
                    env.FULL_IMAGE_NAME    = "${ECR_REGISTRY}/${ECR_REPOSITORY}:${COMMIT_HASH}"

                    // main 브랜치에서도 빌드는 필요
                    dir('front-next') {
                        container('node') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }

                    def ecrPassword = container('aws-cli') {
                        withCredentials([aws(credentialsId: 'aws-credentials-manual-test')]) {
                            return sh(script: "aws ecr get-login-password --region ${AWS_REGION}", returnStdout: true).trim()
                        }
                    }

                    container('podman') {
                        sh "echo '${ecrPassword}' | podman login --username AWS --password-stdin ${ECR_REGISTRY}"
                        // 빌드 컨텍스트와 Dockerfile 경로를 'front-next'로 지정
                        sh "podman build -t ${FULL_IMAGE_NAME} -f front-next/Dockerfile ."
                        sh "podman push ${FULL_IMAGE_NAME}"
                    }
                    echo "Successfully pushed image: ${FULL_IMAGE_NAME}"
                }
            }
        }

        stage('🌐 Update Infra Repository') {
            when { branch 'main' }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'github-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        set -e
                        export GIT_SSH_COMMAND="ssh -i $SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"
                        
                        git clone ${INFRA_REPO_URL} infra_repo
                        cd infra_repo
                        
                        git config user.email "jenkins-ci@example.com"
                        git config user.name "Jenkins CI"
                        
                        # Kustomization 파일에서 frontend 이미지의 태그를 업데이트
                        KUSTOMIZE_FILE="kubernetes/namespaces/web-tier,cache-tier/04-applications/kustomization.yaml"
                        
                        # sed 명령어를 사용하여 frontend-placeholder 이미지의 newTag 값을 변경
                        # 이미지 이름(newName)을 기준으로 정확한 라인을 찾아 수정
                        sed -i "/name: frontend-placeholder/,/newTag/ s/newTag: .*/newTag: ${COMMIT_HASH}/" ${KUSTOMIZE_FILE}
                        
                        git add ${KUSTOMIZE_FILE}
                        git commit -m "Update frontend image tag to ${COMMIT_HASH}" || echo "No changes to commit"
                        git push origin main
                    '''
                }
            }
        }
    }

    // 빌드 후 작업: 프론트엔드용 Discord 알림
    post {
        always {
            cleanWs()
        }
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    discordSend(
                        description: "✅ 프론트엔드 CI/CD 파이프라인 성공!\n\n📌 이미지: `${env.FULL_IMAGE_NAME}`\n🔗 GitHub Commit: [${env.COMMIT_HASH}](${env.GITHUB_COMMIT_URL})",
                        footer: "빌드 번호: ${env.BUILD_NUMBER}",
                        link: env.BUILD_URL,
                        result: currentBuild.currentResult,
                        title: "프론트엔드 Jenkins Job [MAIN]",
                        webhookURL: "https://discord.com/api/webhooks/1415897323028086804/4FgLSXOR5RU25KqJdK8MSgoAjxAabGzluiNpP44pBGWAWXcVBOfMjxyu0pmPpmqEO5sa"
                    )
                } else if (env.BRANCH_NAME == 'develop') {
                    discordSend(
                        description: "✅ develop 브랜치에서 빌드가 성공했습니다.",
                        footer: "빌드 번호: ${env.BUILD_NUMBER}",
                        link: env.BUILD_URL,
                        result: currentBuild.currentResult,
                        title: "프론트엔드 Jenkins Job [DEVELOP]",
                        webhookURL: "https://discord.com/api/webhooks/1415897323028086804/4FgLSXOR5RU25KqJdK8MSgoAjxAabGzluiNpP44pBGWAWXcVBOfMjxyu0pmPpmqEO5sa"
                    )
                }
            }
        }
        failure {
            discordSend(
                description: "❌ 프론트엔드 CI/CD 파이프라인 실패\n\n- 브랜치: `${env.BRANCH_NAME}`\n🔗 GitHub Commit: [${env.COMMIT_HASH}](${env.GITHUB_COMMIT_URL})",
                footer: "빌드 번호: ${env.BUILD_NUMBER}",
                link: env.BUILD_URL,
                result: currentBuild.currentResult,
                title: "프론트엔드 Jenkins Job",
                webhookURL: "https://discord.com/api/webhooks/1415897323028086804/4FgLSXOR5RU25KqJdK8MSgoAjxAabGzluiNpP44pBGWAWXcVBOfMjxyu0pmPpmqEO5sa"
            )
        }
    }
}
