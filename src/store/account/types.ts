import { Balance } from '../models/client'

export const enum AccountActionTypes {
  FETCH_BALANCE_REQUEST = '@@account/FETCH_BALANCE_REQUEST',
  FETCH_BALANCE_SUCCESS = '@@account/FETCH_BALANCE_SUCCESS',
  FETCH_BALANCE_ERROR = '@@account/FETCH_BALANCE_ERROR'
}

export interface AccountState {
  readonly ready: boolean
  readonly loading: boolean
  readonly balance?: Balance
  readonly errors?: string
}
