import { push } from 'connected-react-router'
import * as jwt from 'jsonwebtoken'
import { all, call, fork, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import * as srp from 'secure-remote-password/client'
import { SHA3 } from 'sha3'
import { ApplicationState } from '..'
import { db } from '../../db/db'
import { fetchBalanceRequest } from '../account/actions'
import { API } from '../api'
import { initializeDraftsRequest } from '../drafts/actions'
import { initializeKeysRequest } from '../keyPairs/actions'
import { KeyPair } from '../keyPairs/types'
import { initializeMessagesRequest } from '../messages/actions'
import { ClientCredentials, ClientProfile, Jwt, JwtClaims, NewClient } from '../models/client'
import {
  fetchClientError,
  fetchClientRequest,
  fetchClientSuccess,
  initializeClientError,
  initializeClientSuccess,
  submitNewClientError,
  submitNewClientRequest,
  submitNewClientSuccess,
  updateClientProfileError,
  updateClientProfileRequest,
  updateClientProfileSuccess
} from './actions'
import { ClientActionTypes } from './types'

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

async function initializeClient() {
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
      if (res && res.client_id) {
        // If we got a client API token, kick off other init actions
        yield put(fetchClientRequest())
        yield put(initializeKeysRequest())
        yield put(initializeDraftsRequest())
        yield put(initializeMessagesRequest())
        yield put(fetchBalanceRequest())
      }
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
}

function verifyJwt(credentials: ClientCredentials): ClientCredentials {
  const verifiedJwt: Jwt = {
    ...credentials.jwt,
    claims: jwt.verify(credentials.jwt.token, credentials.jwt.secret, {
      clockTolerance: 300
    }) as JwtClaims
  }
  return {
    ...credentials,
    jwt: verifiedJwt
  }
}

async function saveClientToken(credentials: ClientCredentials) {
  const verifiedCredentials = verifyJwt(credentials)
  await db.apiTokens.add({ ...verifiedCredentials, created_at: new Date() })
  return Promise.resolve(verifiedCredentials)
}

async function withPassword(newClient: NewClient): Promise<NewClient> {
  await sodium.ready
  const salt = srp.generateSalt()
  const hash = new SHA3(512)
  hash.update(salt, 'hex')
  hash.update(`${newClient.email}:${newClient.password!}`)
  const privateKey = hash.digest('hex')
  const verifier = sodium.from_hex(srp.deriveVerifier(privateKey))
  const client = {
    ...newClient,
    password_salt: sodium.to_base64(salt, sodium.base64_variants.URLSAFE_NO_PADDING),
    password_verifier: sodium.to_base64(verifier, sodium.base64_variants.URLSAFE_NO_PADDING)
  }
  // Do not transmit password to server
  delete client.password
  return client
}

async function submitNewClient(newClient: NewClient, keyPair: KeyPair): Promise<ClientCredentials> {
  const newClientWithPassword = await withPassword(newClient)
  // Add public keys
  const newClientHashedWithKeys = {
    ...newClientWithPassword,
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
      const credentials = yield call(saveClientToken, res)
      yield put(submitNewClientSuccess(credentials))
      yield put(fetchBalanceRequest())
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

  // Fetch the client profile
  yield put(fetchClientRequest())
}

async function updateClientProfile(
  credentials: ClientCredentials,
  clientProfile: ClientProfile
): Promise<ClientProfile> {
  const api = new API(credentials)
  return api.updateClientProfile(clientProfile)
}

function* handleUpdateClientProfileRequest(values: ReturnType<typeof updateClientProfileRequest>) {
  const { payload, meta } = values
  const { actions, setIsEditing } = meta
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const oldHandle = state.clientState.profile!.handle
    const res = yield call(updateClientProfile, credentials, payload)

    if (res.error) {
      yield put(updateClientProfileError(res.error))
    } else {
      yield put(updateClientProfileSuccess(res))
      yield call(setIsEditing, false)
      const newHandle = res.handle
      if (newHandle && newHandle !== '' && newHandle !== oldHandle) {
        yield put(push(`/c/${newHandle}`))
      }
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(updateClientProfileError(err.response.data.message))
    } else if (err.message) {
      yield put(updateClientProfileError(err.message))
    } else {
      yield put(updateClientProfileError(err))
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

function* watchUpdateClientProfileRequest() {
  yield takeLatest(
    ClientActionTypes.UPDATE_CLIENT_PROFILE_REQUEST,
    handleUpdateClientProfileRequest
  )
}

export function* sagas() {
  yield all([
    fork(watchFetchClientRequest),
    fork(watchInitializeClientRequest),
    fork(watchSubmitNewClientRequest),
    fork(watchUpdateClientProfileRequest)
  ])
}
