import { goBack } from 'connected-react-router'
import { all, call, fork, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { ApplicationState } from '..'
import { API } from '../api'
import { ChargeRequest, ConnectOauth, ConnectAccountPrefs } from '../models/account'
import { ClientCredentials } from '../models/client'
import {
  chargeApiError,
  chargeError,
  chargeRequest,
  chargeSuccess,
  fetchBalanceError,
  fetchBalanceSuccess,
  fetchConnectAccountError,
  fetchConnectAccountSuccess,
  postConnectOauthError,
  postConnectOauthSuccess,
  postConnectOauthRequest,
  postConnectPrefsRequest,
  postConnectPrefsError,
  postConnectPrefsSuccess
} from './actions'
import { AccountActionTypes } from './types'

async function fetchBalance(credentials: ClientCredentials) {
  const api = new API(credentials)
  return api.fetchBalance()
}

function* handleFetchBalance() {
  try {
    const state: ApplicationState = yield select()
    const credentials: ClientCredentials = state.clientState.credentials!
    const res = yield call(fetchBalance, credentials)

    if (res.error) {
      yield put(fetchBalanceError(res.error))
    } else {
      yield put(fetchBalanceSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(fetchBalanceError(err.stack!))
    } else {
      yield put(fetchBalanceError('An unknown error occured.'))
    }
  }
}

function* watchFetchBalanceRequest() {
  yield takeLatest(AccountActionTypes.FETCH_BALANCE_REQUEST, handleFetchBalance)
}

async function fetchConnectAccount(credentials: ClientCredentials) {
  const api = new API(credentials)
  return api.fetchConnectAccount()
}

function* handleFetchConnectAccount() {
  try {
    const state: ApplicationState = yield select()
    const credentials: ClientCredentials = state.clientState.credentials!
    const res = yield call(fetchConnectAccount, credentials)

    if (res.error) {
      yield put(fetchConnectAccountError(res.error))
    } else {
      yield put(fetchConnectAccountSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(fetchConnectAccountError(err.stack!))
    } else {
      yield put(fetchConnectAccountError('An unknown error occured.'))
    }
  }
}

function* watchFetchConnectAccountRequest() {
  yield takeLatest(AccountActionTypes.FETCH_CONNECT_ACCOUNT_REQUEST, handleFetchConnectAccount)
}

async function charge(credentials: ClientCredentials, request: ChargeRequest) {
  const api = new API(credentials)
  return api.charge(request)
}

function* handleCharge(values: ReturnType<typeof chargeRequest>) {
  try {
    const { payload } = values
    const state: ApplicationState = yield select()
    const credentials: ClientCredentials = state.clientState.credentials!
    const res = yield call(charge, credentials, payload)

    if (res.error) {
      yield put(chargeError(res.error))
    } else {
      if (res.result === 'success') {
        yield put(chargeSuccess(res))
        yield put(goBack())
      } else {
        yield put(chargeApiError(res))
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(chargeError(err.stack!))
    } else {
      yield put(chargeError('An unknown error occured.'))
    }
  }
}

function* watchChargeRequest() {
  yield takeEvery(AccountActionTypes.CHARGE_REQUEST, handleCharge)
}

async function postOauth(credentials: ClientCredentials, oauth: ConnectOauth) {
  const api = new API(credentials)
  return api.postOauth(oauth)
}

function* handlePostOauth(values: ReturnType<typeof postConnectOauthRequest>) {
  try {
    const { payload } = values
    const state: ApplicationState = yield select()
    const credentials: ClientCredentials = state.clientState.credentials!
    const res = yield call(postOauth, credentials, payload)

    if (res.error) {
      yield put(postConnectOauthError(res.error))
    } else {
      yield put(postConnectOauthSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(postConnectOauthError(err.stack!))
    } else {
      yield put(postConnectOauthError('An unknown error occured.'))
    }
  }
}

function* watchPostConnectOauthRequest() {
  yield takeEvery(AccountActionTypes.POST_CONNECT_OAUTH_REQUEST, handlePostOauth)
}

async function postPrefs(credentials: ClientCredentials, prefs: ConnectAccountPrefs) {
  const api = new API(credentials)
  return api.updateConnectPrefs(prefs)
}

function* handlePostPrefs(values: ReturnType<typeof postConnectPrefsRequest>) {
  try {
    const { payload } = values
    const state: ApplicationState = yield select()
    const credentials: ClientCredentials = state.clientState.credentials!
    const res = yield call(postPrefs, credentials, payload)

    if (res.error) {
      yield put(postConnectPrefsError(res.error))
    } else {
      yield put(postConnectPrefsSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(postConnectPrefsError(err.stack!))
    } else {
      yield put(postConnectPrefsError('An unknown error occured.'))
    }
  }
}

function* watchPostConnectPrefsRequest() {
  yield takeLatest(AccountActionTypes.POST_CONNECT_PREFS_REQUEST, handlePostPrefs)
}

export function* sagas() {
  yield all([
    fork(watchChargeRequest),
    fork(watchFetchBalanceRequest),
    fork(watchFetchConnectAccountRequest),
    fork(watchPostConnectOauthRequest),
    fork(watchPostConnectPrefsRequest)
  ])
}
