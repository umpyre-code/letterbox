import { all, call, fork, put, takeEvery, select } from 'redux-saga/effects'
import axios, { AxiosError } from 'axios'
import { MessagesActionTypes } from './types'
import {
  initializeMessagesError,
  initializeMessagesSuccess,
  fetchMessagesError,
  fetchMessagesSuccess
} from './actions'
import { arrayExpression } from '@babel/types'
import API_ENDPOINT from '../api'
import { ApplicationState } from '..'

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
  const API_KEY = state.clientState.client!.token
  return axios.get(API_ENDPOINT + '/messages', { headers: { 'X-UMPYRE-APIKEY': API_KEY } })
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

function* messagesSaga() {
  yield all([fork(watchInitializeMessagesRequest), fork(watchFetchMessagesRequest)])
}

export default messagesSaga
