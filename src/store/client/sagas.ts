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
import { loadKeysRequest } from '../keyPairs/actions'
import { handleInitializeKeys } from '../keyPairs/sagas'
import { KeyPair } from '../keyPairs/types'
import { initializeMessagesRequest } from '../messages/actions'
import { ClientCredentials, ClientProfile, Jwt, JwtClaims, NewClient } from '../models/client'
import {
  fetchClientError,
  fetchClientRequest,
  fetchClientSuccess,
  loadCredentialsError,
  loadCredentialsSuccess,
  signoutRequest,
  signoutSuccess,
  submitNewClientError,
  submitNewClientRequest,
  submitNewClientSuccess,
  updateClientProfileError,
  updateClientProfileRequest,
  updateClientProfileSuccess,
  verifyPhoneError,
  verifyPhoneRequest,
  verifyPhoneSuccess
} from './actions'
import { ClientActionTypes } from './types'

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

async function loadCredentials() {
  return db.apiTokens
    .orderBy('created_at')
    .reverse()
    .limit(1)
    .first()
}

function* handleLoadCredentialsRequest() {
  try {
    const res = yield call(loadCredentials)

    if (res && res.error) {
      yield put(loadCredentialsError(res.error))
    } else {
      if (res && res.client_id) {
        yield put(loadCredentialsSuccess(res))
        // If we got a client API token, kick off other init actions
        yield put(fetchClientRequest())
        yield put(loadKeysRequest())
        yield put(initializeDraftsRequest())
        yield put(initializeMessagesRequest())
        yield put(fetchBalanceRequest())
      } else {
        yield put(loadCredentialsError('no credentials found'))
      }
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(loadCredentialsError(err.response.data.message))
    } else if (err.message) {
      yield put(loadCredentialsError(err.message))
    } else {
      yield put(loadCredentialsError(err))
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
    // First, clear out any old state
    yield call(signout)
    // Generate new keys
    yield call(handleInitializeKeys)

    // Now we can proceed with fresh state
    const state: ApplicationState = yield select()
    const currentKeyPair = state.keysState.current_key!
    const res = yield call(submitNewClient, payload, currentKeyPair)

    if (res.error) {
      yield put(submitNewClientError(res.error))
    } else {
      const credentials = yield call(saveClientToken, res)
      yield put(submitNewClientSuccess(credentials))
      yield put(fetchBalanceRequest())
      yield put(fetchClientRequest())
      yield put(push('/flashseed'))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      if (err.response.data.code && err.response.data.code === 3) {
        yield put(
          submitNewClientError(
            'Either the email address or phone number you provided is already in use'
          )
        )
      } else {
        yield put(submitNewClientError(err.response.data.message))
      }
    } else if (err.message) {
      yield put(submitNewClientError(err.message))
    } else {
      yield put(submitNewClientError(err))
    }
  }
  yield call(actions.setSubmitting, false)
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

function* watchLoadCredentialsRequest() {
  yield takeEvery(ClientActionTypes.LOAD_CREDENTIALS_REQUEST, handleLoadCredentialsRequest)
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

async function verifyPhone(credentials: ClientCredentials, code: number) {
  const api = new API(credentials)
  return api.verifyPhone(code)
}

function* handleVerifyPhoneRequest(values: ReturnType<typeof verifyPhoneRequest>) {
  const { payload } = values
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(verifyPhone, credentials, payload)

    if (res.error) {
      yield put(verifyPhoneError(res.error))
    } else if (res && res.client) {
      yield put(verifyPhoneSuccess(res.client))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(verifyPhoneError(err.response.data.message))
    } else if (err.message) {
      yield put(verifyPhoneError(err.message))
    } else {
      yield put(verifyPhoneError(err))
    }
  }
}

function* watchVerifyPhoneRequest() {
  yield takeLatest(ClientActionTypes.VERIFY_PHONE_REQUEST, handleVerifyPhoneRequest)
}

async function signout() {
  // Delete the DB
  await db.deleteAndReset()
}

function* handleSignoutRequest(values: ReturnType<typeof signoutRequest>) {
  try {
    const res = yield call(signout)
    yield put(signoutSuccess())
    yield put(push('/'))
  } catch (err) {
    // caught an error
    console.log(err)
  }
}

function* watchSignoutRequest() {
  yield takeLatest(ClientActionTypes.SIGNOUT_REQUEST, handleSignoutRequest)
}

export function* sagas() {
  yield all([
    fork(watchFetchClientRequest),
    fork(watchLoadCredentialsRequest),
    fork(watchSignoutRequest),
    fork(watchSubmitNewClientRequest),
    fork(watchUpdateClientProfileRequest),
    fork(watchVerifyPhoneRequest)
  ])
}
