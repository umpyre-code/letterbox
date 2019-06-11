import { Reducer } from 'redux'
import { KeysState, KeysActionTypes, Key } from './types'

export const initialState: KeysState = {
  keys: new Map(),
  errors: undefined,
  loading: false,
  ready: false,
  current_key: undefined
}

const reducer: Reducer<KeysState> = (state = initialState, action) => {
  switch (action.type) {
    case KeysActionTypes.INITIALIZE_KEYS_REQUEST: {
      return { ...state, loading: true }
    }
    case KeysActionTypes.INITIALIZE_KEYS_SUCCESS: {
      return {
        ...state,
        loading: false,
        ready: true,
        current_key: action.payload[0],
        keys: action.payload[1]
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

export { reducer as keysReducer }
