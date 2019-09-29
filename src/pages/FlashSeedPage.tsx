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
import { CopyIcon } from '../components/widgets/CopyIcon'
import { Emoji } from '../components/widgets/Emoji'
import { ApplicationState } from '../store/ApplicationState'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      display: 'inline-flex',
      margin: theme.spacing(1, 0, 1, 0),
      padding: theme.spacing(1),
      verticalAlign: 'middle'
    },
    root: {
      width: '100%',
      backgroundImage: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
      minHeight: '100vh'
    },
    container: {
      padding: theme.spacing(5)
    },
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
  const [copied, setCopied] = React.useState<boolean>(false)
  const classes = useStyles({})

  if (!seedWords || seedWords.length !== 16) {
    return <Router.Redirect to="/" />
  }

  return (
    <>
      <CssBaseline />
      <Box className={classes.root}>
        <Container maxWidth="sm" className={classes.container}>
          <Paper className={classes.paper}>
            <Box className={classes.box}>
              <Typography variant="h3">Recovery Phrase</Typography>
            </Box>
            <Box className={classes.box}>
              <Typography variant="h6">
                Store these 16 words in a safe place, such as a password manager, and don&apos;t
                share them with anyone.
              </Typography>
            </Box>
            <Grid container>
              {seedWords.slice(0, 15).map((word: string, index: number) => (
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
                  16. {seedWords[15]}
                </Box>
              </Typography>
            </Box>
            <Box className={classes.box}>
              <Typography>
                If you want to sign in on another device, or recover messages later, you will need
                your recovery phrase.
              </Typography>
            </Box>
            <Grid container justify="space-between" alignItems="center">
              <Grid item xs>
                <Box className={classes.box}>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(seedWords.join(' '))
                      setCopied(true)
                      setTimeout(() => {
                        setCopied(false)
                      }, 1000)
                    }}
                  >
                    <CopyIcon>copy</CopyIcon>
                    Copy to clipboard{' '}
                    <span style={{ visibility: copied ? 'visible' : 'hidden' }}>✔</span>
                  </Button>
                </Box>
              </Grid>
              <Grid item xs>
                <Box className={classes.box}>
                  <Button color="primary" variant="contained" onClick={() => history.push('/')}>
                    I&apos;ve saved my recovery phrase&nbsp;<Emoji ariaLabel="continue">👉</Emoji>
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  )
}

const mapStateToProps = ({ keysState }: ApplicationState) => ({
  seedWords: keysState.seedWords
})

const FlashSeedPage = Router.withRouter(connect(mapStateToProps)(FlashSeedPageFC))
export default FlashSeedPage
