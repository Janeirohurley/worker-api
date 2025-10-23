pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        DATABASE_URL = credentials('DATABASE_URL')
        JWT_SECRET = credentials('JWT_SECRET')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/janeirohurley/worker-api.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'pnpm test'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t worker-api:${BUILD_NUMBER} .'
            }
        }

        stage('Deploy to Staging') {
            steps {
                sh 'docker-compose -f docker-compose.staging.yml up -d'
            }
        }

        stage('Run Integration Tests') {
            steps {
                sh 'curl -f http://localhost:4000/api/v1/auth/me || exit 1'
            }
        }

        stage('Deploy to Production') {
            steps {
                sh 'docker-compose -f docker-compose.prod.yml up -d'
            }
        }
    }

    post {
        always {
            sh 'docker-compose down'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
