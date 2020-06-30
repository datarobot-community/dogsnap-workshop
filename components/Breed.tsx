import * as React from "react"
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Link } from "@material-ui/core";

//@ts-ignore
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: 480,
            marginBottom: 8
          },
        media: {
            height: 360        }
    })
);


const Breed: React.FC = (props) => {

    //@ts-ignore
    const {name, probability, image, url} = props.breedData
    const classes = useStyles()

    const displayProbability = Math.round(probability * 10000) / 100

    return(
        <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={image}
          title="Dog breed photo"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {name} ( {displayProbability}%)
          </Typography>
          <Link href={url}>View on AKC site</Link>
        </CardContent>
      </CardActionArea>
      </Card>

    )
}

export default Breed