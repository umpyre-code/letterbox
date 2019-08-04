import { action } from 'typesafe-actions'
import {
  Balance,
  ChargeErrorResponse,
  ChargeRequest,
  ChargeResponse,
  ConnectOauth,
  FetchConnectAccountInfoResponse,
  PostConnectOauthResponse
} from '../models/account'
import { AccountActionTypes } from './types'

export const fetchBalanceRequest = () => action(AccountActionTypes.FETCH_BALANCE_REQUEST)
export const fetchBalanceSuccess = (balance: Balance) =>
  action(AccountActionTypes.FETCH_BALANCE_SUCCESS, balance)
export const fetchBalanceError = (message: string) =>
  action(AccountActionTypes.FETCH_BALANCE_ERROR, message)

export const chargeRequest = (charge: ChargeRequest) =>
  action(AccountActionTypes.CHARGE_REQUEST, charge)
export const chargeSuccess = (charge: ChargeResponse) =>
  action(AccountActionTypes.CHARGE_SUCCESS, charge)
export const chargeApiError = (charge: ChargeErrorResponse) =>
  action(AccountActionTypes.CHARGE_API_ERROR, charge)
export const clearChargeErrors = () => action(AccountActionTypes.CLEAR_CHARGE_ERRORS)
export const chargeError = (message: string) => action(AccountActionTypes.CHARGE_ERROR, message)

export const fetchConnectAccountRequest = () =>
  action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_REQUEST)
export const fetchConnectAccountSuccess = (account: FetchConnectAccountInfoResponse) =>
  action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_SUCCESS, account)
export const fetchConnectAccountError = (message: string) =>
  action(AccountActionTypes.FETCH_CONNECT_ACCOUNT_ERROR, message)

export const postConnectOauthRequest = (oauth: ConnectOauth) =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_REQUEST, oauth)
export const postConnectOauthSuccess = (account: PostConnectOauthResponse) =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_SUCCESS, account)
export const postConnectOauthError = (message: string) =>
  action(AccountActionTypes.POST_CONNECT_OAUTH_ERROR, message)
