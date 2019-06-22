import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Root } from './components/layout/Root'
import Loading from './components/widgets/Loading'
import { ApplicationState } from './store'
import { ClientState } from './store/client/types'

interface PropsFromState {
  clientState: ClientState
}

const SignUpPage = React.lazy(() => import('./pages/signup'))
const IndexPage = React.lazy(() => import('./pages/index'))

const RoutesFC: React.FunctionComponent<PropsFromState> = ({ clientState }) => (
  <Root>
    <React.Suspense fallback={<Loading />}>
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            if (clientState.client) {
              return <IndexPage />
            } else {
              return <Redirect to="/signup" />
            }
          }}
        />
        <Route exact path="/signup" component={SignUpPage} />
        <Route component={() => <div>Not Found</div>} />
      </Switch>
    </React.Suspense>
  </Root>
)

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  clientState
})

export const Routes = connect(mapStateToProps)(RoutesFC)
