import {
  Container,
  createStyles,
  CssBaseline,
  Divider,
  Grid,
  makeStyles,
  Theme
} from '@material-ui/core'
import * as React from 'react'
import * as Router from 'react-router-dom'
import { Balance } from '../../store/models/account'
import { ClientProfile } from '../../store/models/client'
import { Logotype } from '../widgets/Logotype'
import { Profile } from '../widgets/profile/Profile'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    layoutContainer: {
      padding: theme.spacing(1)
    },
    // footerContainer: {
    //   padding: theme.spacing(5, 0, 5, 0)
    // },
    headerContainer: {
      padding: theme.spacing(1)
    }
  })
)

interface Props {
  profile?: ClientProfile
  balance?: Balance
}

export const DefaultLayout: React.FC<Props> = ({ children, profile, balance }) => {
  const classes = useStyles({})

  return (
    <React.Fragment>
      <CssBaseline />
      <Grid container direction="column" style={{ height: '100vh' }}>
        <Grid item>
          <Container className={classes.headerContainer}>
            <Grid container spacing={1} justify="space-between" alignItems="flex-start">
              <Grid item>
                <Router.Link to="/">
                  <Logotype />
                </Router.Link>
              </Grid>
              {profile && balance && (
                <Grid item>
                  <Profile profile={profile} balance={balance} menu />
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>
          </Container>
        </Grid>
        <Grid item xs style={{ overflow: 'auto' }}>
          {children}
        </Grid>
      </Grid>
      {/* <Container className={classes.footerContainer}>
          <Grid container justify="center" alignItems="center" spacing={2}>
            <Grid item>
              <Router.Link to="/about">
                <Typography variant="subtitle1">About</Typography>
              </Router.Link>
            </Grid>
            <Grid item>
              <Divider orientation="vertical" style={{ height: 15 }} />
            </Grid>
            <Grid item>
              <Link href="https://blog.umpyre.com" variant="subtitle2" underline="none">
                <Typography variant="subtitle1">Blog</Typography>
              </Link>
            </Grid>
          </Grid>
        </Container> */}
    </React.Fragment>
  )
}
