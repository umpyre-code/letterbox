import { all, call, delay, fork, put, select, spawn, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from '../'
import { clientFromState } from '../api'
import {
  fetchMessagesError,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  initializeMessagesError,
  initializeMessagesSuccess
} from './actions'
import { MessagesActionTypes } from './types'

async function initializeMessages() {
  return Array.from([
    {
      body: '# Welcome to Umpyre 🤗\nUmpyre is a messaging service.',
      created_at: new Date(),
      from: 'Umpyre',
      hash: 'lol',
      to: 'you'
    }
  ])
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

  // Start message fetch loop
  yield put(fetchMessagesRequest())
}

function* watchInitializeMessagesRequest() {
  yield takeEvery(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST, handleInitializeMessages)
}

async function fetchMessages(state: ApplicationState) {
  const client = clientFromState(state)
  return client.get('/messages')
}

function* delayThenFetchMessages() {
  const fetchIntervalMillis = 1500
  yield delay(fetchIntervalMillis)
  yield put(fetchMessagesRequest())
}

// Message fetch main loop: this saga runs forever and ever
function* handleFetchMessages() {
  try {
    const state = yield select()
    const res = yield call(fetchMessages, state)

    if (res.error) {
      yield put(fetchMessagesError(res.error))
    } else {
      yield put(fetchMessagesSuccess(res.data))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(fetchMessagesError(err.response.data.message))
    } else if (err.message) {
      yield put(fetchMessagesError(err.message))
    } else {
      yield put(fetchMessagesError(err))
    }
  }
  yield spawn(delayThenFetchMessages)
}

function* watchFetchMessagesRequest() {
  yield takeEvery(MessagesActionTypes.FETCH_MESSAGES_REQUEST, handleFetchMessages)
}

export function* sagas() {
  yield all([fork(watchInitializeMessagesRequest), fork(watchFetchMessagesRequest)])
}
