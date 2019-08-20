import { push } from 'connected-react-router'
import sodium from 'libsodium-wrappers'
import { all, call, fork, put, select, takeEvery, take, putResolve } from 'redux-saga/effects'
import { db } from '../../db/db'
import { ApplicationState } from '../ApplicationState'
import {
  updateClientProfileRequest,
  updateAndLoadCredentialsRequest,
  updateAndLoadCredentialsSuccess,
  updateClientProfileSuccess,
  fetchClientSuccess
} from '../client/actions'
import {
  generateSeedSuccess,
  initializeKeysError,
  initializeKeysFromSeedError,
  initializeKeysFromSeedRequest,
  initializeKeysFromSeedSuccess,
  initializeKeysSuccess,
  loadKeysError,
  loadKeysSuccess,
  resetKeysError,
  resetKeysSuccess
} from './actions'
import { KeyMap, KeyPair, KeysActionTypes } from './types'
import { wordLists } from './wordLists'
import { ClientActionTypes } from '../client/types'

async function deriveKeys(masterKey: Uint8Array, index: number) {
  await sodium.ready

  const boxKeySeed = sodium.crypto_kdf_derive_from_key(
    sodium.crypto_box_SEEDBYTES,
    index,
    'box',
    masterKey
  )
  const signingKeySeed = sodium.crypto_kdf_derive_from_key(
    sodium.crypto_sign_SEEDBYTES,
    index,
    'signing',
    masterKey
  )

  const boxKeys = sodium.crypto_box_seed_keypair(boxKeySeed)
  const signingKeys = sodium.crypto_sign_seed_keypair(signingKeySeed)

  return {
    box_public_key: sodium.to_base64(boxKeys.publicKey, sodium.base64_variants.URLSAFE_NO_PADDING),
    box_secret_key: sodium.to_base64(boxKeys.privateKey, sodium.base64_variants.URLSAFE_NO_PADDING),
    created_at: new Date(),
    index,
    masterKey,
    signing_public_key: sodium.to_base64(
      signingKeys.publicKey,
      sodium.base64_variants.URLSAFE_NO_PADDING
    ),
    signing_secret_key: sodium.to_base64(
      signingKeys.privateKey,
      sodium.base64_variants.URLSAFE_NO_PADDING
    )
  }
}

async function loadKeys() {
  return db.keyPairs
    .orderBy('created_at')
    .reverse()
    .toArray()
    .then((arr: KeyPair[]) =>
      // Convert the result into a map, and set the special `current` key to point
      // to the most recent key by using the highest ID. This is returned as a tuple.
      [
        arr[0],
        arr.reduce((map: KeyMap, key) => {
          map.set(key.box_public_key, key)
          return map
        }, new Map())
      ]
    )
}

function generateSeedWords() {
  // Initialize a seed, 165 bits in length, represented by 15 seed words. Each
  // word represents 11 bits (2048 possible words).
  const seeds = new Uint16Array(15)
  window.crypto.getRandomValues(seeds)
  return Array.from(seeds).map((seed: number) => wordLists.english[seed % 2048])
}

async function initializeKeys(seedWords: string[]) {
  await sodium.ready

  const masterKey = sodium.randombytes_buf_deterministic(
    sodium.crypto_kdf_KEYBYTES,
    sodium.crypto_generichash(sodium.crypto_kdf_KEYBYTES, seedWords.join())
  )

  await db.keyPairs.add(await deriveKeys(masterKey, 0))

  // Fetch keys from DB now
  return loadKeys()
}

export async function calculateCheckWord(seedWords: string[]) {
  await sodium.ready

  const check = sodium.crypto_generichash(2, seedWords.join())
  // Convert to UInt16
  const checkNumber = new Uint16Array(1)
  const index = 0
  checkNumber[index] = check[index]
  // eslint-disable-next-line no-bitwise
  checkNumber[index] |= check[index] << 8
  checkNumber[index] %= 2048
  return Promise.resolve(wordLists.english[checkNumber[index]])
}

