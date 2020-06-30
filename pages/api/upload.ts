import { NowRequest, NowResponse } from '@vercel/node'
import got from 'got'

import breedDescriptions from './_breed_descriptions'

const deployments = {
  x_small: process.env.DEPLOYMENT_00_XSMALL || "",
  small: process.env.DEPLOYMENT_01_SMALL || "",
  medium: process.env.DEPLOYMENT_02_MEDIUM || "",
  large: process.env.DEPLOYMENT_03_LARGE || "",
  x_large: process.env.DEPLOYMENT_04_XLARGE || "",
}

const PREDICTION_SERVER = process.env.PREDICTION_SERVER
const API_KEY = process.env.API_KEY
const DATAROBOT_KEY = process.env.DATAROBOT_KEY

type Payload = {
  height: string,
  image_path?: string,
  is_friendly: boolean,
  is_playful: boolean,
  is_protective: boolean,
  is_fast_learner: boolean,
  is_athletic: boolean,
  is_graceful: boolean
}

type PredictedBreed = { value: number, label: string }

const splitPayloadFromImgDataUri = (dataUri: string) => {
  return dataUri.split(',')[1]
}
const endpointFromDeploymentId = (deploymentId: string) => `${PREDICTION_SERVER}/predApi/v1.0/deployments/${deploymentId}/predictions`

const topValues = (breeds: PredictedBreed[], number = 5) => {
    breeds.sort( (first, second) => second.value - first.value)
    return breeds.slice(0, number)
}

//Gets the deployment for selected weight and the closest one or two deployments
const adjacentDeploymentsFromWeight = (weight: string) => {
  switch(weight){
    case 'x-small': return [deployments.x_small, deployments.small]
    case 'small': return [deployments.x_small, deployments.small, deployments.medium ]
    case 'medium': return [deployments.small, deployments.medium, deployments.large ]
    case 'large': return [deployments.medium, deployments.large, deployments.x_large ]
    case 'x-large': return [deployments.large, deployments.x_large ]
    default: return [] //This is unreachable
  }
}

const predict = async (req: NowRequest, res: NowResponse) => {
  
  let weight = req.body.weight
  let selectedDeployments = adjacentDeploymentsFromWeight(weight)

  let predictionPayload: Payload = {
    height: req.body.height,
    image_path: splitPayloadFromImgDataUri(req.body.image),
    is_friendly: req.body.is_friendly || false,
    is_playful: req.body.is_playful || false,
    is_protective: req.body.is_protective || false,
    is_fast_learner: req.body.is_fast_learner || false,
    is_athletic: req.body.is_athletic || false,
    is_graceful: req.body.is_graceful || false
  }

  try{
    let allPredictions: PredictedBreed[] = []

    let predictionResponses = selectedDeployments
      .map(async deploymentId => 
        await got.post(endpointFromDeploymentId(deploymentId), {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "datarobot-key": DATAROBOT_KEY
          },
          json: [predictionPayload],
          responseType: 'json'
        }) 
      )

      for (const predictionResponse of predictionResponses) {
        
        //@ts-ignore
        let predictionValues = (await predictionResponse).body.data[0].predictionValues
        allPredictions.push(...predictionValues)
      }

      let predictedBreeds = topValues(allPredictions, 5)
      console.log(predictedBreeds)
      let out = []

      for(let i = 0; i < predictedBreeds.length; i++){
        let prediction = predictedBreeds[i]
        
        out.push({
          probability: prediction.value,
          ...breedDescriptions[prediction.label]
        })
      }

      console.log(out)
      res.send(out)
   }
   catch(error) {
     console.log(error)
   }
}

export default (req: NowRequest, res: NowResponse) => {
  if (req.method === 'POST' && req.body) {
    predict(req, res)
  }
  else {
    res.status(400).send("Invalid request")
  }
}

