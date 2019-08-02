import { Balance, ChargeErrorResponse, ChargeResponse } from '../models/account'

export const enum AccountActionTypes {
  CHARGE_API_ERROR = '@@account/CHARGE_API_ERROR',
  CHARGE_ERROR = '@@account/CHARGE_ERROR',
  CHARGE_REQUEST = '@@account/CHARGE_REQUEST',
  CHARGE_SUCCESS = '@@account/CHARGE_SUCCESS',
  CLEAR_CHARGE_ERRORS = '@@account/CLEAR_CHARGE_ERRORS',
  FETCH_BALANCE_ERROR = '@@account/FETCH_BALANCE_ERROR',
  FETCH_BALANCE_REQUEST = '@@account/FETCH_BALANCE_REQUEST',
  FETCH_BALANCE_SUCCESS = '@@account/FETCH_BALANCE_SUCCESS'
}

export interface AccountState {
  readonly charging: boolean
  readonly balance?: Balance
  readonly errors?: string
  readonly chargeResponse?: ChargeResponse
  readonly chargeErrorResponse?: ChargeErrorResponse
}
