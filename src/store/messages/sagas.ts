import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { MessagesActionTypes } from './types'
import { initializeMessagesError, initializeMessagesSuccess } from './actions'

async function initializeMessages() {
  return Array.from([])
}

function* handleInitializeMessages() {
  try {
    const res = yield call(initializeMessages)

    if (res.error) {
      yield put(initializeMessagesError(res.error))
    } else {
      yield put(initializeMessagesSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(initializeMessagesError(err.stack!))
    } else {
      yield put(initializeMessagesError('An unknown error occured.'))
    }
  }
}

function* watchInitializeMessagesRequest() {
  yield takeEvery(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST, handleInitializeMessages)
}

function* messagesSaga() {
  yield all([fork(watchInitializeMessagesRequest)])
}

export default messagesSaga
