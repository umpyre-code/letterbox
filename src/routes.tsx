import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Switch, Redirect } from 'react-router-dom'

import Root from './components/layout/Root'
import { ApplicationState } from './store'
import { ClientState } from './store/client/types'
import Loading from './components/widgets/Loading'

interface PropsFromState {
  clientState: ClientState
}

const SignUpPage = React.lazy(() => import('./pages/signup'))
const IndexPage = React.lazy(() => import('./pages/index'))

const Routes: React.FunctionComponent<PropsFromState> = ({ clientState }) => (
  <Root>
    <React.Suspense fallback={<Loading />}>
      <Switch>
        <Route
          exact
          path="/"
          render={clientState.client ? () => <IndexPage /> : () => <Redirect to="/signup" />}
        />
        <Route exact path="/signup" component={SignUpPage} />
        <Route component={() => <div>Not Found</div>} />
      </Switch>
    </React.Suspense>
  </Root>
)

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  clientState: clientState
})

export default connect(mapStateToProps)(Routes)
