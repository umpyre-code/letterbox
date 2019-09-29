import { AppBar, Box, Container, Paper, Tab, Tabs, Typography, Divider } from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import * as Router from 'react-router-dom'
import ClientInit from '../components/ClientInit'
import { DefaultLayout } from '../components/layout/DefaultLayout'
import { AccountPrefs } from '../components/widgets/AccountPrefs'
import { AccountReferrals } from '../components/widgets/AccountReferrals'
import { AccountTransactions } from '../components/widgets/AccountTransactions'
import { BackToIndexButton } from '../components/widgets/BackToIndexButton'
import { BalanceTable, makeRowsFromBalance } from '../components/widgets/BalanceTable'
import Loading from '../components/widgets/Loading'
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

const AccountPageFC: React.FC<AccountPageProps> = ({ balance, profile, credentials }) => {
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
                              <Divider />
                              <br />
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
                              <Divider />
                              <br />
                              {balance && <BalanceTable rows={makeRowsFromBalance(balance)} />}
                              <br />
                              <AccountTransactions profile={profile} credentials={credentials} />
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
                              <AccountReferrals profile={profile} credentials={credentials} />
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
