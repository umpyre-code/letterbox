import { push } from 'connected-react-router'
import { all, call, delay, fork, put, select, spawn, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from '..'
import { db } from '../../db/db'
import { API } from '../api'
import { KeyPair } from '../keyPairs/types'
import { ClientCredentials, NewClient } from '../models/client'
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

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

function initializeClient() {
  return db.apiTokens
    .orderBy('created_at')
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

function saveClientToken(credentials: ClientCredentials) {
  db.apiTokens.add({ ...credentials, created_at: new Date() })
}

async function withHashedPassword(newClient: NewClient): Promise<NewClient> {
  await sodium.ready
  return {
    ...newClient,
    password_hash: sodium.to_base64(
      sodium.crypto_generichash(64, sodium.from_string(newClient.password_hash)),
      sodium.base64_variants.ORIGINAL_NO_PADDING
    )
  }
}

async function submitNewClient(newClient: NewClient, keyPair: KeyPair): Promise<ClientCredentials> {
  const newClientHashed = await withHashedPassword(newClient)
  // Add public keys
  const newClientHashedWithKeys = {
    ...newClientHashed,
    box_public_key: keyPair.box_public_key,
    signing_public_key: keyPair.signing_public_key
  }
  return API.SUBMIT_NEW_CLIENT(newClientHashedWithKeys)
}

function* handleSubmitNewClientRequest(values: ReturnType<typeof submitNewClientRequest>) {
  const { payload, meta } = values
  const { actions } = meta
  try {
    const state: ApplicationState = yield select()
    const currentKeyPair = state.keysState.current_key!
    const res = yield call(submitNewClient, payload, currentKeyPair)

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
