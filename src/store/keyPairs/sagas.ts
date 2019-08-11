import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { db } from '../../db/db'
import { initializeKeysError, initializeKeysSuccess } from './actions'
import { KeyMap, KeyPair, KeysActionTypes } from './types'
import { wordLists } from './wordLists'

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

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

function generateSeedWords() {
  // Initialize a seed, 132 bits in length, represented by 12 seed words. Each
  // word represents 11 bits (2048 possible words).
  const seeds = new Uint16Array(12)
  window.crypto.getRandomValues(seeds)
  return Array.from(seeds).map((seed: number) => wordLists.english[seed % 2048])
}

async function initializeKeys(seedWords: string[]) {
  const keyCount = await db.keyPairs.count()
  if (keyCount === 0) {
    // This is a fresh new instance. Create the first key.
    await sodium.ready

    const masterKey = sodium.randombytes_buf_deterministic(
      sodium.crypto_kdf_KEYBYTES,
      sodium.crypto_generichash(sodium.crypto_kdf_KEYBYTES, seedWords.join())
    )

    await db.keyPairs.add(await deriveKeys(masterKey, 0))
  }

  // Fetch keys from DB now
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

function* handleInitializeKeys() {
  try {
    // To call async functions, use redux-saga's `call()`.
    const seedWords = generateSeedWords()
    const res = yield call(initializeKeys, seedWords)

    if (res.error) {
      yield put(initializeKeysError(res.error))
    } else {
      yield put(initializeKeysSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(initializeKeysError(err.stack!))
    } else {
      yield put(initializeKeysError('An unknown error occured.'))
    }
  }
}

function* watchInitializeKeysRequest() {
  yield takeEvery(KeysActionTypes.INITIALIZE_KEYS_REQUEST, handleInitializeKeys)
}

export function* sagas() {
  yield all([fork(watchInitializeKeysRequest)])
}
