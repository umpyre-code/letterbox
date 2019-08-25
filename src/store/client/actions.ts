import { action } from 'typesafe-actions'
import { ClientCredentials, ClientProfile, NewClient } from '../models/client'
import {
  AuthCreds,
  AuthMeta,
  ClientActionTypes,
  NewClientMeta,
  UpdateClientProfileMeta
} from './types'

export const loadCredentialsRequest = () => action(ClientActionTypes.LOAD_CREDENTIALS_REQUEST)
export const loadCredentialsSuccess = (data: ClientProfile) =>
  action(ClientActionTypes.LOAD_CREDENTIALS_SUCCESS, data)
export const loadCredentialsError = (message: string) =>
  action(ClientActionTypes.LOAD_CREDENTIALS_ERROR, message)

export const updateAndLoadCredentialsRequest = (credentials: ClientCredentials) =>
  action(ClientActionTypes.UPDATE_AND_LOAD_CREDENTIALS_REQUEST, credentials)
export const updateAndLoadCredentialsSuccess = (data: ClientProfile) =>
  action(ClientActionTypes.UPDATE_AND_LOAD_CREDENTIALS_SUCCESS, data)
export const updateAndLoadCredentialsError = (message: string) =>
  action(ClientActionTypes.UPDATE_AND_LOAD_CREDENTIALS_ERROR, message)

export const fetchClientRequest = () => action(ClientActionTypes.FETCH_CLIENT_REQUEST)
export const fetchClientSuccess = (data: ClientProfile) =>
  action(ClientActionTypes.FETCH_CLIENT_SUCCESS, data)
export const fetchClientError = (message: string) =>
  action(ClientActionTypes.FETCH_CLIENT_ERROR, message)

export const submitNewClientRequest = (newClient: NewClient, meta: NewClientMeta) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST, newClient, meta)
export const submitNewClientSuccess = (data: ClientProfile) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS, data)
export const submitNewClientError = (message: string) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR, message)

export const updateClientProfileRequest = (
  clientProfile: ClientProfile,
  meta: UpdateClientProfileMeta
) => action(ClientActionTypes.UPDATE_CLIENT_PROFILE_REQUEST, clientProfile, meta)
export const updateClientProfileSuccess = (data: ClientProfile) =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_SUCCESS, data)
export const updateClientProfileError = (message: string) =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_ERROR, message)

export const verifyPhoneRequest = (code: number) =>
  action(ClientActionTypes.VERIFY_PHONE_REQUEST, code)
export const verifyPhoneSuccess = (data: ClientProfile) =>
  action(ClientActionTypes.VERIFY_PHONE_SUCCESS, data)
export const verifyPhoneError = (message: string) =>
  action(ClientActionTypes.VERIFY_PHONE_ERROR, message)

export const signoutRequest = () => action(ClientActionTypes.SIGNOUT_REQUEST)
export const signoutSuccess = () => action(ClientActionTypes.SIGNOUT_SUCCESS)

export const authRequest = (creds: AuthCreds, meta: AuthMeta) =>
  action(ClientActionTypes.AUTH_REQUEST, creds, meta)
export const authSuccess = (clientCreds: ClientCredentials) =>
  action(ClientActionTypes.AUTH_SUCCESS, clientCreds)
export const authError = (message: string) => action(ClientActionTypes.AUTH_ERROR, message)

export const unathourizedClient = () => action(ClientActionTypes.UNAUTHORIZED_CLIENT)
