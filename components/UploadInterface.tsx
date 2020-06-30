import { Checkbox, Chip, Container, FormControlLabel, Typography, FormGroup } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CameraIcon from '@material-ui/icons/Camera';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import PetsIcon from '@material-ui/icons/Pets';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter'
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import * as React from "react";
import { useState } from "react";
import traitsValues from "../util/traits"


//@ts-ignore
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },

    }),
);

const UploadInterface: React.FC = (props: any) => {

    const { dataUri, handleUpload, handleRetake } = props;

    const [height, setHeight] = useState('x-short')
    //@ts-ignore
    const handleHeight = (event: React.MouseEvent<HTMLElement>, newHeight: string) => {
        setHeight(newHeight);
    };

    const [weight, setWeight] = useState('x-small')
    //@ts-ignore
    const handleWeight = (event: React.MouseEvent<HTMLElement>, newWeight: string) => {
        setWeight(newWeight);
    };
  
    const [traits, setTraits] = useState({
        is_friendly: false,
        is_playful: false,
        is_protective: false,
        is_fast_learner: false,
        is_athletic: false,
        is_graceful: false
    })
    const handleTraitsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTraits({ ...traits, [event.target.name]: event.target.checked });
    };

    const upload = () => {
        let payload = {
            height,
            weight,
            ...traits,
            image: dataUri
        }
        handleUpload(payload)
    }

    return (
        <div className="image-preview">
            <Container maxWidth="sm">
                <img
                    src={dataUri}
                    style={{
                        maxHeight: "320px"
                    }}
                />

                <Typography
                    style={{
                        marginBottom: "12px"
                    }}
                    variant="h6">Dog Height</Typography>

                <ToggleButtonGroup value={height} exclusive onChange={handleHeight} aria-label="dog size">
                    <ToggleButton value="x-short" aria-label="x-short">
                        <PetsIcon style={{ fontSize: 12 }} />
                    </ToggleButton>
                    <ToggleButton value="short" aria-label="short">
                        <PetsIcon style={{ fontSize: 18 }} />
                    </ToggleButton>
                    <ToggleButton value="medium" aria-label="medium">
                        <PetsIcon style={{ fontSize: 24 }} />
                    </ToggleButton>
                    <ToggleButton value="tall" aria-label="tall">
                        <PetsIcon style={{ fontSize: 36 }} />

                    </ToggleButton>
                    <ToggleButton value="x-tall" aria-label="t-tall">
                        <PetsIcon style={{ fontSize: 48 }} />
                    </ToggleButton>
                </ToggleButtonGroup>

                <Typography
                    style={{
                        marginBottom: "12px"
                    }}
                    variant="h6">Dog Weight</Typography>

                <ToggleButtonGroup value={weight} exclusive onChange={handleWeight} aria-label="dog size">
                    <ToggleButton value="x-small" aria-label="x-small">
                        <FitnessCenterIcon style={{ fontSize: 12 }} />
                    </ToggleButton>
                    <ToggleButton value="small" aria-label="small">
                        <FitnessCenterIcon style={{ fontSize: 18 }} />
                    </ToggleButton>
                    <ToggleButton value="medium" aria-label="medium">
                        <FitnessCenterIcon style={{ fontSize: 24 }} />
                    </ToggleButton>
                    <ToggleButton value="large" aria-label="large">
                        <FitnessCenterIcon style={{ fontSize: 36 }} />
                    </ToggleButton>
                    <ToggleButton value="x-large" aria-label="t-large">
                        <FitnessCenterIcon style={{ fontSize: 48 }} />
                    </ToggleButton>
                </ToggleButtonGroup>

                <Typography
                    style={{
                        marginBottom: "12px"
                    }}
                    variant="h6">Traits</Typography>

                <Grid container spacing={2} justify="center" alignItems="center">
                    <Grid item xs={4}>
                        <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={traits.is_friendly} onChange={handleTraitsChange} name="is_friendly" />}
                            label={traitsValues.is_friendly}
                            labelPlacement="top"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={traits.is_playful} onChange={handleTraitsChange} name="is_playful" />}
                            label={traitsValues.is_playful}
                            labelPlacement="top"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={traits.is_protective} onChange={handleTraitsChange} name="is_protective" />}
                            label={traitsValues.is_protective}
                            labelPlacement="top"
                        />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={4}>
                        <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={traits.is_fast_learner} onChange={handleTraitsChange} name="is_fast_learner" />}
                            label={traitsValues.is_fast_learner}
                            labelPlacement="top"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={traits.is_athletic} onChange={handleTraitsChange} name="is_athletic" />}
                            label={traitsValues.is_athletic}
                            labelPlacement="top"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={traits.is_graceful} onChange={handleTraitsChange} name="is_graceful" />}
                            label={traitsValues.is_graceful}
                            labelPlacement="top"
                        />
                        </FormGroup>
                    </Grid>
                </Grid>

                <Typography
                    style={{
                        marginBottom: "12px"
                    }}
                    variant="h6">Upload, retake?</Typography>

                <div>
                    <Chip
                        icon={<CloudUploadIcon />}
                        label='Upload'
                        onClick={upload}
                    />

                    <Chip
                        icon={<CameraIcon />}
                        label='Retake'
                        onClick={handleRetake}
                    />
                </div>

            </Container>


        </div>
    )
}

export default UploadInterface