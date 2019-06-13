import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Switch, Redirect } from 'react-router-dom'

import Root from './components/layout/Root'
import { ApplicationState } from './store'
import { ClientState } from './store/client/types'
import Loading from './components/util/Loading'

interface PropsFromState {
  client: ClientState
}

const SignUpPage = React.lazy(() => import('./pages/signup'))
const IndexPage = React.lazy(() => import('./pages/index'))

const Routes: React.FunctionComponent<PropsFromState> = ({ client }) => (
  <Root>
    <React.Suspense fallback={<Loading />}>
      <Switch>
        <Route
          exact
          path="/"
          render={client.client ? () => <IndexPage /> : () => <Redirect to="/signup" />}
        />
        <Route exact path="/signup" component={SignUpPage} />
        <Route component={() => <div>Not Found</div>} />
      </Switch>
    </React.Suspense>
  </Root>
)

const mapStateToProps = ({ client, keys }: ApplicationState) => ({
  client: client
})

export default connect(mapStateToProps)(Routes)
