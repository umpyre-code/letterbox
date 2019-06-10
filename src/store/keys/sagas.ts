import axios from 'axios'
import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { KeysActionTypes } from './types'
import { initializeKeysError, initializeKeysSuccess } from './actions'
import db from '../../db/db'
import Sodium from '../../utils/sodium'

async function initializeKeys() {
  const arr = await db.keys.toArray()
  if (arr.length === 0) {
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
  return db.keys.toArray()
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
