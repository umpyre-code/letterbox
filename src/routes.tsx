import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import Root from './components/layout/Root'
import SignUpPage from './pages/signup'
import IndexPage from './pages/index'

const Routes: React.FunctionComponent = ({ children }) => (
  <Root>
    <Switch>
      <Route exact path="/" component={IndexPage} />
      <Route exact path="/signup" component={SignUpPage} />
      <Route component={() => <div>Not Found</div>} />
    </Switch>
  </Root>
)

export default Routes
