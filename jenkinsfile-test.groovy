@Library(value="ds4h", changelog=false) _

properties([
    parameters([
        string(name: 'NODE_NAME', description: 'Agent to run on', defaultValue: 'any'),
        string(name: "PUBLISH_HELM", description: "Registry to use for publishing", defaultValue: '')
    ])
])

helmPipeline(
    NODE_NAME: params.NODE_NAME,
    IMG_PAHTS: 'select(.kind == "Deployment" and .metadata.labels."app.kubernetes.io/name" == "dct") | .spec.template.spec.containers[0].image',
    IMG_JOBS: 'DS4H/test-antonio-docker/xfsc-dct',
    PUBLISH_HELM: params.PUBLISH_HELM
)