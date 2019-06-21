import { Reducer } from 'redux'
import { KeysActionTypes, KeysState } from './types'

export const initialState: KeysState = {
  current_key: undefined,
  errors: undefined,
  keys: new Map(),
  loading: false,
  ready: false
}

export const reducer: Reducer<KeysState> = (state = initialState, action) => {
  switch (action.type) {
    case KeysActionTypes.INITIALIZE_KEYS_REQUEST: {
      return { ...state, loading: true }
    }
    case KeysActionTypes.INITIALIZE_KEYS_SUCCESS: {
      return {
        ...state,
        current_key: action.payload[0],
        keys: action.payload[1],
        loading: false,
        ready: true
      }
    }
    case KeysActionTypes.INITIALIZE_KEYS_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    default: {
      return state
    }
  }
}
