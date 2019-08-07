import { Reducer } from 'redux'
import { ClientActionTypes, ClientState } from './types'

export const initialState: ClientState = {
  credentials: undefined,
  errors: undefined,
  loading: false,
  profile: undefined,
  ready: false
}

export const reducer: Reducer<ClientState> = (state = initialState, action) => {
  switch (action.type) {
    case ClientActionTypes.INITIALIZE_CLIENT_REQUEST:
    case ClientActionTypes.FETCH_CLIENT_REQUEST: {
      return { ...state, loading: true, errors: undefined }
    }
    case ClientActionTypes.INITIALIZE_CLIENT_SUCCESS: {
      return {
        ...state,
        credentials: action.payload,
        loading: false,
        ready: true
      }
    }
    case ClientActionTypes.FETCH_CLIENT_SUCCESS: {
      return {
        ...state,
        loading: false,
        profile: action.payload,
        ready: true
      }
    }
    case ClientActionTypes.INITIALIZE_CLIENT_ERROR:
    case ClientActionTypes.FETCH_CLIENT_ERROR: {
      return { ...state, loading: false, errors: action.payload, ready: true }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST: {
      return { ...state, loading: true, signUpFormErrors: undefined }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS: {
      return { ...state, loading: false, credentials: action.payload }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR: {
      return { ...state, loading: false, signUpFormErrors: action.payload }
    }
    case ClientActionTypes.UPDATE_CLIENT_PROFILE_REQUEST: {
      return { ...state, updateClientProfileFormErrors: undefined }
    }
    case ClientActionTypes.UPDATE_CLIENT_PROFILE_SUCCESS: {
      return { ...state, profile: action.payload }
    }
    case ClientActionTypes.UPDATE_CLIENT_PROFILE_ERROR: {
      return { ...state, updateClientProfileFormErrors: action.payload }
    }
    default: {
      return state
    }
  }
}
