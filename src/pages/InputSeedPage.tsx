import {
  Box,
  Button,
  Container,
  createStyles,
  CssBaseline,
  Grid,
  makeStyles,
  Paper,
  SvgIcon,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import stringHash from 'string-hash'
import { Emoji } from '../components/widgets/Emoji'
import { SeedWordInput } from '../components/widgets/SeedWordInput'
import { calculateCheckWord } from '../store/keyPairs/sagas'
import { wordLists } from '../store/keyPairs/wordLists'

const PasteIcon: React.FC = () => (
  <SvgIcon>
    <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
  </SvgIcon>
)

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

const InputSeedPageFC: React.FC<AllProps> = ({ history }) => {
  const [pasted, setPasted] = React.useState<boolean>(false)
  const [checkPassed, setCheckPassed] = React.useState<boolean>(false)
  const [seedWords, setSeedWords] = React.useState<Array<string>>([...Array(16)].fill(''))
  const classes = useStyles({})

  React.useEffect(() => {
    checkWords()
  }, [seedWords])

  async function checkWords() {
    const checkWord = await calculateCheckWord(seedWords.slice(0, 15))
    if (checkWord === seedWords[15]) {
      setCheckPassed(true)
    } else {
      setCheckPassed(false)
    }
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm" className={classes.container}>
        <Paper className={classes.paper}>
          <Box className={classes.box}>
            <Typography variant="h3">Recovery Phrase</Typography>
          </Box>
          <Box className={classes.box}>
            <Typography variant="h6">Please enter your 16 word recovery phrase</Typography>
          </Box>
          <Box className={classes.box}>
            <Button
              onClick={() => {
                const { readText } = navigator.clipboard
                if (readText) {
                  readText().then(clipText => {
                    const splat = clipText.split(/[^\w]/)
                    const updatedSeedWords = Array.from(seedWords)
                    splat.splice(0, 16).forEach((value, index) => {
                      if (wordLists.english.includes(value)) {
                        updatedSeedWords[index] = value
                      }
                    })
                    setSeedWords(updatedSeedWords)
                  })
                }
                setPasted(true)
                setTimeout(() => {
                  setPasted(false)
                }, 1000)
              }}
            >
              <PasteIcon>copy</PasteIcon>
              Paste from clipboard
              {pasted && (
                <React.Fragment>
                  &nbsp;<Emoji ariaLabel="copied">✔️</Emoji>
                </React.Fragment>
              )}
            </Button>
          </Box>
          <Grid container>
            {seedWords.slice(0, 15).map((word: string, index: number) => (
              <Grid item xs={4} key={stringHash(`${index}:${word}`)}>
                <SeedWordInput
                  label={(index + 1).toString()}
                  placeholder={undefined}
                  selectedItem={word}
                  onChange={(updatedWord: string) => {
                    const updatedWords = Array.from(seedWords)
                    updatedWords[index] = updatedWord
                    setSeedWords(updatedWords)
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <SeedWordInput
            label="16"
            placeholder="Check word"
            selectedItem={seedWords[15]}
            onChange={(updatedWord: string) => {
              const updatedWords = Array.from(seedWords)
              updatedWords[15] = updatedWord
              setSeedWords(updatedWords)
            }}
          />
          <Box className={classes.box}>
            <Typography>
              If you lost your recovery phrase, you will not be able to read old messages.
            </Typography>
          </Box>
          <Grid container>
            <Grid item xs>
              <Box className={classes.box}>
                <Button color="secondary" variant="contained" onClick={() => history.push('/')}>
                  I lost my recovery phrase&nbsp;<Emoji ariaLabel="shock">😲</Emoji>
                </Button>
              </Box>
            </Grid>{' '}
            <Grid item xs>
              <Box className={classes.box}>
                <Button
                  disabled={!checkPassed}
                  color="primary"
                  variant="contained"
                  onClick={() => history.push('/')}
                >
                  Continue with recovery phrase&nbsp;<Emoji ariaLabel="continue">👉</Emoji>
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </React.Fragment>
  )
}

const mapDispatchToProps = {}

const InputSeedPage = connect(
  null,
  mapDispatchToProps
)(InputSeedPageFC)
export default InputSeedPage
