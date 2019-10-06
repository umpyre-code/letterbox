import {
  Container,
  createStyles,
  CssBaseline,
  Grid,
  makeStyles,
  Theme,
  Divider
} from '@material-ui/core'
import * as React from 'react'
import * as Router from 'react-router-dom'
import { Balance } from '../../store/models/account'
import { ClientProfile } from '../../store/models/client'
import { LogotypeDark } from '../widgets/LogotypeDark'
import { Profile } from '../widgets/profile/Profile'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    layoutContainer: {
      padding: theme.spacing(1)
    },
    // footerContainer: {
    //   padding: theme.spacing(5, 0, 5, 0)
    // },
    headerGridContainer: {
      backgroundColor: theme.palette.grey[200]
    },
    headerContainer: {
      padding: theme.spacing(1),
      // backgroundImage: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.grey[100]})`,
      // backgroundColor: theme.palette.primary.light
      backgroundColor: theme.palette.grey[200]
    },
    bodyGrid: {
      overflow: 'auto',
      backgroundColor: theme.palette.grey[200]
      // backgroundImage: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.dark})`
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
    <>
      <CssBaseline />
      <Grid container direction="column" style={{ height: '100vh' }}>
        <Grid container item className={classes.headerGridContainer}>
          <Container className={classes.headerContainer}>
            <Grid container spacing={1} alignItems="flex-start">
              <Grid item>
                <Router.Link to="/">
                  <LogotypeDark responsive />
                </Router.Link>
              </Grid>
              {profile && balance && (
                <Grid item container xs alignItems="flex-start" justify="flex-end">
                  <Grid item>
                    <Profile profile={profile} balance={balance} menu />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Container>
          <Grid item xs={12}>
            <Divider />
          </Grid>
        </Grid>
        <Grid item xs className={classes.bodyGrid}>
          {children}
        </Grid>
      </Grid>
    </>
  )
}
