@Library(value="ds4h", changelog=false) _

helmPipeline(
    REPOS: [
        HELM_PATH:'',
        IMAGE_NAME:'xfsc-dct',
        REPO_URL:'git@ssh.dev.azure.com:v3/Dataspace4Health/DS4H/xfsc-dct',
        BRANCH:'main'
    ]
)