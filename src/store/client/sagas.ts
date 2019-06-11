import axios, { AxiosError } from 'axios'
import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { ClientActionTypes, NewClient } from './types'
import {
  fetchError,
  fetchSuccess,
  submitNewClientError,
  submitNewClientRequest,
  submitNewClientSuccess
} from './actions'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://api.staging.umpyre.io'

function getClient() {
  const res = axios.request({
    method: 'post',
    url: API_ENDPOINT + '/user'
  })
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

function submitNewClient(new_client: NewClient) {
  return axios.post(API_ENDPOINT + '/client', new_client)
}

function* handleSubmitNewClientRequest(action: ReturnType<typeof submitNewClientRequest>) {
  try {
    const res = yield call(submitNewClient, action.payload)

    if (res.error) {
      yield put(submitNewClientError(res.error))
    } else {
      yield put(submitNewClientSuccess(res))
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
  yield call(action.meta.setSubmitting, false)
}

function* watchGetClientRequest() {
  yield takeEvery(ClientActionTypes.GET_CLIENT_REQUEST, handleGetClient)
}

function* watchSubmitNewClientRequest() {
  yield takeEvery(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST, handleSubmitNewClientRequest)
}

// We can also use `fork()` here to split our saga into multiple watchers.
function* clientSaga() {
  yield all([fork(watchGetClientRequest), fork(watchSubmitNewClientRequest)])
}

export default clientSaga
