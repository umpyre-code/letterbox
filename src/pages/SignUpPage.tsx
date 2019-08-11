import {
  Box,
  Container,
  createStyles,
  Divider,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { SignUpForm } from '../components/forms/SignUpForm'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      display: 'inline-flex',
      margin: theme.spacing(1, 0, 1, 0),
      padding: theme.spacing(1),
      verticalAlign: 'middle'
    },
    container: { padding: theme.spacing(5) },
    paper: { padding: theme.spacing(2) }
  })
)

const SignUpPage = () => {
  const classes = useStyles()
  return (
    <Container maxWidth="sm" className={classes.container}>
      <Paper className={classes.paper}>
        <Box className={classes.box}>
          <Typography variant="h3">Join Umpyre</Typography>
        </Box>
        <Box className={classes.box}>
          <Typography>Umpyre is a better way to communicate online.</Typography>
        </Box>
        <Divider />
        <SignUpForm />
        <Box className={classes.box}>
          <Typography variant="body2">
            Don't use Umpyre on a device you don't own such as a shared, public, or employer's
            computer. Your data is stored locally for your privacy, so make sure it's a device you
            control and trust.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default SignUpPage
