import { connectRouter, RouterState } from 'connected-react-router'
import { History } from 'history'
import { Action, AnyAction, combineReducers, Dispatch } from 'redux'
import { all, fork } from 'redux-saga/effects'

import { reducer as clientReducer } from './client/reducer'
import { sagas as clientSagas } from './client/sagas'
import { ClientState } from './client/types'
import { reducer as keysReducer } from './keys/reducer'
import { sagas as keysSagas } from './keys/sagas'
import { KeysState } from './keys/types'
import { reducer as messagesReducer } from './messages/reducer'
import { sagas as messagesSagas } from './messages/sagas'
import { MessagesState } from './messages/types'

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
  yield all([fork(clientSagas), fork(keysSagas), fork(messagesSagas)])
}
