import {
  AppBar,
  Box,
  Container,
  createStyles,
  CssBaseline,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link, Route, Switch } from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import { BalanceTable, makeRowsFromBalance } from '../components/widgets/BalanceTable'
import { Emoji } from '../components/widgets/Emoji'
import Loading from '../components/widgets/Loading'
import { ApplicationState } from '../store'
import { addDraftRequest } from '../store/drafts/actions'
import { Balance } from '../store/models/account'
import { ClientCredentials, ClientProfile } from '../store/models/client'
import PayoutsPage from './PayoutsPage'

interface PropsFromState {
  profile?: ClientProfile
  balance?: Balance
  credentials?: ClientCredentials
}

type AccountPageProps = PropsFromState

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    composeButton: {
      bottom: theme.spacing(2),
      margin: '0 auto',
      position: 'fixed',
      right: theme.spacing(2),
      zIndex: 1
    },
    draftContainer: {
      padding: theme.spacing(1)
    },
    headerContainer: {
      padding: theme.spacing(1)
    },
    messageListContainer: {
      padding: theme.spacing(1)
    }
  })
)

function a11yProps(name: string) {
  return {
    'aria-controls': `simple-tabpanel-${name}`,
    id: `simple-tab-${name}`
  }
}

interface TabPanelProps {
  children?: React.ReactNode
  name: string
}

const TabPanel: React.FC<TabPanelProps> = ({ children, name, ...other }) => (
  <Typography
    component="div"
    role="tabpanel"
    id={`tabpanel-${name}`}
    aria-labelledby={`tab-${name}`}
    {...other}
  >
    <Box p={3}>{children}</Box>
  </Typography>
)

const AccountPageFC: React.FC<AccountPageProps> = ({ balance, profile, credentials }) => {
  const classes = useStyles({})

  if (balance && profile && credentials) {
    return (
      <ClientInit>
        <CssBaseline />
        <Container className={classes.headerContainer}>
          <Typography variant="h2" component="h2">
            <strong>
              <Link to="/">Umpyre</Link>
            </strong>
          </Typography>
        </Container>
        <Container>
          <Paper>
            <Route
              path="/account"
              render={({ location }) => (
                <React.Fragment>
                  <AppBar position="static">
                    <Tabs value={location.pathname} aria-label="my account">
                      <Tab
                        label="Account"
                        {...a11yProps('account')}
                        component={Link}
                        to="/account"
                        value="/account"
                      />
                      <Tab
                        label="Balance"
                        {...a11yProps('balance')}
                        component={Link}
                        to="/account/balance"
                        value="/account/balance"
                      />
                      <Tab
                        label="Payouts"
                        {...a11yProps('payouts')}
                        component={Link}
                        to="/account/payouts"
                        value="/account/payouts"
                      />
                    </Tabs>
                  </AppBar>
                  <React.Fragment>
                    <Switch>
                      <Route
                        exact
                        path="/account"
                        render={() => (
                          <TabPanel name="account">
                            <Typography variant="h5">Account info</Typography>
                            <Typography>
                              Looking good <Emoji ariaLabel="cool">😎</Emoji>
                            </Typography>
                          </TabPanel>
                        )}
                      />
                      <Route
                        path="/account/balance"
                        render={() => (
                          <TabPanel name="balance">
                            <Typography variant="h5">Account balance</Typography>

                            {balance && <BalanceTable rows={makeRowsFromBalance(balance)} />}
                          </TabPanel>
                        )}
                      />
                      <Route
                        path="/account/payouts"
                        render={params => (
                          <TabPanel name="payouts">
                            <PayoutsPage searchString={params.location.search} />
                          </TabPanel>
                        )}
                      />
                    </Switch>
                  </React.Fragment>
                </React.Fragment>
              )}
            />
          </Paper>
        </Container>
      </ClientInit>
    )
  } else {
    return <Loading />
  }
}

const mapStateToProps = ({ clientState, accountState }: ApplicationState) => ({
  balance: accountState.balance,
  credentials: clientState.credentials,
  profile: clientState.profile
})

const mapDispatchToProps = {
  addDraft: addDraftRequest
}

const AccountPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountPageFC)
export default AccountPage
