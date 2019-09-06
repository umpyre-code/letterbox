import {
  Box,
  Container,
  createStyles,
  CssBaseline,
  Divider,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { SignInForm } from '../components/forms/SignInForm'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      padding: theme.spacing(1, 0, 2, 0),
      verticalAlign: 'middle'
    },
    container: { padding: theme.spacing(5) },
    paper: { padding: theme.spacing(2) }
  })
)

const SignInPage = () => {
  const classes = useStyles({})
  return (
    <Container maxWidth="sm" className={classes.container}>
      <CssBaseline />
      <Paper className={classes.paper}>
        <Box className={classes.box}>
          <Typography variant="h2">Sign In to Umpyre</Typography>
        </Box>
        <Box className={classes.box}>
          <Typography>Umpyre is a better way to communicate online.</Typography>
        </Box>
        <Divider />
        <SignInForm />
        <Box className={classes.box}>
          <Typography variant="body2">
            Don&apos;t use Umpyre on a device you don&apos;t own such as a shared, public, or
            employer&apos;s computer. Your data is stored locally for your privacy, so make sure
            it&apos;s a device you control and trust.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default SignInPage
