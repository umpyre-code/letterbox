import { combineReducers, Dispatch, Action, AnyAction } from 'redux'
import { all, fork } from 'redux-saga/effects'
import { connectRouter, RouterState } from 'connected-react-router'
import { History } from 'history'

import clientSaga from './client/sagas'
import { clientReducer } from './client/reducer'
import { ClientState } from './client/types'
import keysSaga from './keys/sagas'
import { keysReducer } from './keys/reducer'
import { KeysState } from './keys/types'
import { MessagesState } from './messages/types'
import messagesSaga from './messages/sagas'
import { messagesReducer } from './messages/reducer'

export interface ApplicationState {
  clientState: ClientState
  keysState: KeysState
  messagesState: MessagesState
  router: RouterState
}

export interface ConnectedReduxProps<A extends Action = AnyAction> {
  dispatch: Dispatch<A>
}

export const createRootReducer = (history: History) =>
  combineReducers({
    clientState: clientReducer,
    keysState: keysReducer,
    messagesState: messagesReducer,
    router: connectRouter(history)
  })

export function* rootSaga() {
  yield all([fork(clientSaga), fork(keysSaga), fork(messagesSaga)])
}
