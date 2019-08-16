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

export const fetchBalanceRequest = (): any => action(AccountActionTypes.FETCH_BALANCE_REQUEST)
export const fetchBalanceSuccess = (balance: Balance): any =>
  action(AccountActionTypes.FETCH_BALANCE_SUCCESS, balance)
export const fetchBalanceError = (message: string): any =>
  action(AccountActionTypes.FETCH_BALANCE_ERROR, message)

export const chargeRequest = (charge: ChargeRequest): any =>
  action(AccountActionTypes.CHARGE_REQUEST, charge)
export const chargeSuccess = (charge: ChargeResponse): any =>
  action(AccountActionTypes.CHARGE_SUCCESS, charge)
export const chargeApiError = (charge: ChargeErrorResponse): any =>
  action(AccountActionTypes.CHARGE_API_ERROR, charge)
export const clearChargeErrors = (): any => action(AccountActionTypes.CLEAR_CHARGE_ERRORS)
export const chargeError = (message: string): any =>
  action(AccountActionTypes.CHARGE_ERROR, message)

export const fetchConnectAccountRequest = (): any =>
  action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_REQUEST)
export const fetchConnectAccountSuccess = (account: FetchConnectAccountInfoResponse): any =>
  action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_SUCCESS, account)
export const fetchConnectAccountError = (message: string): any =>
  action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_ERROR, message)

export const postConnectOauthRequest = (oauth: ConnectOauth): any =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_REQUEST, oauth)
export const postConnectOauthSuccess = (account: PostConnectOauthResponse): any =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_SUCCESS, account)
export const postConnectOauthError = (message: string): any =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_ERROR, message)

export const postConnectPrefsRequest = (oauth: ConnectAccountPrefs): any =>
  action(AccountActionTypes.POST_CONNECT_PREFS_REQUEST, oauth)
export const postConnectPrefsSuccess = (account: ConnectAccountInfo): any =>
  action(AccountActionTypes.POST_CONNECT_PREFS_SUCCESS, account)
export const postConnectPrefsError = (message: string): any =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_ERROR, message)
