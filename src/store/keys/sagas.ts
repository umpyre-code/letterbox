import axios from 'axios'
import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { KeysActionTypes } from './types'
import { initializeKeysError, initializeKeysSuccess } from './actions'
import db from '../../db/db'

async function initializeKeys() {
  let res = db.transaction('rw', db.keys, async () => {
    await db.keys.toArray()
  })
  console.log(res)
  return res
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
