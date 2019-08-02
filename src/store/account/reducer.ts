import { Reducer } from 'redux'
import { AccountActionTypes, AccountState } from './types'

export const initialState: AccountState = {
  balance: undefined,
  charging: false,
  errors: undefined
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
        balance: action.payload.balance
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
