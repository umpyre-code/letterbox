import { Reducer } from 'redux'
import { KeysActionTypes, KeysState } from './types'

export const initialState: KeysState = {
  current_key: undefined,
  errors: undefined,
  keys: new Map(),
  loading: false,
  ready: false,
  seedWords: undefined
}

export const reducer: Reducer<KeysState> = (state = initialState, action) => {
  switch (action.type) {
    case KeysActionTypes.INITIALIZE_KEYS_REQUEST:
    case KeysActionTypes.RESET_KEYS_REQUEST:
    case KeysActionTypes.INITIALIZE_KEYS_FROM_SEED_REQUEST: {
      return { ...state, loading: true }
    }
    case KeysActionTypes.INITIALIZE_KEYS_FROM_SEED_SUCCESS:
    case KeysActionTypes.RESET_KEYS_SUCCESS:
    case KeysActionTypes.INITIALIZE_KEYS_SUCCESS: {
      return {
        ...state,
        current_key: action.payload[0],
        keys: action.payload[1],
        loading: false,
        ready: true
      }
    }
    case KeysActionTypes.INITIALIZE_KEYS_FROM_SEED_ERROR:
    case KeysActionTypes.RESET_KEYS_ERROR:
    case KeysActionTypes.INITIALIZE_KEYS_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case KeysActionTypes.LOAD_KEYS_REQUEST: {
      return { ...state, loading: true }
    }
    case KeysActionTypes.LOAD_KEYS_SUCCESS: {
      return {
        ...state,
        current_key: action.payload[0],
        keys: action.payload[1],
        loading: false,
        ready: true
      }
    }
    case KeysActionTypes.LOAD_KEYS_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case KeysActionTypes.GENERATE_SEED_SUCCESS: {
      return { ...state, seedWords: action.payload }
    }
    default: {
      return state
    }
  }
}
