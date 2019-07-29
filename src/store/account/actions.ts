import { action } from 'typesafe-actions'
import { Balance } from '../models/client'
import { AccountActionTypes } from './types'

export const fetchBalanceRequest = () => action(AccountActionTypes.FETCH_BALANCE_REQUEST)
export const fetchBalanceSuccess = (balance: Balance) =>
  action(AccountActionTypes.FETCH_BALANCE_SUCCESS, balance)
export const fetchBalanceError = (message: string) =>
  action(AccountActionTypes.FETCH_BALANCE_ERROR, message)
