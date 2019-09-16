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
  CssBaseline
} from '@material-ui/core'
import HelpIcon from '@material-ui/icons/Help'
import * as React from 'react'
import { Link, LinkProps } from 'react-router-dom'
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

const AboutLink = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, 'innerRef' | 'to'>>(
  (props, ref) => <Link innerRef={ref} to="/about" {...props} />
)

const SignUpPage = () => {
  const classes = useStyles({})
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm" className={classes.container}>
        <Paper className={classes.paper}>
          <Box className={classes.box}>
            <Typography variant="h2">Join Umpyre</Typography>
          </Box>
          <Box className={classes.box}>
            <Typography>Umpyre is a better way to reach people.</Typography>
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
    </React.Fragment>
  )
}

export default SignUpPage
