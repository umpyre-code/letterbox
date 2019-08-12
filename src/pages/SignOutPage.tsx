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
import { signoutRequest } from '../store/client/actions'

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

interface PropsFromDispatch {
  signout: typeof signoutRequest
}

interface PropsFromRouter extends Router.RouteComponentProps<{}> {}

type AllProps = PropsFromDispatch & PropsFromRouter

const SignOutPageFC: React.FC<AllProps> = ({ history, signout }) => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm" className={classes.container}>
        <Paper className={classes.paper}>
          <Box className={classes.box}>
            <Typography variant="h3">Sign Out of Umpyre?</Typography>
          </Box>
          <Box className={classes.box}>
            <Typography variant="h6">Signing out will remove all local data.</Typography>
          </Box>
          <Box className={classes.box}>
            <Typography>
              Umpyre does not store messages for more than 30 days. Removing local data is
              irreversible.
            </Typography>
          </Box>
          <Box className={classes.box}>
            <Typography>
              If you are signed in on another device, your messages will still be available there.
            </Typography>
          </Box>
          <Grid container alignContent="flex-end">
            <Grid item xs>
              <Box className={classes.box}>
                <Button variant="contained" color="secondary" onClick={() => history.push('/')}>
                  👈 No, take me back
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box className={classes.box}>
                <Button variant="contained" color="primary" onClick={() => signout()}>
                  Yes, sign me out 👉
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </React.Fragment>
  )
}

const mapDispatchToProps = {
  signout: signoutRequest
}

const SignOutPage = Router.withRouter(
  connect(
    null,
    mapDispatchToProps
  )(SignOutPageFC)
)
export default SignOutPage
