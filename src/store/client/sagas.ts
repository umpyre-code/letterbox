import { push } from 'connected-react-router'
import * as jwt from 'jsonwebtoken'
import sodium from 'libsodium-wrappers'
import _ from 'lodash'
import {
  all,
  call,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
  throttle,
  delay,
  spawn
} from 'redux-saga/effects'
import * as srp from 'secure-remote-password/client'
import { db } from '../../db/db'
import { fetchBalanceRequest } from '../account/actions'
import { API } from '../api'
import { ApplicationState } from '../ApplicationState'
import { addDraftRequest, initializeDraftsRequest } from '../drafts/actions'
import { initializeKeysRequest, loadKeysRequest } from '../keys/actions'
import { KeyPair, KeysActionTypes } from '../keys/types'
import { initializeMessagesRequest } from '../messages/actions'
import { ClientCredentials, ClientProfile, Jwt, JwtClaims, NewClient } from '../models/client'
import {
  authError,
  authRequest,
  authSuccess,
  fetchClientError,
  fetchClientRequest,
  fetchClientSuccess,
  loadCredentialsError,
  loadCredentialsSuccess,
  signoutSuccess,
  submitNewClientError,
  submitNewClientRequest,
  submitNewClientSuccess,
  updateAndLoadCredentialsError,
  updateAndLoadCredentialsRequest,
  updateAndLoadCredentialsSuccess,
  updateClientProfileError,
  updateClientProfileRequest,
  updateClientProfileSuccess,
  verifyPhoneError,
  verifyPhoneRequest,
  verifyPhoneSuccess,
  updateClientRalRequest,
  updateClientRalError,
  updateClientRalSuccess,
  unathourizedClient
} from './actions'
import { AuthCreds, ClientActionTypes } from './types'

async function loadCredentials() {
  return db.apiTokens
    .orderBy('created_at')
    .reverse()
    .limit(1)
    .first()
}

async function computePrivateKey(email: string, password: string, salt: string): Promise<string> {
  await sodium.ready
  return sodium.to_hex(
    sodium.crypto_pwhash(
      64,
      `${email}:${password}`,
      sodium.from_hex(salt),
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_DEFAULT
    )
  )
}

function* handleLoadCredentialsRequest() {
  try {
    const res = yield call(loadCredentials)

    if (res && res.error) {
      yield put(loadCredentialsError(res.error))
    } else if (res && res.client_id) {
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
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      yield put(loadCredentialsError(error.response.data.message))
    } else if (error.message) {
      yield put(loadCredentialsError(error.message))
    } else {
      yield put(loadCredentialsError(error))
    }
  }
}

// We need to check the client periodically, to make sure our credentials are
// valid.
function* delayThenFetchClient() {
  const fetchIntervalMillis = 60000
  yield delay(fetchIntervalMillis)
  yield put(fetchClientRequest())
}

function* handleFetchClientRequest() {
  try {
    const state: ApplicationState = yield select()
    const { credentials } = state.clientState
    const res = yield call(API.FETCH_CLIENT, credentials, 'self')

    if (res.error) {
      yield put(fetchClientError(res.error))
    } else {
      yield put(fetchClientSuccess(res))
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      yield put(unathourizedClient())
    }
    if (error.response && error.response.data && error.response.data.message) {
      yield put(fetchClientError(error.response.data.message))
    } else if (error.message) {
      yield put(fetchClientError(error.message))
    } else {
      yield put(fetchClientError(error))
    }
  }

  // Start client fetch loop
  yield spawn(delayThenFetchClient)
}

async function authenticate(creds: AuthCreds): Promise<ClientCredentials> {
  await sodium.ready

  const clientEphemeral = srp.generateEphemeral()
  const aPub = sodium.to_base64(
    sodium.from_hex(clientEphemeral.public),
    sodium.base64_variants.URLSAFE_NO_PADDING
  )

  const handshake = await API.AUTH_HANDSHAKE({
    a_pub: aPub,
    email: creds.email
  })

  const salt = sodium.to_hex(
    sodium.from_base64(handshake.salt, sodium.base64_variants.URLSAFE_NO_PADDING)
  )

  const privateKey = await computePrivateKey(creds.email, creds.password, salt)

  const session = srp.deriveSession(
    clientEphemeral.secret,
    sodium.to_hex(sodium.from_base64(handshake.b_pub, sodium.base64_variants.URLSAFE_NO_PADDING)),
    salt,
    creds.email,
    privateKey
  )

  const clientProof = sodium.to_base64(
    sodium.from_hex(session.proof),
    sodium.base64_variants.URLSAFE_NO_PADDING
  )

  const response = await API.AUTH_VERIFY({
    a_pub: aPub,
    client_proof: clientProof,
    email: creds.email
  })

  srp.verifySession(
    clientEphemeral.public,
    session,
    sodium.to_hex(
      sodium.from_base64(response.server_proof, sodium.base64_variants.URLSAFE_NO_PADDING)
    )
  )

  return Promise.resolve({
    client_id: response.client_id,
    jwt: {
      ...response.jwt,
      secret: sodium.from_hex(session.key)
    }
  })
}

