import { ConnectedRouter } from 'connected-react-router'
import { History } from 'history'
import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import Loading from './components/widgets/Loading'
import { ApplicationState } from './store'

interface MainProps {
  store: Store<ApplicationState>
  history: History
}

const LazyRoutes = React.lazy(() => import('./Routes'))

export const Main: React.FC<MainProps> = ({ store, history }) => {
  return (
    <React.Suspense fallback={<Loading centerOnPage={true} />}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <LazyRoutes />
        </ConnectedRouter>
      </Provider>
    </React.Suspense>
  )
}
