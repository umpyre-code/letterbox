import { all, call, fork, put, select, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from '..'
import { API } from '../api'
import { ClientCredentials } from '../models/client'
import { fetchBalanceError, fetchBalanceSuccess } from './actions'
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
  yield takeEvery(AccountActionTypes.FETCH_BALANCE_REQUEST, handleFetchBalance)
}

export function* sagas() {
  yield all([fork(watchFetchBalanceRequest)])
}
