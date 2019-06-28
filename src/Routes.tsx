import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import Loading from './components/widgets/Loading'
import { ApplicationState } from './store'
import { ClientState } from './store/client/types'

interface PropsFromState {
  clientState: ClientState
}

const LazySignUpPage = React.lazy(() => import('./pages/SignUpPage'))
const LazyIndexPage = React.lazy(() => import('./pages/IndexPage'))
const LazyRoot = React.lazy(() => import('./components/layout/Root'))

const RoutesFC: React.FunctionComponent<PropsFromState> = ({ clientState }) => (
  <React.Suspense fallback={<Loading />}>
    <LazyRoot>
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            if (clientState.client) {
              return <LazyIndexPage />
            } else {
              return <Redirect to="/signup" />
            }
          }}
        />
        <Route exact path="/signup" component={LazySignUpPage} />
        <Route component={() => <div>Not Found</div>} />
      </Switch>
    </LazyRoot>
  </React.Suspense>
)

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  clientState
})

const Routes = connect(mapStateToProps)(RoutesFC)

export default Routes
