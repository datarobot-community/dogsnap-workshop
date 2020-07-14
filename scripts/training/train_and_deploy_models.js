const got = require('got')
const FormData = require('form-data')
const fs = require('fs')
const { timeStamp } = require('console')

const DR_API_URL = "https://app2.datarobot.com/api/v2"
const DR_API_KEY = ""

const datasetFiles = [
    {
        label: "00_xsmall",
        filename: "../../datasets/x-small-V2020-06-30.zip",
    },
    {
        label: "01_small",
        filename: "../../datasets/small-V2020-06-30.zip",
    },
    {
        label: "02_medium",
        filename: "../../datasets/medium-V2020-06-30.zip",
    },
    {
        label: "03_large",
        filename: "../../datasets/large-V2020-06-30.zip",
    },
    {
        label: "04_xlarge",
        filename: "../../datasets/x-large-V2020-06-30.zip",
    },
]

const fiveSeconds = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve()
    }, 5000)
})

const projectFromUploadJob = async (uploadJob) => {

    let status = null
    console.log(`Getting upload status for job: ${uploadJob}`)

    do {
        status = await got(uploadJob, {
            headers: {
                Authorization: `Bearer ${DR_API_KEY}`
            },
            responseType: 'json'
        })

        if (!status.body.id || !status.body.projectName) await fiveSeconds()

    } while (!status.body.id || !status.body.projectName)

    return status.body
}

const startAutopilot = async (project, target) => {

    let res = await got.patch(`${DR_API_URL}/projects/${project.id}/aim/`, {
        headers: {
            Authorization: `Bearer ${DR_API_KEY}`
        },
        json: {
            target: target,
            mode: 'auto'
        },
        responseType: 'json'
    })

    return res.headers.location
}

const deployAutomodel = async (project) => {

    let res = await got.post(`${DR_API_URL}/deployments/fromProjectRecommendedModel/`, {
        headers: {
            Authorization: `Bearer ${DR_API_KEY}`
        },
        json: {
            label: `deployment_${project.projectName}`,
            projectId: project.id,
            defaultPredictionServerId: '5e70e4b8aebd2f00244dbd1a', //This is going away soon
        },
        responseType: 'json'
    })
    return res.body
}

const trainAndDeploy = async () => {

    let uploads = [] //list of data upload jobs
    let projects = [] //list of projects
    let deployments = [] //list of deployments

    for (let dataset of datasetFiles) {
        console.log(`Dataset being uploaded - ${dataset.label}`)

        let form = new FormData()
        form.append('projectName', `dogbreeds_${dataset.label}`)
        form.append('file', fs.createReadStream(dataset.filename))

        const res = await got.post(`${DR_API_URL}/projects/`, {
            headers: {
                Authorization: `Bearer ${DR_API_KEY}`
            },
            body: form,
            responseType: 'json'
        });

        if (res.statusCode !== 202 || !res.headers.location) {
            console.error("Error uploading dataset for project")
            continue
        }

        let statusLocation = res.headers.location
        console.log(statusLocation)
        uploads.push(statusLocation)
    }

    for (let uploadJob of uploads) {
        let project = await projectFromUploadJob(uploadJob)
        console.log(project)
        projects.push(project)
    }
    // List of actual projects with IDs that we can start training
    for (let project of projects) {

        let modelingJob = await startAutopilot(project, 'breed_name')

        console.log("Started modeling: ")
        console.log(modelingJob)

        //Automodel
        console.log(`Deploying automodel`)
        let deployment = await deployAutomodel(project)
        console.log(`Created deployment: ${deployment.id}`)
        deployments.push({
           id: project.projectName,
           deploymentId: deployment.id 
        })
    }

    console.log("Deployments")
    console.log(deployments)


}

trainAndDeploy()
