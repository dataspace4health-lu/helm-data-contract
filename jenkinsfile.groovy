@Library(value="ds4h", changelog=false) _

pipeline {
    environment {
        DNS_NAME = 'dataspace4health.local'
        BRANCH_NAME = "${params.branch}"
        REGISTRY = 'localhost:5000'
        REGISTRY_NAME = 'k3d-registry.localhost:5000'
    }

    parameters {
        string(name: "branch", description: "branch name used for pulling repos", defaultValue: "jenkins")
    }

    agent {label 'worker'}

    stages {
        stage("Initialization") {
            steps {
                script {
                    cleanWs()
                    utils.setEnv()
                    utils.initSetup()
                }
            }
        }

        stage("Setup Repos") {
            parallel {
                stage("Clone Helm DCT Repo") {
                    steps {
                        script {
                            utils.cloneRepo(env.DCT_HELM_REPO, env.HELM_DCT_DIR)
                            dir(env.HELM_DCT_DIR) {
                                sh 'make build'
                            }
                        }
                    }
                }
                stage("Setup XFSC DCT Repo") {
                    steps {
                        script {
                            ms.setupXFSCRepo(false)
                        }
                    }
                }
            } 
        }

        stage("Build XFSC DCT Image") {
            steps {
                script {
                    ms.buildXfscDct()
                }
            }
        }

        stage("Deploy Adn Test") {
            parallel {
                stage("Create K3d Cluster and Test") {
                    steps {
                        script {
                            ms.deployDCT()
                        }
                    }
                }

                stage("Helm Chart Security Check") {
                    steps {
                        script {
                            dir(env.HELM_DCT_DIR) {
                                tests.trivyHelmChartCheck("./", "DCT")
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                ms.deleteImage(env.XFSC_DCT_IMG_FILE)
                ms.postCleanup()
            }
        }
    }
}