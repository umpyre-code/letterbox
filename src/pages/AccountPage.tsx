import {
  AppBar,
  Box,
  Button,
  Container,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography
} from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import { DefaultLayout } from '../components/layout/DefaultLayout'
import { AccountPrefs } from '../components/widgets/AccountPrefs'
import { BackToIndexButton } from '../components/widgets/BackToIndexButton'
import { BalanceTable, makeRowsFromBalance } from '../components/widgets/BalanceTable'
import { CopyIcon } from '../components/widgets/CopyIcon'
import Loading from '../components/widgets/Loading'
import { PUBLIC_URL } from '../store/api'
import { ApplicationState } from '../store/ApplicationState'
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    urlBox: {
      background: theme.palette.grey[100],
      padding: theme.spacing(2),
      borderRadius: 6
    }
  })
)

const AccountPageFC: React.FC<AccountPageProps> = ({ balance, profile, credentials }) => {
  const classes = useStyles({})

  function getRefLink(): string {
    return `${PUBLIC_URL}/signup/?r=${profile.client_id}`
  }

  if (balance && profile && credentials) {
    return (
      <ClientInit>
        <DefaultLayout balance={balance} profile={profile}>
          <Container>
            <BackToIndexButton />
            <Paper>
              <Router.Route
                path="/account"
                render={({ location }) => (
                  <>
                    <AppBar position="static">
                      <Tabs value={location.pathname} aria-label="my account">
                        <Tab
                          label="Account"
                          {...a11yProps('account')}
                          component={Router.Link}
                          to="/account"
                          value="/account"
                        />
                        <Tab
                          label="Balance"
                          {...a11yProps('balance')}
                          component={Router.Link}
                          to="/account/balance"
                          value="/account/balance"
                        />
                        <Tab
                          label="Payouts"
                          {...a11yProps('payouts')}
                          component={Router.Link}
                          to="/account/payouts"
                          value="/account/payouts"
                        />
                        <Tab
                          label="Referrals"
                          {...a11yProps('referrals')}
                          component={Router.Link}
                          to="/account/referrals"
                          value="/account/referrals"
                        />
                      </Tabs>
                    </AppBar>
                    <>
                      <Router.Switch>
                        <Router.Route
                          exact
                          path="/account"
                          render={() => (
                            <TabPanel name="account">
                              <Typography variant="h5">Account Info</Typography>
                              <Typography>Your current reading level is ${profile.ral}</Typography>
                              <br />
                              <AccountPrefs profile={profile} credentials={credentials} />
                            </TabPanel>
                          )}
                        />
                        <Router.Route
                          path="/account/balance"
                          render={() => (
                            <TabPanel name="balance">
                              <Typography variant="h5">Account balance</Typography>

                              {balance && <BalanceTable rows={makeRowsFromBalance(balance)} />}
                            </TabPanel>
                          )}
                        />
                        <Router.Route
                          path="/account/payouts"
                          render={params => (
                            <TabPanel name="payouts">
                              <PayoutsPage searchString={params.location.search} />
                            </TabPanel>
                          )}
                        />
                        <Router.Route
                          path="/account/referrals"
                          render={() => (
                            <TabPanel name="referrals">
                              <Typography variant="h5">Referrals</Typography>
                              <br />
                              <Typography>
                                For each person you invite, we&apos;ll give you a $20 account
                                credit. Just share your reflink, and if your friends sign up, you
                                get twenty bucks.
                              </Typography>
                              <br />
                              <Grid container spacing={1} alignItems="center">
                                <Grid item>
                                  <Box className={classes.urlBox}>
                                    <Typography variant="h5">{getRefLink()}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item>
                                  <Box>
                                    <Button
                                      onClick={() => {
                                        navigator.clipboard.writeText(getRefLink())
                                      }}
                                    >
                                      <CopyIcon>copy</CopyIcon>
                                      Copy
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            </TabPanel>
                          )}
                        />
                      </Router.Switch>
                    </>
                  </>
                )}
              />
            </Paper>
          </Container>
        </DefaultLayout>
      </ClientInit>
    )
  }
  return (
    <ClientInit>
      <Loading centerOnPage />
    </ClientInit>
  )
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
