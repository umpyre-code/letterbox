import { Balance, ChargeErrorResponse, ChargeResponse, ConnectAccountInfo } from '../models/account'

export const enum AccountActionTypes {
  CHARGE_API_ERROR = '@@account/CHARGE_API_ERROR',
  CHARGE_ERROR = '@@account/CHARGE_ERROR',
  CHARGE_REQUEST = '@@account/CHARGE_REQUEST',
  CHARGE_SUCCESS = '@@account/CHARGE_SUCCESS',
  CLEAR_CHARGE_ERRORS = '@@account/CLEAR_CHARGE_ERRORS',
  FETCH_BALANCE_ERROR = '@@account/FETCH_BALANCE_ERROR',
  FETCH_BALANCE_REQUEST = '@@account/FETCH_BALANCE_REQUEST',
  FETCH_BALANCE_SUCCESS = '@@account/FETCH_BALANCE_SUCCESS',
  FETCH_CONNECT_ACCOUNT_ERROR = '@@account/FETCH_CONNECT_ACCOUNT_ERROR',
  FETCH_CONNECT_ACCOUNT_REQUEST = '@@account/FETCH_CONNECT_ACCOUNT_REQUEST',
  FETCH_CONNECT_ACCOUNT_SUCCESS = '@@account/FETCH_CONNECT_ACCOUNT_SUCCESS',
  POST_CONNECT_OAUTH_ERROR = '@@account/POST_CONNECT_OAUTH_ERROR',
  POST_CONNECT_OAUTH_REQUEST = '@@account/POST_CONNECT_OAUTH_REQUEST',
  POST_CONNECT_OAUTH_SUCCESS = '@@account/POST_CONNECT_OAUTH_SUCCESS',
  POST_CONNECT_PREFS_ERROR = '@@account/POST_CONNECT_PREFS_ERROR',
  POST_CONNECT_PREFS_REQUEST = '@@account/POST_CONNECT_PREFS_REQUEST',
  POST_CONNECT_PREFS_SUCCESS = '@@account/POST_CONNECT_PREFS_SUCCESS'
}

export interface AccountState {
  readonly balance?: Balance
  readonly chargeErrorResponse?: ChargeErrorResponse
  readonly chargeResponse?: ChargeResponse
  readonly charging: boolean
  readonly connectAccount?: ConnectAccountInfo
  readonly errors?: string
  readonly updatingPrefs: boolean
}
