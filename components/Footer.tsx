import * as React from "react"
import { Container, makeStyles, createStyles, colors, Typography } from "@material-ui/core"

const useStyles = makeStyles(() =>
  createStyles({
    footer: {
        background: colors.grey[200],
        marginTop: 24,
        padding: 24,
        textAlign: "center",
        bottom: 0
    }
}))

const Footer: React.FC = () => {
    const classes = useStyles()
  
    return(
      <Container className={classes.footer}>
        <Typography variant="body1">Made with ❤️ and 🤖🧠☁️ at <a href="https://developers.datarobot.com">DataRobot</a> | 🛠 Source code on <a href="https://github.com/datarobot-community/dogsnap">GitHub</a> | 📘 Tutorial on <a href="https://api-docs.datarobot.com/docs/dogsnap_breed_categorizer">DataRobot developer portal</a></Typography>
      </Container>
    )
  }

export default Footer