import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Switch, Redirect } from 'react-router-dom'

import Root from './components/layout/Root'
import LoadableSignUpPage from './pages/loadable-signup'
import LoadableIndexPage from './pages/loadable-index'
import { ApplicationState } from './store'
import { ClientState } from './store/client/types'

interface PropsFromState {
  client: ClientState
}

const Routes: React.FunctionComponent<PropsFromState> = ({ client }) => (
  <Root>
    <Switch>
      <Route
        exact
        path="/"
        render={client.client ? () => <LoadableIndexPage /> : () => <Redirect to="/signup" />}
      />
      <Route exact path="/signup" component={LoadableSignUpPage} />
      <Route component={() => <div>Not Found</div>} />
    </Switch>
  </Root>
)

const mapStateToProps = ({ client, keys }: ApplicationState) => ({
  client: client
})

export default connect(mapStateToProps)(Routes)