function verifyJwt(credentials: ClientCredentials): ClientCredentials {
  const verifiedJwt: Jwt = {
    ...credentials.jwt,
    claims: jwt.verify(credentials.jwt.token, Buffer.from(credentials.jwt.secret), {
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

  const salt = sodium.to_hex(sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES))

  const privateKey = await computePrivateKey(newClient.email, newClient.password, salt)

  const verifier = sodium.from_hex(srp.deriveVerifier(privateKey))
  const client = {
    ...newClient,
    password_salt: sodium.to_base64(
      sodium.from_hex(salt),
      sodium.base64_variants.URLSAFE_NO_PADDING
    ),
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

async function signout() {
  // Delete the DB
  await db.deleteAndReset()
}

function* handleSubmitNewClientRequest(values: ReturnType<typeof submitNewClientRequest>) {
  const { payload, meta } = values
  const { actions } = meta
  try {
    // Save a copy of any drafts. We do this so that someone who clicks on the
    // "message" and needs to go through the login/signup flow can see the draft
    // after.
    const prevState: ApplicationState = yield select()
    const { drafts } = prevState.draftsState
    // First, clear out any old state
    yield call(signout)

    // Generate new keys
    yield put(initializeKeysRequest())
    yield take(KeysActionTypes.INITIALIZE_KEYS_SUCCESS)

    // Proceed with fresh state
    const state: ApplicationState = yield select()
    const currentKeyPair = state.keysState.current_key
    const res = yield call(submitNewClient, payload, currentKeyPair)

    if (res.error) {
      yield put(submitNewClientError(res.error))
    } else {
      const authres = yield call(authenticate, payload as AuthCreds)
      const credentials = yield call(saveClientToken, authres)
      yield put(submitNewClientSuccess(credentials))
      yield put(fetchBalanceRequest())
      yield put(fetchClientRequest())
      if (drafts.length > 0) {
        yield put(addDraftRequest(_.last(drafts)))
      }
      yield put(push('/flashseed'))
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      if (error.response.data.code && error.response.data.code === 3) {
        if (error.response.data.message.startsWith('invalid email')) {
          yield put(submitNewClientError('The email address provided is not valid'))
        } else if (error.response.data.message.startsWith('invalid phone number')) {
          yield put(submitNewClientError('The phone number provided is not valid'))
        } else if (error.response.data.message.includes('unique violation')) {
          yield put(
            submitNewClientError(
              'Either the email address or phone number you provided is already in use'
            )
          )
        }
      } else {
        yield put(submitNewClientError(error.response.data.message))
      }
    } else if (error.message) {
      yield put(submitNewClientError(error.message))
    } else {
      yield put(submitNewClientError(error))
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
  const { actions, setIsEditing, redirect } = meta
  try {
    const state: ApplicationState = yield select()
    const { credentials } = state.clientState
    const oldHandle = state.clientState.profile.handle
    const res = yield call(updateClientProfile, credentials, payload)

    if (res.error) {
      yield put(updateClientProfileError(res.error))
    } else {
      yield put(updateClientProfileSuccess(res))
      if (setIsEditing) {
        yield call(setIsEditing, false)
      }
      const newHandle = res.handle
      if (redirect && newHandle && newHandle !== '' && newHandle !== oldHandle) {
        yield put(push(`/c/${newHandle}`))
      }
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      yield put(updateClientProfileError(error.response.data.message))
    } else if (error.message) {
      yield put(updateClientProfileError(error.message))
    } else {
      yield put(updateClientProfileError(error))
    }
  }
  if (actions) {
    yield call(actions.setSubmitting, false)
  }
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
    const { credentials } = state.clientState
    const res = yield call(verifyPhone, credentials, payload)

    if (res.error) {
      yield put(verifyPhoneError(res.error))
    } else if (res && res.client) {
      yield put(verifyPhoneSuccess(res.client))
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      yield put(verifyPhoneError(error.response.data.message))
    } else if (error.message) {
      yield put(verifyPhoneError(error.message))
    } else {
      yield put(verifyPhoneError(error))
    }
  }
}

function* watchVerifyPhoneRequest() {
  yield takeLatest(ClientActionTypes.VERIFY_PHONE_REQUEST, handleVerifyPhoneRequest)
}

function* handleSignoutRequest() {
  try {
    yield call(signout)
    yield put(signoutSuccess())
    yield put(push('/'))
  } catch (error) {
    // caught an error
  }
}

function* watchSignoutRequest() {
  yield takeLatest(ClientActionTypes.SIGNOUT_REQUEST, handleSignoutRequest)
}

function* handleAuthRequest(values: ReturnType<typeof authRequest>) {
  const { payload, meta } = values
  const { actions } = meta
  try {
    const res = yield call(authenticate, payload)

    if (res && res.error) {
      yield put(authError(res.error))
    } else if (res) {
      yield put(authSuccess(res))
      yield put(push('/inputseed'))
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      if (error.response.data.code && error.response.data.code === 3) {
        yield put(authError(error.response.data.message))
      }
    } else if (error.message) {
      yield put(authError(error.message))
    } else {
      yield put(authError(error))
    }
  }
  yield call(actions.setSubmitting, false)
}

function* watchAuthRequest() {
  yield takeLatest(ClientActionTypes.AUTH_REQUEST, handleAuthRequest)
}

function* handleUpdateAndLoadCredentialsRequest(
  values: ReturnType<typeof updateAndLoadCredentialsRequest>
) {
  const { payload } = values
  try {
    const res = yield call(saveClientToken, payload)

    if (res && res.error) {
      yield put(updateAndLoadCredentialsError(res.error))
    } else if (res && res.client_id) {
      yield put(updateAndLoadCredentialsSuccess(res))
      // If we got a client API token, kick off other init actions
      yield put(fetchClientRequest())
      yield put(loadKeysRequest())
      yield put(initializeDraftsRequest())
      yield put(initializeMessagesRequest())
      yield put(fetchBalanceRequest())
    } else {
      yield put(updateAndLoadCredentialsError('no credentials found'))
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      yield put(updateAndLoadCredentialsError(error.response.data.message))
    } else if (error.message) {
      yield put(updateAndLoadCredentialsError(error.message))
    } else {
      yield put(updateAndLoadCredentialsError(error))
    }
  }
}

function* watchUpdateAndLoadCredentialsRequest() {
  yield takeLatest(
    ClientActionTypes.UPDATE_AND_LOAD_CREDENTIALS_REQUEST,
    handleUpdateAndLoadCredentialsRequest
  )
}

async function updateRal(credentials: ClientCredentials, ral: number): Promise<ClientProfile> {
  const api = new API(credentials)
  return api.updateClientRal(credentials.client_id, ral)
}

function* handleUpdateClientRalRequest(values: ReturnType<typeof updateClientRalRequest>) {
  const { payload } = values
  try {
    const state: ApplicationState = yield select()
    const { credentials } = state.clientState
    const res = yield call(updateRal, credentials, payload)

    if (res && res.error) {
      yield put(updateClientRalError(res.error))
    } else {
      yield put(updateClientRalSuccess(res))
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      yield put(updateClientRalError(error.response.data.message))
    } else if (error.message) {
      yield put(updateClientRalError(error.message))
    } else {
      yield put(updateClientRalError(error))
    }
  }
}

function* watchUpdateClientRalRequest() {
  yield throttle(1000, ClientActionTypes.UPDATE_CLIENT_RAL_REQUEST, handleUpdateClientRalRequest)
}

export function* sagas() {
  yield all([
    fork(watchAuthRequest),
    fork(watchFetchClientRequest),
    fork(watchLoadCredentialsRequest),
    fork(watchSignoutRequest),
    fork(watchSubmitNewClientRequest),
    fork(watchUpdateAndLoadCredentialsRequest),
    fork(watchUpdateClientProfileRequest),
    fork(watchUpdateClientRalRequest),
    fork(watchVerifyPhoneRequest)
  ])
}
