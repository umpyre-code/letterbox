import {
  Box,
  Container,
  createStyles,
  Divider,
  makeStyles,
  Paper,
  Theme,
  Typography,
  Grid
} from '@material-ui/core'
import Info from '@material-ui/icons/Info'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { SignUpForm } from '../components/forms/SignUpForm'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      padding: theme.spacing(1, 0, 2, 0),
      verticalAlign: 'middle'
    },
    infoBox: {
      display: 'inline-block',
      padding: theme.spacing(1, 0, 2, 0),
      verticalAlign: 'top'
    },
    container: { padding: theme.spacing(5) },
    paper: { padding: theme.spacing(2) },
    infoIcon: {
      padding: 0
    }
  })
)

const SignUpPage = () => {
  const classes = useStyles({})
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
            Don&apos;t use Umpyre on a device you don&apos;t own such as a shared, public, or
            employer&apos;s computer. Your data is stored locally for your privacy, so make sure
            it&apos;s a device you control and trust.
          </Typography>
        </Box>
        <Box className={classes.infoBox}>
          <Link to="/about">
            <Grid container alignItems="center">
              <Grid item>
                <Info style={{ padding: 5 }} />
              </Grid>
              <Grid item>
                <Typography variant="body2">Tell me more about Umpyre.</Typography>
              </Grid>
            </Grid>
          </Link>
        </Box>
      </Paper>
    </Container>
  )
}

export default SignUpPage
