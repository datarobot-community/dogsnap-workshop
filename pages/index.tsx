import { makeStyles } from "@material-ui/core/styles";
import CameraInterface from "components/CameraInterface";
import { Layout } from "components/Layout";
import UploadInterface from "components/UploadInterface";
import PredictionsInterface from "components/PredictionsInterface"
import Head from "next/head";
import * as React from "react";
import { useState } from "react";
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles((theme: any) => ({
  root: {
    textAlign: "center",
    position: "relative",
    
    
  },
  chipContainer: {
    display: "flex",
    justifyContent: "center"
  },
  chip: {
    margin: "5px 10px",
    color: theme.palette.primary.text,
    backgroundColor: theme.palette.primary.main
  },
  contents: {
    paddingTop: 30,
    paddingBottom: 30
  },
  controls: {
    color: '#FFF',   
       display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5) 
    }
  },
  progress: {
    zIndex: 1001,
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
}))






const Index: React.FC = () => {
  // const handleOpenLink = (href: string) => {
  //   window.open(href);
  //   return false;
  // };
  const classes = useStyles();

  const [photoDataUri, setPhotoDataUri] = useState('');
  const [breedPredictions, setBreedPredictions] = useState([])
  const [predictionRequest, setPredictionRequest] = useState({})

  const handleTakePhotoAnimationDone = (dataUri: string) => {
    console.log('takePhoto');
    setPhotoDataUri(dataUri);
  }

  const handleRetake = () => {
    console.log("Handle retake image");
    setPhotoDataUri('');
  }

  const handleUpload = async (payload: any) => {

    setShowProgress(true)

    setPredictionRequest(payload)

    const response = await fetch('api/upload', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // body data type must match "Content-Type" header
    });
    let breeds = await response.json()

    setShowProgress(false)
    setBreedPredictions(breeds)
  }

  const [showProgress, setShowProgress] = useState(true)

  const handleCameraStart = () => {
    setShowProgress(false)
  }

  return (
    <Layout>
      <div className={classes.root}>
        <div>
        </div>
        <Head>
          <title>DogSnap</title>
        </Head>
        {showProgress ? <CircularProgress className={classes.progress} /> : <></>}
        <div className={classes.contents}>
          {
            (() => {
              if(photoDataUri && breedPredictions.length > 0)
                return <PredictionsInterface 
                //@ts-ignore
                  predictions={breedPredictions} 
                  originalPayload={predictionRequest}
                  />
              
              if(photoDataUri)
              //@ts-ignore
                return <UploadInterface dataUri = {photoDataUri} 
                handleUpload = {handleUpload} 
                handleRetake = {handleRetake} 
                useStyles = { useStyles }
              />

              //@ts-ignore
              return <CameraInterface onCameraStart= {handleCameraStart} onTakePhotoAnimationDone = {handleTakePhotoAnimationDone } />

            })()
          }
          



        </div>
      </div>
    </Layout>
  );
};

export default Index;
