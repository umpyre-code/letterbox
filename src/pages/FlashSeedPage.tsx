import {
  Box,
  Button,
  Container,
  createStyles,
  CssBaseline,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import stringHash from 'string-hash'
import { ApplicationState } from '../store/ApplicationState'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      display: 'inline-flex',
      margin: theme.spacing(1, 0, 1, 0),
      padding: theme.spacing(1),
      verticalAlign: 'middle'
    },
    container: { padding: theme.spacing(5) },
    paper: { padding: theme.spacing(2) },
    wordBox: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      padding: theme.spacing(1)
    }
  })
)

interface PropsFromState {
  seedWords: string[]
}

type AllProps = PropsFromState & Router.RouteComponentProps<{}>

const FlashSeedPageFC: React.FC<AllProps> = ({ history, seedWords }) => {
  const classes = useStyles({})

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm" className={classes.container}>
        <Paper className={classes.paper}>
          <Box className={classes.box}>
            <Typography variant="h3">Recovery Phrase</Typography>
          </Box>
          <Box className={classes.box}>
            <Typography variant="h6">
              Store these 13 words in a safe place, such as a password manager.
            </Typography>
          </Box>
          <Grid container>
            {seedWords.slice(0, 12).map((word: string, index: number) => (
              <Grid item xs={4} key={stringHash(`${index}:${word}`)}>
                <Box className={classes.box} style={{ display: 'block', width: 'auto' }}>
                  <Typography variant="subtitle1">
                    <Box className={classes.wordBox} fontFamily="Monospace">
                      {index + 1}. {word}
                    </Box>
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box className={classes.box}>
            <Typography>Check word:</Typography>
          </Box>
          <Box className={classes.box} style={{ display: 'block', width: 'auto' }}>
            <Typography variant="subtitle1">
              <Box className={classes.wordBox} fontFamily="Monospace">
                13. {seedWords[12]}
              </Box>
            </Typography>
          </Box>
          <Box className={classes.box}>
            <Typography>
              If you want to sign in on another device, or recover messages later, you will need
              your recovery phrase.
            </Typography>
          </Box>
          <Box className={classes.box}>
            <Button color="primary" variant="contained" onClick={() => history.push('/')}>
              I&apos;ve written down my recovery phrase
            </Button>
          </Box>
        </Paper>
      </Container>
    </React.Fragment>
  )
}

const mapStateToProps = ({ keysState }: ApplicationState) => ({
  seedWords: keysState.seedWords
})

const FlashSeedPage = connect(mapStateToProps)(FlashSeedPageFC)
export default FlashSeedPage