export function* handleInitializeKeys() {
  try {
    // To call async functions, use redux-saga's `call()`.
    const seedWords = generateSeedWords()
    const res = yield call(initializeKeys, seedWords)
    const checkWord = yield call(calculateCheckWord, seedWords)
    seedWords.push(checkWord) // 16th word is check word

    if (res.error) {
      yield put(initializeKeysError(res.error))
    } else {
      yield put(generateSeedSuccess(seedWords))
      yield put(initializeKeysSuccess(res))
    }
  } catch (error) {
    if (error instanceof Error) {
      yield put(initializeKeysError(error.stack))
    } else {
      yield put(initializeKeysError('An unknown error occured.'))
    }
  }
}

function* watchInitializeKeysRequest() {
  yield takeEvery(KeysActionTypes.INITIALIZE_KEYS_REQUEST, handleInitializeKeys)
}

function* handleLoadKeys() {
  try {
    const res = yield call(loadKeys)

    if (res.error) {
      yield put(loadKeysError(res.error))
    } else {
      yield put(loadKeysSuccess(res))
    }
  } catch (error) {
    if (error instanceof Error) {
      yield put(loadKeysError(error.stack))
    } else {
      yield put(loadKeysError('An unknown error occured.'))
    }
  }
}

function* watchLoadKeysRequest() {
  yield takeEvery(KeysActionTypes.LOAD_KEYS_REQUEST, handleLoadKeys)
}

export function* handleInitializeKeysFromSeed(
  values: ReturnType<typeof initializeKeysFromSeedRequest>
) {
  const { payload } = values
  try {
    // To call async functions, use redux-saga's `call()`.
    const seedWords = payload as string[]
    const res = yield call(initializeKeys, seedWords.slice(0, 15))

    if (res.error) {
      yield put(initializeKeysFromSeedError(res.error))
    } else {
      const state: ApplicationState = yield select()
      const { authResult } = state.clientState

      yield putResolve(updateAndLoadCredentialsRequest(authResult))
      yield take(ClientActionTypes.FETCH_CLIENT_SUCCESS)

      yield put(initializeKeysFromSeedSuccess(res))
      yield put(push('/'))
    }
  } catch (error) {
    if (error instanceof Error) {
      yield put(initializeKeysFromSeedError(error.stack))
    } else {
      yield put(initializeKeysFromSeedError('An unknown error occured.'))
    }
  }
}

function* watchInitializeKeysFromSeedRequest() {
  yield takeEvery(KeysActionTypes.INITIALIZE_KEYS_FROM_SEED_REQUEST, handleInitializeKeysFromSeed)
}

export function* handleResetKeysRequest() {
  try {
    // To call async functions, use redux-saga's `call()`.
    const seedWords = generateSeedWords()
    const res = yield call(initializeKeys, seedWords)
    const checkWord = yield call(calculateCheckWord, seedWords)
    seedWords.push(checkWord) // 16th word is check word

    if (res.error) {
      yield put(resetKeysError(res.error))
    } else {
      const keyPair = res[0]
      const state: ApplicationState = yield select()
      const { authResult } = state.clientState

      yield putResolve(updateAndLoadCredentialsRequest(authResult))
      yield take(ClientActionTypes.FETCH_CLIENT_SUCCESS)

      const updatedState: ApplicationState = yield select()
      const { profile } = updatedState.clientState
      const updatedProfile = {
        ...profile,
        box_public_key: keyPair.box_public_key,
        signing_public_key: keyPair.signing_public_key
      }

      yield putResolve(
        updateClientProfileRequest(updatedProfile, {
          actions: undefined,
          setIsEditing: undefined,
          redirect: false
        })
      )
      yield put(generateSeedSuccess(seedWords))
      yield put(resetKeysSuccess(res))
      yield put(push('/flashseed'))
    }
  } catch (error) {
    if (error instanceof Error) {
      yield put(resetKeysError(error.stack))
    } else {
      yield put(resetKeysError('An unknown error occured.'))
    }
  }
}

function* watchResetKeysRequest() {
  yield takeEvery(KeysActionTypes.RESET_KEYS_REQUEST, handleResetKeysRequest)
}

export function* sagas() {
  yield all([
    fork(watchInitializeKeysFromSeedRequest),
    fork(watchInitializeKeysRequest),
    fork(watchLoadKeysRequest),
    fork(watchResetKeysRequest)
  ])
}
