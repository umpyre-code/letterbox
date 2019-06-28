import { push } from 'connected-react-router'
import { all, call, delay, fork, put, select, spawn, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from '..'
import { db } from '../../db/db'
import { API } from '../api'
import { ClientCredentials } from '../models/client'
import {
  fetchClientError,
  fetchClientRequest,
  fetchClientSuccess,
  initializeClientError,
  initializeClientSuccess,
  submitNewClientError,
  submitNewClientRequest,
  submitNewClientSuccess
} from './actions'
import { ClientActionTypes } from './types'

function initializeClient() {
  return db.apiTokens
    .orderBy(':id')
    .reverse()
    .limit(1)
    .first()
}

function* handleInitializeClientRequest() {
  try {
    const res = yield call(initializeClient)

    if (res && res.error) {
      yield put(initializeClientError(res.error))
    } else {
      yield put(initializeClientSuccess(res))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(initializeClientError(err.response.data.message))
    } else if (err.message) {
      yield put(initializeClientError(err.message))
    } else {
      yield put(initializeClientError(err))
    }
  }

  // Start client fetch loop
  yield put(fetchClientRequest())
}

function* delayThenFetchClient() {
  const fetchIntervalMillis = 1500
  yield delay(fetchIntervalMillis)
  yield put(fetchClientRequest())
}

function* handleFetchClientRequest() {
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(API.FETCH_CLIENT, credentials, state.clientState.credentials!.client_id)

    if (res.error) {
      yield put(fetchClientError(res.error))
    } else {
      yield put(fetchClientSuccess(res))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(fetchClientError(err.response.data.message))
    } else if (err.message) {
      yield put(fetchClientError(err.message))
    } else {
      yield put(fetchClientError(err))
    }
  }
  yield spawn(delayThenFetchClient)
}

function saveClientToken(client: ClientCredentials) {
  db.apiTokens.add({ ...client, created_at: new Date() })
}

function* handleSubmitNewClientRequest(values: ReturnType<typeof submitNewClientRequest>) {
  const { payload, meta } = values
  const { actions } = meta
  try {
    const res = yield call(API.SUBMIT_NEW_CLIENT, payload)

    if (res.error) {
      yield put(submitNewClientError(res.error))
    } else {
      yield call(saveClientToken, res)
      yield put(submitNewClientSuccess(res))
      yield put(push('/'))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(submitNewClientError(err.response.data.message))
    } else if (err.message) {
      yield put(submitNewClientError(err.message))
    } else {
      yield put(submitNewClientError(err))
    }
  }
  yield call(actions.setSubmitting, false)
}

function* watchInitializeClientRequest() {
  yield takeEvery(ClientActionTypes.INITIALIZE_CLIENT_REQUEST, handleInitializeClientRequest)
}

function* watchFetchClientRequest() {
  yield takeEvery(ClientActionTypes.FETCH_CLIENT_REQUEST, handleFetchClientRequest)
}

function* watchSubmitNewClientRequest() {
  yield takeEvery(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST, handleSubmitNewClientRequest)
}

export function* sagas() {
  yield all([
    fork(watchInitializeClientRequest),
    fork(watchFetchClientRequest),
    fork(watchSubmitNewClientRequest)
  ])
}
