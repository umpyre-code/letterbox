import { Reducer } from 'redux'
import { ClientActionTypes, ClientState } from './types'

export const initialState: ClientState = {
  clientLoading: false,
  clientReady: false,
  credentials: undefined,
  credentialsLoading: false,
  credentialsReady: false,
  errors: undefined,
  profile: undefined
}

export const reducer: Reducer<ClientState> = (state = initialState, action) => {
  switch (action.type) {
    case ClientActionTypes.LOAD_CREDENTIALS_REQUEST: {
      return { ...state, credentialsLoading: true, errors: undefined }
    }
    case ClientActionTypes.FETCH_CLIENT_REQUEST: {
      return { ...state, clientLoading: true, errors: undefined }
    }
    case ClientActionTypes.LOAD_CREDENTIALS_SUCCESS: {
      return {
        ...state,
        credentials: action.payload,
        credentialsLoading: false,
        credentialsReady: true
      }
    }
    case ClientActionTypes.FETCH_CLIENT_SUCCESS: {
      return {
        ...state,
        clientLoading: false,
        clientReady: true,
        profile: action.payload
      }
    }
    case ClientActionTypes.LOAD_CREDENTIALS_ERROR:
    case ClientActionTypes.FETCH_CLIENT_ERROR: {
      return { ...state, loading: false, errors: action.payload, clientReady: true }
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
