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

const LazySignUpPage = React.lazy(() => import('./pages/SignUpPage'))
const LazyIndexPage = React.lazy(() => import('./pages/IndexPage'))

const RoutesFC: React.FunctionComponent<PropsFromState> = ({ clientState }) => (
  <Root>
    <React.Suspense fallback={<Loading />}>
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
    </React.Suspense>
  </Root>
)

const mapStateToProps = ({ clientState }: ApplicationState) => ({
  clientState
})

export const Routes = connect(mapStateToProps)(RoutesFC)
