import { Reducer } from 'redux'
import { AccountActionTypes, AccountState } from './types'

export const initialState: AccountState = {
  balance: undefined,
  errors: undefined,
  loading: false,
  ready: false
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
    default: {
      return state
    }
  }
}
