import * as React from 'react'
import { Route, Switch } from 'react-router-dom'
import Root from './components/layout/Root'
import Loading from './components/widgets/Loading'

const LazyAboutPage = React.lazy(() => import('./pages/AboutPage'))
const LazyAccountPage = React.lazy(() => import('./pages/AccountPage'))
const LazyAddCreditsPage = React.lazy(() => import('./pages/AddCreditsPage'))
const LazyFlashSeedPage = React.lazy(() => import('./pages/FlashSeedPage'))
const LazyIndexPage = React.lazy(() => import('./pages/IndexPage'))
const LazyMessagePage = React.lazy(() => import('./pages/MessagePage'))
const LazyProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const LazySignInPage = React.lazy(() => import('./pages/SignInPage'))
const LazySignOutPage = React.lazy(() => import('./pages/SignOutPage'))
const LazySignUpPage = React.lazy(() => import('./pages/SignUpPage'))

export const Routes: React.FunctionComponent = () => (
  <React.Suspense fallback={<Loading centerOnPage />}>
    <Root>
      <Switch>
        <Route exact path="/" component={LazyIndexPage} />
        <Route exact path="/about" component={LazyAboutPage} />
        <Route exact path="/signup" component={LazySignUpPage} />
        <Route exact path="/flashseed" component={LazyFlashSeedPage} />
        <Route exact path="/signin" component={LazySignInPage} />
        <Route exact path="/signout" component={LazySignOutPage} />
        <Route path="/account" component={LazyAccountPage} />
        <Route exact path="/profile" component={LazyProfilePage} />
        <Route exact path="/addcredits" component={LazyAddCreditsPage} />
        <Route path="/c/:handle" component={LazyProfilePage} />
        <Route path="/u/:clientId" component={LazyProfilePage} />
        <Route path="/m/:messageHash" component={LazyMessagePage} />
        <Route component={() => <div>Not Found</div>} />
      </Switch>
    </Root>
  </React.Suspense>
)
