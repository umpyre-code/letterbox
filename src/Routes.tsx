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
const LazyProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const LazyAccountPage = React.lazy(() => import('./pages/AccountPage'))
const LazyRoot = React.lazy(() => import('./components/layout/Root'))

const RoutesFC: React.FunctionComponent<PropsFromState> = ({ clientState }) => (
  <React.Suspense fallback={<Loading centerOnPage={true} />}>
    <LazyRoot>
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            if (clientState.credentials) {
              return <LazyIndexPage />
            } else {
              return <Redirect to="/signup" />
            }
          }}
        />
        <Route exact path="/signup" component={LazySignUpPage} />
        <Route exact path="/profile" component={LazyProfilePage} />
        <Route exact path="/account" component={LazyAccountPage} />
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
