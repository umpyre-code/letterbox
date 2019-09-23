import {
  Box,
  Button,
  Container,
  createStyles,
  Divider,
  makeStyles,
  Paper,
  Theme,
  Typography,
  CssBaseline,
  Grid
} from '@material-ui/core'
import HelpIcon from '@material-ui/icons/Help'
import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { SignUpForm } from '../components/forms/SignUpForm'
import { API } from '../store/api'

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
    rootGrid: {
      backgroundImage: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
      minHeight: '100vh'
    },
    container: {
      padding: theme.spacing(3),
      height: '100%'
    },
    paper: {
      padding: theme.spacing(2),
      height: '100%'
    },
    infoIcon: {
      padding: 0
    }
  })
)

const AboutLink = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, 'innerRef' | 'to'>>(
  (props, ref) => <Link innerRef={ref} to="/about" {...props} />
)

const SignUpPage = () => {
  React.useEffect(() => {
    API.METRIC_COUNTER_INC('signup-page-loaded')
  }, [])
  const classes = useStyles({})
  return (
    <React.Fragment>
      <CssBaseline />
      <Grid container className={classes.rootGrid} alignItems="flex-start">
        <Grid item container direction="row-reverse">
          <Grid item sm={12} md={6}>
            <Container maxWidth="sm" className={classes.container}>
              <Paper className={classes.paper}>
                <Box className={classes.box}>
                  <Typography variant="h2">Join Umpyre</Typography>
                </Box>
                <Box className={classes.box}>
                  <Typography>
                    Umpyre is a messaging platform where everyone has skin in the game. Anyone can
                    reach you, but they need to make it worth your while. No spam, no junk, no time
                    wasted. Just value.
                  </Typography>
                </Box>

                <Divider />
                <SignUpForm />
                <Box className={classes.box}>
                  <Typography variant="body2">
                    Don&apos;t use Umpyre on a device you don&apos;t own such as a shared, public,
                    or employer&apos;s computer. Your message data is stored locally for your
                    privacy, so make sure it&apos;s a device you control and trust.
                  </Typography>
                </Box>
                <Box className={classes.infoBox}>
                  <Button component={AboutLink}>
                    <HelpIcon style={{ padding: 5 }}>tell me more</HelpIcon>
                    Tell me more about Umpyre
                  </Button>
                </Box>
                <Box className={classes.box}>
                  <Typography variant="body2">
                    <em>
                      {' '}
                      Having problems signing up? Please email{' '}
                      <a href="mailto:support@umpyre.com">support@umpyre.com</a>
                    </em>
                  </Typography>
                </Box>
              </Paper>
            </Container>
          </Grid>
          <Grid item sm={12} md={6}>
            <Container maxWidth="sm" className={classes.container}>
              <Paper className={classes.paper}>
                <Grid container alignItems="center" justify="center">
                  {/* <Grid item xs={12}>
                    <img
                      style={{
                        display: 'block',
                        margin: 'auto',
                        maxWidth: '300px',
                        height: 'auto'
                      }}
                      src="/artwork/umpyre-logo-yellow.png"
                      alt="Inbox"
                    />
                  </Grid> */}
                  <Grid item xs={6}>
                    <img
                      style={{
                        display: 'block',
                        margin: 'auto',
                        maxWidth: '200px',
                        width: '100%',
                        height: 'auto'
                      }}
                      src="/artwork/inbox.png"
                      alt="Inbox"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">
                      On Umpyre, your inbox becomes an auction: messages are ranked by their value.
                      If you read the message, you keep the payment.
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">
                      Message data is stored locally and stays private. We don&apos;t collect
                      personally identifiable behavioral data.
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <img
                      style={{
                        display: 'block',
                        margin: 'auto',
                        width: '100%',
                        maxWidth: '200px',
                        height: 'auto'
                      }}
                      src="/artwork/privacy.png"
                      alt="Privacy"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <img
                      style={{
                        display: 'block',
                        margin: 'auto',
                        width: '100%',
                        maxWidth: '200px',
                        height: 'auto'
                      }}
                      src="/artwork/security.png"
                      alt="Security"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">
                      We use end-to-end encryption, secure remote password protocol to mitigate MITM
                      attacks, and zero knowledge secure tokens. You hold your encryption keys.
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Container>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default SignUpPage
