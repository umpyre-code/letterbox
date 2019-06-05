import { combineReducers, Dispatch, Action, AnyAction } from 'redux'
import { all, fork } from 'redux-saga/effects'
import { connectRouter, RouterState } from 'connected-react-router'
import { History } from 'history'

import clientSaga from './client/sagas'
import { clientReducer } from './client/reducer'
import { clientState } from './client/types'

export interface ApplicationState {
  client: clientState
  router: RouterState
}

export interface ConnectedReduxProps<A extends Action = AnyAction> {
  dispatch: Dispatch<A>
}

export const createRootReducer = (history: History) =>
  combineReducers({
    client: clientReducer,
    router: connectRouter(history)
  })

export function* rootSaga() {
  yield all([fork(clientSaga)])
}
