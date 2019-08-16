import { action } from 'typesafe-actions'
import { ClientCredentials, ClientProfile, NewClient } from '../models/client'
import {
  AuthCreds,
  AuthMeta,
  ClientActionTypes,
  NewClientMeta,
  UpdateClientProfileMeta
} from './types'

export const loadCredentialsRequest = (): ReturnType<typeof action> =>
  action(ClientActionTypes.LOAD_CREDENTIALS_REQUEST)
export const loadCredentialsSuccess = (data: ClientProfile): ReturnType<typeof action> =>
  action(ClientActionTypes.LOAD_CREDENTIALS_SUCCESS, data)
export const loadCredentialsError = (message: string): ReturnType<typeof action> =>
  action(ClientActionTypes.LOAD_CREDENTIALS_ERROR, message)

export const fetchClientRequest = (): ReturnType<typeof action> =>
  action(ClientActionTypes.FETCH_CLIENT_REQUEST)
export const fetchClientSuccess = (data: ClientProfile): ReturnType<typeof action> =>
  action(ClientActionTypes.FETCH_CLIENT_SUCCESS, data)
export const fetchClientError = (message: string): ReturnType<typeof action> =>
  action(ClientActionTypes.FETCH_CLIENT_ERROR, message)

export const submitNewClientRequest = (
  newClient: NewClient,
  meta: NewClientMeta
): ReturnType<typeof action> => action(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST, newClient, meta)
export const submitNewClientSuccess = (data: ClientProfile): ReturnType<typeof action> =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS, data)
export const submitNewClientError = (message: string): ReturnType<typeof action> =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR, message)

export const updateClientProfileRequest = (
  clientProfile: ClientProfile,
  meta: UpdateClientProfileMeta
): ReturnType<typeof action> =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_REQUEST, clientProfile, meta)
export const updateClientProfileSuccess = (data: ClientProfile): ReturnType<typeof action> =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_SUCCESS, data)
export const updateClientProfileError = (message: string): ReturnType<typeof action> =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_ERROR, message)

export const verifyPhoneRequest = (code: number): ReturnType<typeof action> =>
  action(ClientActionTypes.VERIFY_PHONE_REQUEST, code)
export const verifyPhoneSuccess = (data: ClientProfile): ReturnType<typeof action> =>
  action(ClientActionTypes.VERIFY_PHONE_SUCCESS, data)
export const verifyPhoneError = (message: string): ReturnType<typeof action> =>
  action(ClientActionTypes.VERIFY_PHONE_ERROR, message)

export const signoutRequest = (): ReturnType<typeof action> =>
  action(ClientActionTypes.SIGNOUT_REQUEST)
export const signoutSuccess = (): ReturnType<typeof action> =>
  action(ClientActionTypes.SIGNOUT_SUCCESS)

export const authRequest = (creds: AuthCreds, meta: AuthMeta): ReturnType<typeof action> =>
  action(ClientActionTypes.AUTH_REQUEST, creds, meta)
export const authSuccess = (clientCreds: ClientCredentials): ReturnType<typeof action> =>
  action(ClientActionTypes.AUTH_SUCCESS, clientCreds)
export const authError = (message: string): ReturnType<typeof action> =>
  action(ClientActionTypes.AUTH_ERROR, message)
