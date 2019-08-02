import { goBack } from 'connected-react-router'
import { all, call, fork, put, select, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from '..'
import { API } from '../api'
import { ChargeRequest, ChargeResponse } from '../models/account'
import { ClientCredentials } from '../models/client'
import {
  chargeError,
  chargeRequest,
  chargeSuccess,
  fetchBalanceError,
  fetchBalanceSuccess,
  chargeApiError
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
  yield takeEvery(AccountActionTypes.FETCH_BALANCE_REQUEST, handleFetchBalance)
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

export function* sagas() {
  yield all([fork(watchFetchBalanceRequest), fork(watchChargeRequest)])
}
