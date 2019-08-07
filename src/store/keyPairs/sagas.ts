import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { db } from '../../db/db'
import { initializeKeysError, initializeKeysSuccess } from './actions'
import { KeyMap, KeyPair, KeysActionTypes } from './types'

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

async function initializeKeys() {
  const keyCount = await db.keyPairs.count()
  if (keyCount === 0) {
    // This is a fresh new instance. Create the first key.
    await sodium.ready
    const boxKeys = sodium.crypto_box_keypair()
    const signKeys = sodium.crypto_sign_keypair()
    await db.keyPairs.add({
      box_public_key: sodium.to_base64(
        boxKeys.publicKey,
        sodium.base64_variants.URLSAFE_NO_PADDING
      ),
      box_secret_key: sodium.to_base64(
        boxKeys.privateKey,
        sodium.base64_variants.URLSAFE_NO_PADDING
      ),
      created_at: new Date(),
      signing_public_key: sodium.to_base64(
        signKeys.publicKey,
        sodium.base64_variants.URLSAFE_NO_PADDING
      ),
      signing_secret_key: sodium.to_base64(
        signKeys.privateKey,
        sodium.base64_variants.URLSAFE_NO_PADDING
      )
    })
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
    const res = yield call(initializeKeys)

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
