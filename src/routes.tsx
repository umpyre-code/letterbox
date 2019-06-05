import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import Root from './components/layout/Root'
import Header from './components/layout/Header'
import IndexPage from './pages/index'

const Routes: React.SFC = () => (
  <Root>
    <Header title="Umpyre" />
    <Switch>
      <Route exact path="/" component={IndexPage} />
      <Route component={() => <div>Not Found</div>} />
    </Switch>
  </Root>
)

export default Routes
