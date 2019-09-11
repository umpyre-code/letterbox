import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import { Action, AnyAction, combineReducers, Dispatch } from 'redux'
import { all, fork } from 'redux-saga/effects'
import { reducer as accountReducer } from './account/reducer'
import { sagas as accountSagas } from './account/sagas'
import { reducer as clientReducer } from './client/reducer'
import { sagas as clientSagas } from './client/sagas'
import { reducer as draftsReducer } from './drafts/reducer'
import { sagas as draftsSagas } from './drafts/sagas'
import { reducer as keysReducer } from './keys/reducer'
import { sagas as keysSagas } from './keys/sagas'
import { reducer as messagesReducer } from './messages/reducer'
import { sagas as messagesSagas } from './messages/sagas'

export interface ConnectedReduxProps<A extends Action = AnyAction> {
  dispatch: Dispatch<A>
}

export const createRootReducer = (history: History) =>
  combineReducers({
    accountState: accountReducer,
    clientState: clientReducer,
    draftsState: draftsReducer,
    keysState: keysReducer,
    messagesState: messagesReducer,
    router: connectRouter(history)
  })

export function* rootSaga() {
  yield all([
    fork(accountSagas),
    fork(clientSagas),
    fork(draftsSagas),
    fork(keysSagas),
    fork(messagesSagas)
  ])
}
