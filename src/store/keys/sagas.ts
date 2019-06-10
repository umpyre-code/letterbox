import axios from 'axios'
import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { KeysActionTypes, KeyMap } from './types'
import { initializeKeysError, initializeKeysSuccess } from './actions'
import db from '../../db/db'
import Sodium from '../../utils/sodium'

async function initializeKeys() {
  const key_count = await db.keys.count()
  if (key_count === 0) {
    // This is a fresh new instance. Create the first key.
    const sodium = new Sodium()
    await sodium.init()
    const keyValue = sodium.handle.crypto_box_keypair()
    db.keys.add({
      public_key: sodium.handle.to_base64(
        keyValue.publicKey,
        sodium.handle.base64_variants.ORIGINAL_NO_PADDING
      ),
      private_key: sodium.handle.to_base64(
        keyValue.privateKey,
        sodium.handle.base64_variants.ORIGINAL_NO_PADDING
      ),
      created_at: new Date()
    })
  }

  // Fetch keys from DB now
  return db.keys.orderBy(':id').reverse().toArray().then(arr =>
    // Convert the result into a map, and set the special `current` key to point
    // to the most recent key by using the highest ID
    arr.reduce((map: KeyMap, key) => {
      map.set(key.public_key, key)
      return map
    }, new Map([['current', arr[0]]]))
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

// We can also use `fork()` here to split our saga into multiple watchers.
function* keysSaga() {
  yield all([fork(watchInitializeKeysRequest)])
}

export default keysSaga
