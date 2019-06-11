import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import Root from './components/layout/Root'
import SignUpPage from './pages/signup'

const Routes: React.SFC = () => (
  <Root>
    <Switch>
      <Route exact path="/" component={SignUpPage} />
      <Route component={() => <div>Not Found</div>} />
    </Switch>
  </Root>
)

export default Routes
