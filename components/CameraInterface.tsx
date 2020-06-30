import * as React from "react";

// @ts-ignore
import Camera, { FACING_MODES } from 'react-html5-camera-photo';
import { Container } from "next/app";
import { Typography } from "@material-ui/core";

const CameraInterface: React.FC = (props: any) => {

    const { onCameraStart, onTakePhotoAnimationDone } = props
 
    return(
        <Container>
            <Typography variant="h5">
                🤳 Works best on a phone 🤳
            </Typography>
            <Camera
                onTakePhoto={(dataUri: string) => { onTakePhotoAnimationDone(dataUri); }}
                onCameraStart={onCameraStart}
                isImageMirror={false}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
            />
            <Typography variant="h5">
                👆Press the button to take a photo of a dog 👆
            </Typography>
        </Container>

    )
}

export default CameraInterface