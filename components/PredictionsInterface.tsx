import { Card, CardContent, CardMedia, Container, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import * as React from "react";
import Breed from "./Breed";
import traitsValues from "../util/traits"

//@ts-ignore
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            
        },
        card: {
            display: 'flex',
            maxWidth: 480,
            marginBottom: 24
        },
        image: {
            width: 200,
        },
        content: {
            flex: '1 0 auto',
            justifyContent: 'flex-start',
            padding: 24,
            textAlign: 'left'
        }
    }),
);

const PredictionsInterface: React.FC = (props: any) => {
    const { predictions, originalPayload } = props

    console.log(originalPayload)
    console.log(predictions)

    let breeds = []

    for (const [index, value] of predictions.entries()) {
        //@ts-ignore
        breeds.push(<Breed key={index} breedData={value} />)
    }

    console.log(breeds)

    //From original prediction payload take only the traits by their names
    let excluded = ['height', 'weight', 'image']
    //@ts-ignore
    let traits: string[] = ['100% good boy']
    Object.keys(originalPayload).forEach(
        key => {
            if (!excluded.includes(key) && originalPayload[key])
                traits.push(traitsValues[key])
        }
    )

    const theme = useTheme()
    const classes = useStyles(theme)

    return (
        <Container maxWidth="sm" className={classes.root}>
            <Typography component="h2" variant="h4">Your data:</Typography>

            <Card className={classes.card}>
                <CardMedia
                    className={classes.image}
                    image={originalPayload.image}
                />
                <CardContent className={classes.content}>
                    
                    <Typography variant="subtitle1" color="textSecondary">
                        Height: {originalPayload.height} <br/>
                        Weight: {originalPayload.weight} <br/>

                        Traits: 
                        { traits.map(trait => <li key={trait}>{trait}</li>)}

                    </Typography>
                </CardContent>
            </Card>

            <Typography component="h2" variant="h4">Matching breeds:</Typography>
            {breeds}
        </Container>

    )
}

export default PredictionsInterface