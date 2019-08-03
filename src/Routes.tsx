import * as React from 'react'
import { connect } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import Root from './components/layout/Root'
import Loading from './components/widgets/Loading'
import { ApplicationState } from './store'
import { ClientState } from './store/client/types'

interface PropsFromState {
  clientState: ClientState
}

const LazyAccountPage = React.lazy(() => import('./pages/AccountPage'))
const LazyAddCreditsPage = React.lazy(() => import('./pages/AddCreditsPage'))
const LazyIndexPage = React.lazy(() => import('./pages/IndexPage'))
const LazyProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const LazySignUpPage = React.lazy(() => import('./pages/SignUpPage'))

const RoutesFC: React.FunctionComponent<PropsFromState> = ({ clientState }) => (
  <React.Suspense fallback={<Loading centerOnPage={true} />}>
    <Root>
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
        <Route path="/account" component={LazyAccountPage} />
        <Route exact path="/profile" component={LazyProfilePage} />
        <Route exact path="/addcredits" component={LazyAddCreditsPage} />
        <Route path="/c/:handle" component={LazyProfilePage} />
        <Route component={() => <div>Not Found</div>} />
      </Switch>
    </Root>
  </React.Suspense>
)

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  clientState
})

const Routes = connect(mapStateToProps)(RoutesFC)

export default Routes
