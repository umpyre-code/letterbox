import { action } from 'typesafe-actions'
import {
  Balance,
  ChargeErrorResponse,
  ChargeRequest,
  ChargeResponse,
  ConnectAccountInfo,
  ConnectAccountPrefs,
  ConnectOauth,
  FetchConnectAccountInfoResponse,
  PostConnectOauthResponse
} from '../models/account'
import { AccountActionTypes } from './types'

export const fetchBalanceRequest = (): ReturnType<typeof action> =>
  action(AccountActionTypes.FETCH_BALANCE_REQUEST)
export const fetchBalanceSuccess = (balance: Balance): ReturnType<typeof action> =>
  action(AccountActionTypes.FETCH_BALANCE_SUCCESS, balance)
export const fetchBalanceError = (message: string): ReturnType<typeof action> =>
  action(AccountActionTypes.FETCH_BALANCE_ERROR, message)

export const chargeRequest = (charge: ChargeRequest): ReturnType<typeof action> =>
  action(AccountActionTypes.CHARGE_REQUEST, charge)
export const chargeSuccess = (charge: ChargeResponse): ReturnType<typeof action> =>
  action(AccountActionTypes.CHARGE_SUCCESS, charge)
export const chargeApiError = (charge: ChargeErrorResponse): ReturnType<typeof action> =>
  action(AccountActionTypes.CHARGE_API_ERROR, charge)
export const clearChargeErrors = (): ReturnType<typeof action> =>
  action(AccountActionTypes.CLEAR_CHARGE_ERRORS)
export const chargeError = (message: string): ReturnType<typeof action> =>
  action(AccountActionTypes.CHARGE_ERROR, message)

export const fetchConnectAccountRequest = (): ReturnType<typeof action> =>
  action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_REQUEST)
export const fetchConnectAccountSuccess = (
  account: FetchConnectAccountInfoResponse
): ReturnType<typeof action> => action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_SUCCESS, account)
export const fetchConnectAccountError = (message: string): ReturnType<typeof action> =>
  action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_ERROR, message)

export const postConnectOauthRequest = (oauth: ConnectOauth): ReturnType<typeof action> =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_REQUEST, oauth)
export const postConnectOauthSuccess = (
  account: PostConnectOauthResponse
): ReturnType<typeof action> => action(AccountActionTypes.POST_CONNECT_OAUTH_SUCCESS, account)
export const postConnectOauthError = (message: string): ReturnType<typeof action> =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_ERROR, message)

export const postConnectPrefsRequest = (oauth: ConnectAccountPrefs): ReturnType<typeof action> =>
  action(AccountActionTypes.POST_CONNECT_PREFS_REQUEST, oauth)
export const postConnectPrefsSuccess = (account: ConnectAccountInfo): ReturnType<typeof action> =>
  action(AccountActionTypes.POST_CONNECT_PREFS_SUCCESS, account)
export const postConnectPrefsError = (message: string): ReturnType<typeof action> =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_ERROR, message)
