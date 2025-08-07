// Jenkinsfile
// 이 파일은 GitHub 저장소의 루트(root)에 위치해야 합니다.

pipeline {
    agent any

    environment {
        GCP_PROJECT_ID = 'kwon-cicd' // <<--- GCP 프로젝트 ID로 변경
        GCP_REGION     = 'asia-northeast3'     // <<--- GCP 리전으로 변경
        # --- GCR/Artifact Registry 정보로 변경 ---
        GCR_REGISTRY_HOST = "${GCP_REGION}-docker.pkg.dev" // 또는 "gcr.io"
        GCR_REPO_NAME = "my-web-app-repo/web-server-backend" // 리포지토리명/이미지명
        # ---
        
        # Dockerfile이 있는 디렉토리 경로 (web-server 저장소 루트 기준)
        APP_SOURCE_DIR = 'backend'             

        # Helm Chart가 있는 디렉토리 경로 (web-server 저장소 루트 기준)
        HELM_CHART_PATH = 'helm-chart/my-web-app'

        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        GITHUB_ORG     = 'KOSA-CloudArchitect'
        GITHUB_REPO    = 'web-server'
        GITHUB_BRANCH  = 'main'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo "Cloning repository ${GITHUB_ORG}/${GITHUB_REPO} branch ${GITHUB_BRANCH}"
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dir("${APP_SOURCE_DIR}") {
                        // 이미지 이름을 GCR/Artifact Registry 경로로 직접 지정
                        sh "docker build -t ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}:${IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Push Docker Image to Artifact Registry') {
            steps {
                script {
                    // gcloud CLI를 사용하여 Docker 인증
                    # Jenkins VM에 gcloud CLI가 설치되어 있어야 합니다.
                    # 그리고 Jenkins Job이 gcloud auth activate-service-account를 통해
                    # GCP 서비스 계정으로 인증되어 있어야 합니다.
                    sh "gcloud auth configure-docker ${GCR_REGISTRY_HOST}"
                    sh "docker push ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}:${IMAGE_TAG}"
                    echo "Docker image pushed to Artifact Registry: ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Update Helm Chart Manifest & Push to GitHub') {
            steps {
                script {
                    sh "git config user.email 'jenkins@${GITHUB_ORG}.com'"
                    sh "git config user.name 'Jenkins CI Automation'"

                    # Helm Chart values.yaml 파일의 이미지 태그 및 레포지토리 경로 업데이트
                    # sed 명령어를 사용하여 repository와 tag를 동시에 변경하도록 수정
                    sh "sed -i 's|repository: .*|repository: ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}|' ${HELM_CHART_PATH}/values.yaml"
                    sh "sed -i 's|tag: \".*\"|tag: \"${IMAGE_TAG}\"|' ${HELM_CHART_PATH}/values.yaml"
                    echo "Updated Helm Chart image tag in ${HELM_CHART_PATH}/values.yaml to ${IMAGE_TAG}"

                    sh "git add ${HELM_CHART_PATH}/values.yaml"
                    sh "git commit -m 'Update ${GCR_REPO_NAME} image tag to ${IMAGE_TAG} by Jenkins build #${env.BUILD_NUMBER}'"
                    
                    withCredentials([string(credentialsId: 'github-pat-token')]) {
                        sh "git push https://${GITHUB_USER}:${env.SECRET}@github.com/${GITHUB_ORG}/${GITHUB_REPO}.git HEAD:${GITHUB_BRANCH}"
                    }
                    echo "Helm Chart updated and pushed to GitHub."
                }
            }
        }
    }

    post {
        always { cleanWs() }
        failure { echo 'CI/CD Pipeline failed!' }
        success { echo 'CI/CD Pipeline completed successfully! Argo CD should now deploy.' }
    }
}
