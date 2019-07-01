import { connectRouter, RouterState } from 'connected-react-router'
import { History } from 'history'
import { Action, AnyAction, combineReducers, Dispatch } from 'redux'
import { all, fork } from 'redux-saga/effects'
import { reducer as clientReducer } from './client/reducer'
import { sagas as clientSagas } from './client/sagas'
import { ClientState } from './client/types'
import { reducer as draftsReducer } from './drafts/reducer'
import { sagas as draftsSagas } from './drafts/sagas'
import { DraftsState } from './drafts/types'
import { reducer as keysReducer } from './keyPairs/reducer'
import { sagas as keysSagas } from './keyPairs/sagas'
import { KeysState } from './keyPairs/types'
import { reducer as messagesReducer } from './messages/reducer'
import { sagas as messagesSagas } from './messages/sagas'
import { MessagesState } from './messages/types'

export interface ApplicationState {
  clientState: ClientState
  draftsState: DraftsState
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
    draftsState: draftsReducer,
    keysState: keysReducer,
    messagesState: messagesReducer,
    router: connectRouter(history)
  })

export function* rootSaga() {
  yield all([fork(clientSagas), fork(draftsSagas), fork(keysSagas), fork(messagesSagas)])
}
