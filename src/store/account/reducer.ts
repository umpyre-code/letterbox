import { Reducer } from 'redux'
import { AccountActionTypes, AccountState } from './types'

export const initialState: AccountState = {
  balance: undefined,
  chargeErrorResponse: undefined,
  chargeResponse: undefined,
  charging: false,
  connectAccount: undefined,
  errors: undefined,
  updatingPrefs: false
}

export const reducer: Reducer<AccountState> = (state = initialState, action) => {
  switch (action.type) {
    case AccountActionTypes.FETCH_BALANCE_ERROR:
    case AccountActionTypes.FETCH_BALANCE_REQUEST: {
      return state
    }
    case AccountActionTypes.FETCH_BALANCE_SUCCESS: {
      return {
        ...state,
        balance: action.payload
      }
    }
    case AccountActionTypes.FETCH_CONNECT_ACCOUNT_ERROR:
    case AccountActionTypes.FETCH_CONNECT_ACCOUNT_REQUEST: {
      return state
    }
    case AccountActionTypes.FETCH_CONNECT_ACCOUNT_SUCCESS: {
      return {
        ...state,
        connectAccount: action.payload.connect_account
      }
    }
    case AccountActionTypes.POST_CONNECT_OAUTH_ERROR:
    case AccountActionTypes.POST_CONNECT_OAUTH_REQUEST: {
      return state
    }
    case AccountActionTypes.POST_CONNECT_OAUTH_SUCCESS: {
      return {
        ...state,
        connectAccount: action.payload.connect_account
      }
    }
    case AccountActionTypes.POST_CONNECT_PREFS_ERROR: {
      return { ...state, updatingPrefs: false }
    }
    case AccountActionTypes.POST_CONNECT_PREFS_REQUEST: {
      return { ...state, updatingPrefs: true }
    }
    case AccountActionTypes.POST_CONNECT_PREFS_SUCCESS: {
      return {
        ...state,
        connectAccount: action.payload,
        updatingPrefs: false
      }
    }
    case AccountActionTypes.CHARGE_REQUEST: {
      return { ...state, charging: true }
    }
    case AccountActionTypes.CHARGE_ERROR: {
      return state
    }
    case AccountActionTypes.CLEAR_CHARGE_ERRORS: {
      return { ...state, chargeErrorResponse: undefined }
    }
    case AccountActionTypes.CHARGE_SUCCESS: {
      return {
        ...state,
        balance: action.payload.balance,
        chargeResponse: action.payload,
        charging: false
      }
    }
    case AccountActionTypes.CHARGE_API_ERROR: {
      return {
        ...state,
        chargeErrorResponse: action.payload,
        charging: false
      }
    }
    default: {
      return state
    }
  }
}
