pipeline {
    agent {
        docker {
            image 'jenkins/jenkins:lts' // 빌드한 이미지명
            args '-u root'                      // gcloud 같은 명령 실행을 위해 root 권한 필요
        }
    }

    environment {
        GCP_PROJECT_ID = 'kwon-cicd'
        GCP_REGION     = 'asia-northeast3'
        GCP_KEY_FILE   = '/home/kwon/kwon-cicd-ddec4bdb866f.json'

        GCR_REGISTRY_HOST = "${GCP_REGION}-docker.pkg.dev"
        GCR_REPO_NAME = "my-web-app-repo/web-server-backend"

        APP_SOURCE_DIR = 'backend'
        HELM_CHART_PATH = 'helm-chart/my-web-app'

        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        GITHUB_ORG     = 'KOSA-CloudArchitect'
        GITHUB_REPO    = 'web-server'
        GITHUB_BRANCH  = 'main'

        GITHUB_USER    = 'kwon0905' // 실제 GitHub ID로 바꿔야 함
    }

    stages {
        stage('Initialize GCP Auth') {
            steps {
                script {
                    echo "Activating GCP service account credentials..."
                    sh "gcloud auth activate-service-account --key-file=${GCP_KEY_FILE} --project=${GCP_PROJECT_ID}"
                }
            }
        }

        stage('Checkout Source Code') {
            steps {
                echo "Cloning repository ${GITHUB_ORG}/${GITHUB_REPO} branch ${GITHUB_BRANCH}"
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

                    sh "git add ${HELM_CHART_PATH}/values.yaml"
                    sh "git commit -m 'Update ${GCR_REPO_NAME} image tag to ${IMAGE_TAG} by Jenkins build #${env.BUILD_NUMBER}'"

                    withCredentials([string(credentialsId: 'github-pat-token', variable: 'SECRET')]) {
                        sh "git push https://${GITHUB_USER}:${SECRET}@github.com/${GITHUB_ORG}/${GITHUB_REPO}.git HEAD:${GITHUB_BRANCH}"
                    }
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

