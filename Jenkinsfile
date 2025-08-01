// Jenkinsfile
// 이 파일은 GitHub 저장소의 루트(root)에 위치해야 합니다.

pipeline {
    // Jenkins 마스터 대신, GKE에 동적으로 생성되는 에이전트 Pod을 사용합니다.
    // 'gcloud-agent'는 Jenkins Pod Template의 Labels과 일치해야 합니다.
    agent { label 'gcloud-agent' }

    // Jenkins 에이전트 Pod 내에서 사용될 환경 변수들을 정의합니다.
    environment {
        GCP_PROJECT_ID    = 'kwon-cicd'
        GCP_REGION        = 'asia-northeast3'

        // GCP 서비스 계정 키 파일의 경로 (Jenkins 에이전트 Pod 내부의 마운트 경로)
        // Jenkins Cloud 설정에서 Secret File Volume의 'Container Path'와 일치해야 합니다.
        GCP_KEY_FILE      = '/tmp/gcp-key.json' // <<--- 이 경로를 사용합니다.

        // GCR/Artifact Registry 정보
        GCR_REGISTRY_HOST = "${GCP_REGION}-docker.pkg.dev"
        GCR_REPO_NAME     = "my-web-app-repo/web-server-backend"

        // 팀원 앱 정보
        APP_SOURCE_DIR    = 'backend'
        HELM_CHART_PATH   = 'helm-chart/my-web-app'

        // CI/CD 관련 변수
        IMAGE_TAG         = "${env.BUILD_NUMBER}"
        GITHUB_ORG        = 'KOSA-CloudArchitect'
        GITHUB_REPO       = 'web-server'
        GITHUB_BRANCH     = 'main'
        GITHUB_USER       = 'kwon0905' // <<---  GitHub 로그인 ID
    }

    stages {
        stage('Initialize GCP Auth') {
            steps {
                script {
                    echo "Activating GCP service account credentials..."
                    // withCredentials 블록을 사용하여 Secret File Volume에 마운트된 키 파일을 안전하게 사용합니다.
                    withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GCP_KEY_JSON')]) {
                        sh "gcloud auth activate-service-account --key-file=${GCP_KEY_JSON} --project=${GCP_PROJECT_ID}"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}:${IMAGE_TAG}"
                    dir("${APP_SOURCE_DIR}") {
                        sh "docker build -t ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}:${IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Push Docker Image to Artifact Registry') {
            steps {
                script {
                    echo "Pushing Docker image to Artifact Registry..."
                    sh "gcloud auth configure-docker ${GCR_REGISTRY_HOST}"
                    sh "docker push ${GCR_REGISTRY_HOST}/${GCP_PROJECT_ID}/${GCR_REPO_NAME}:${IMAGE_TAG}"
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


