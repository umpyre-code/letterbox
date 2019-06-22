import { ConnectedRouter } from 'connected-react-router'
import { History } from 'history'
import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { Routes } from './Routes'
import { ApplicationState } from './store'

interface MainProps {
  store: Store<ApplicationState>
  history: History
}

export const Main: React.FC<MainProps> = ({ store, history }) => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </Provider>
  )
}
