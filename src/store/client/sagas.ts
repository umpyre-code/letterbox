import axios, { AxiosError } from 'axios'
import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { ClientActionTypes, NewClient, Client } from './types'
import {
  submitNewClientError,
  submitNewClientRequest,
  submitNewClientSuccess,
  initializeClientError,
  initializeClientSuccess
} from './actions'
import db from '../../db/db'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://api.staging.umpyre.io'

function initializeClient() {
  return db.api_tokens
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
}

function submitNewClient(new_client: NewClient) {
  return axios.post(API_ENDPOINT + '/client', new_client)
}

function saveClientToken(client: Client) {
  db.api_tokens.add({ ...client, created_at: new Date() })
}

function* handleSubmitNewClientRequest(action: ReturnType<typeof submitNewClientRequest>) {
  try {
    const res = yield call(submitNewClient, action.payload)

    if (res.error) {
      yield put(submitNewClientError(res.error))
    } else {
      yield call(saveClientToken, res.data)
      yield put(submitNewClientSuccess(res))
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
  yield call(action.meta.setSubmitting, false)
}

function* watchSubmitNewClientRequest() {
  yield takeEvery(ClientActionTypes.INITIALIZE_CLIENT_REQUEST, handleInitializeClientRequest)
}

function* watchInitializeClientRequest() {
  yield takeEvery(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST, handleSubmitNewClientRequest)
}

function* clientSaga() {
  yield all([fork(watchSubmitNewClientRequest), fork(watchInitializeClientRequest)])
}

export default clientSaga
