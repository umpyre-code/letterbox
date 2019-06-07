import axios from 'axios'
import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { ClientActionTypes } from './types'
import { fetchError, fetchSuccess } from './actions'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://api.staging.umpyre.io'

function getClient() {
  const res = axios.request({
    method: 'post',
    url: API_ENDPOINT + '/user'
  })
  console.log(res)
  return res
}

function* handleGetClient() {
  try {
    // To call async functions, use redux-saga's `call()`.
    const res = yield call(getClient)

    if (res.error) {
      yield put(fetchError(res.error))
    } else {
      yield put(fetchSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(fetchError(err.stack!))
    } else {
      yield put(fetchError('An unknown error occured.'))
    }
  }
}

function* watchGetClientRequest() {
  yield takeEvery(ClientActionTypes.GET_CLIENT_REQUEST, handleGetClient)
}

// We can also use `fork()` here to split our saga into multiple watchers.
function* clientSaga() {
  yield all([fork(watchGetClientRequest)])
}

export default clientSaga
