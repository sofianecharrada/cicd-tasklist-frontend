pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'sofianecharrada'
        IMAGE_NAME      = 'tasklist-frontend'
        IMAGE_TAG       = "latest"
        
        DOCKER_CREDS_ID = 'c71ca4ae-d32c-4e85-8e57-fecbdcbc8644'
        SONAR_CREDS_ID  = 'sam-sonar-token'
    }

    stages {
        stage('1 & 2. Installation & Tests UI') {
            steps {
                echo 'Exécution de l\'installation et des tests Vitest dans un espace isolé...'
                bat """
                docker run --rm ^
                  -v "%WORKSPACE%:/app_host" ^
                  node:22-slim ^
                  sh -c "mkdir -p /tmp/app && cp -r /app_host/* /tmp/app/ && cd /tmp/app && npm install && npm run test:coverage -- --watch=false && mkdir -p /app_host/reports /app_host/coverage && cp -r reports/* /app_host/reports/ && cp -r coverage/* /app_host/coverage/"
                """
            }
            post {
                always {
                    // Jenkins récupère le rapport JUnit de l'interface
                    junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                }
            }
        }

        stage('3. Analyse Qualité Code (SonarQube)') {
            steps {
                withSonarQubeEnv('Sonarqube') {
                    withCredentials([string(credentialsId: env.SONAR_CREDS_ID, variable: 'SONAR_TOKEN')]) {
                        echo 'Lancement de l\'analyse du Frontend via Sonar-Scanner...'
                        bat """
                        docker run --rm ^
                          -v "%WORKSPACE%:/usr/src" ^
                          sonarsource/sonar-scanner-cli ^
                          -Dsonar.token=%SONAR_TOKEN% ^
                          -Dsonar.host.url=%SONAR_HOST_URL%
                        """
                    }
                }
            }
        }

        stage('4. Génération du SBOM (Sécurité)') {
            steps {
                echo 'Génération du SBOM directement dans le dossier utilisateur Frontend...'
                bat """
                docker run --rm ^
                  -v "C:\\Users\\sofiane\\Documents\\Projet Pipelines\\Projet à rendre\\cicd-tasklist-frontend:/project" ^
                  anchore/syft:latest dir:/project -o spdx-json=/project/sbom-spdx.json
                """
            }
        }

        stage('5. Construction de l\'image Docker') {
            steps {
                echo 'Construction de l\'image Docker Frontend (Nginx Production)...'
                bat "docker build -t ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG} ."
            }
        }

        stage('6. Scan de Vulnérabilités (Trivy)') {
            steps {
                echo 'Exportation de l\'image et analyse de sécurité via Trivy...'
                // 1. On exporte l'image construite dans un fichier archive .tar
                // 2. On lance Trivy en mode "image de fichier" (-i) sur cette archive
                // 3. On nettoie le fichier .tar à la fin
                bat """
                docker save -o frontend-image.tar ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG}
                docker run --rm ^
                  -v "%WORKSPACE%:/project" ^
                  aquasec/trivy:latest image --input /project/frontend-image.tar --severity HIGH,CRITICAL
                del frontend-image.tar
                """
            }
        }

        stage('7. Publication sur Docker Hub') {
            steps {
                echo 'Connexion et Push de l\'image Frontend sur Docker Hub...'
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    bat "docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%"
                    bat "docker push ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
            }
        }
    }

    post {
        success {
            echo 'Félicitations ! Le pipeline Frontend est entièrement validé et publié ! 🎉'
        }
        failure {
            echo 'Le pipeline Frontend a échoué. Vérifie les logs de l\'étape en erreur.'
        }
    }
}