import { Reducer } from 'redux'
import { ClientActionTypes, ClientState } from './types'

export const initialState: ClientState = {
  authError: undefined,
  authResult: undefined,
  authSubmitting: false,
  clientLoading: false,
  clientReady: false,
  credentials: undefined,
  credentialsError: undefined,
  credentialsLoading: false,
  credentialsReady: false,
  errors: undefined,
  newClientSubmitting: false,
  phoneVerificationError: undefined,
  phoneVerifying: false,
  profile: undefined,
  reload: false
}

export const reducer: Reducer<ClientState> = (state = initialState, action) => {
  switch (action.type) {
    case ClientActionTypes.AUTH_REQUEST: {
      return { ...state, authSubmitting: true, authError: undefined }
    }
    case ClientActionTypes.AUTH_SUCCESS: {
      return { ...state, authSubmitting: false, authError: undefined, authResult: action.payload }
    }
    case ClientActionTypes.AUTH_ERROR: {
      return { ...state, authSubmitting: false, authError: action.payload }
    }
    case ClientActionTypes.UPDATE_AND_LOAD_CREDENTIALS_REQUEST:
    case ClientActionTypes.LOAD_CREDENTIALS_REQUEST: {
      return { ...state, credentialsLoading: true, credentialsError: undefined }
    }
    case ClientActionTypes.FETCH_CLIENT_REQUEST: {
      return { ...state, clientLoading: true, errors: undefined }
    }
    case ClientActionTypes.UPDATE_AND_LOAD_CREDENTIALS_SUCCESS:
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
    case ClientActionTypes.UPDATE_AND_LOAD_CREDENTIALS_ERROR:
    case ClientActionTypes.LOAD_CREDENTIALS_ERROR: {
      return {
        ...state,
        credentialsError: action.payload,
        credentialsLoading: false,
        credentialsReady: true,
        clientReady: true
      }
    }
    case ClientActionTypes.FETCH_CLIENT_ERROR: {
      return { ...state, clientLoading: false, errors: action.payload, clientReady: true }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST: {
      return {
        ...state,
        clientLoading: true,
        newClientSubmitting: true,
        signUpFormErrors: undefined
      }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS: {
      return {
        ...state,
        clientLoading: false,
        credentials: action.payload,
        newClientSubmitting: false
      }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR: {
      return { ...state, clientLoading: false, signUpFormErrors: action.payload }
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
    case ClientActionTypes.VERIFY_PHONE_REQUEST: {
      return { ...state, phoneVerificationError: undefined, phoneVerifying: true }
    }
    case ClientActionTypes.VERIFY_PHONE_SUCCESS: {
      return {
        ...state,
        phoneVerificationError: undefined,
        phoneVerifying: false,
        profile: action.payload
      }
    }
    case ClientActionTypes.VERIFY_PHONE_ERROR: {
      return { ...state, phoneVerificationError: action.payload, phoneVerifying: false }
    }
    case ClientActionTypes.SIGNOUT_REQUEST: {
      return state
    }
    case ClientActionTypes.SIGNOUT_SUCCESS: {
      return {
        ...state,
        reload: true
      }
    }
    default: {
      return state
    }
  }
}
