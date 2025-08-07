// Jenkinsfile
// 이 파일은 GitHub 저장소의 루트(root)에 위치해야 합니다.

pipeline {
    agent any

    environment {
        GCP_PROJECT_ID = 'kwon-cicd' // GCP 프로젝트 ID (이미 맞게 설정됨)
        GCP_REGION     = 'asia-northeast3'     // GCP 리전 (이미 맞게 설정됨)

        // GCP 서비스 계정 키 파일의 경로 (Jenkins VM 내의 절대 경로)
        // 새로운 키 파일명과 경로로 정확히 설정해야 합니다.
        GCP_KEY_FILE   = '/home/kwon/kwon-cicd-ddec4bdb866f.json' // <<--- 이 줄을 추가했습니다.

        // --- GCR/Artifact Registry 정보 ---
        GCR_REGISTRY_HOST = "${GCP_REGION}-docker.pkg.dev" // Artifact Registry 사용 시 이대로 두세요.
        GCR_REPO_NAME = "my-web-app-repo/web-server-backend" // Artifact Registry 리포지토리명/이미지명 확인

        // Dockerfile이 있는 디렉토리 경로 (web-server 저장소 루트 기준)
        APP_SOURCE_DIR = 'backend' // 팀원 분의 Dockerfile이 있는 실제 경로가 'backend'라면 이대로 두세요.

        // Helm Chart가 있는 디렉토리 경로 (web-server 저장소 루트 기준)
        HELM_CHART_PATH = 'helm-chart/my-web-app'

        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        GITHUB_ORG     = 'KOSA-CloudArchitect' // GitHub 조직/사용자명 (이대로 두시면 됩니다.)
        GITHUB_REPO    = 'web-server'
        GITHUB_BRANCH  = 'main'               // 작업할 Git 브랜치

        // GitHub User 변수 추가: 'git push' 시 필요합니다.
        // GitHub 로그인 ID (GitHub PAT를 발급받은 계정의 ID)
        GITHUB_USER    = 'your-github-username' // <<--- 여러분의 GitHub 로그인 ID (사용자명)으로 변경하세요!
    }

    stages {
        stage('Initialize GCP Auth') {
            steps {
                script {
                    echo "Activating GCP service account credentials..."
                    //sh "export PATH=${PATH}:/usr/bin"
                    sh "/usr/bin/gcloud auth activate-service-account --key-file=${GCP_KEY_FILE} --project=${GCP_PROJECT_ID}"
                    // (선택 사항: GKE 클러스터 자격 증명도 미리 가져올 수 있음)
                    // sh "gcloud container clusters get-credentials ${env.GKE_CLUSTER_NAME} --region ${env.GCP_REGION} --project ${env.GCP_PROJECT_ID}"
                }
            }
        }

        stage('Checkout Source Code') {
            steps {
                echo "Cloning repository ${GITHUB_ORG}/${GITHUB_REPO} branch ${GITHUB_BRANCH}"
                // Jenkins Job 설정에서 SCM으로 Git을 연결하면 자동 처리됩니다.
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dir("${APP_SOURCE_DIR}") {
                        sh "docker build -t ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}:${IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Push Docker Image to Artifact Registry') {
            steps {
                script {
                    // gcloud auth activate-service-account가 이미 선행되었으므로 여기서는 docker 인증만 필요합니다.
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

                    sh "sed -i 's|repository: .*|repository: ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}|' ${HELM_CHART_PATH}/values.yaml"
                    sh "sed -i 's|tag: \".*\"|tag: \"${IMAGE_TAG}\"|' ${HELM_CHART_PATH}/values.yaml"
                    echo "Updated Helm Chart image tag in ${HELM_CHART_PATH}/values.yaml to ${IMAGE_TAG}"

                    sh "git add ${HELM_CHART_PATH}/values.yaml"
                    sh "git commit -m 'Update ${GCR_REPO_NAME} image tag to ${IMAGE_TAG} by Jenkins build #${env.BUILD_NUMBER}'"
                    
                    // GITHUB_USER 변수를 사용하여 GitHub PAT와 함께 푸시합니다.
                    withCredentials([string(credentialsId: 'github-pat-token')]) {
                        sh "git push https://${GITHUB_USER}:${env.SECRET}@github.com/${GITHUB_ORG}/${GITHUB_REPO}.git HEAD:${GITHUB_BRANCH}"
                    }
                    echo "Helm Chart updated and pushed to GitHub."
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        failure {
            echo 'CI/CD Pipeline failed!'
        }
        success {
            echo 'CI/CD Pipeline completed successfully! Argo CD should now deploy.'
        }
    }
}
