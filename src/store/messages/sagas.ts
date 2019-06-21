import { all, call, fork, put, select, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from 'store'
import { clientFromState } from 'store/api'
import {
  fetchMessagesError,
  fetchMessagesSuccess,
  initializeMessagesError,
  initializeMessagesSuccess
} from 'store/messages/actions'
import { MessagesActionTypes } from 'store/messages/types'

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

async function fetchMessages(state: ApplicationState) {
  const client = clientFromState(state)
  return client.get('/messages')
}

function* handleFetchMessages() {
  try {
    const state = yield select()
    const res = yield call(fetchMessages, state)

    if (res.error) {
      yield put(fetchMessagesError(res.error))
    } else {
      yield put(fetchMessagesSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(fetchMessagesError(err.stack!))
    } else {
      yield put(fetchMessagesError('An unknown error occured.'))
    }
  }
}

function* watchFetchMessagesRequest() {
  yield takeEvery(MessagesActionTypes.FETCH_MESSAGES_REQUEST, handleFetchMessages)
}

export function* sagas() {
  yield all([fork(watchInitializeMessagesRequest), fork(watchFetchMessagesRequest)])
}
