import { action } from 'typesafe-actions'
import { ClientCredentials, ClientProfile, NewClient } from '../models/client'
import {
  AuthCreds,
  AuthMeta,
  ClientActionTypes,
  NewClientMeta,
  UpdateClientProfileMeta
} from './types'

export const loadCredentialsRequest = (): any => action(ClientActionTypes.LOAD_CREDENTIALS_REQUEST)
export const loadCredentialsSuccess = (data: ClientProfile): any =>
  action(ClientActionTypes.LOAD_CREDENTIALS_SUCCESS, data)
export const loadCredentialsError = (message: string): any =>
  action(ClientActionTypes.LOAD_CREDENTIALS_ERROR, message)

export const fetchClientRequest = (): any => action(ClientActionTypes.FETCH_CLIENT_REQUEST)
export const fetchClientSuccess = (data: ClientProfile): any =>
  action(ClientActionTypes.FETCH_CLIENT_SUCCESS, data)
export const fetchClientError = (message: string): any =>
  action(ClientActionTypes.FETCH_CLIENT_ERROR, message)

export const submitNewClientRequest = (newClient: NewClient, meta: NewClientMeta): any =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST, newClient, meta)
export const submitNewClientSuccess = (data: ClientProfile): any =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS, data)
export const submitNewClientError = (message: string): any =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR, message)

export const updateClientProfileRequest = (
  clientProfile: ClientProfile,
  meta: UpdateClientProfileMeta
): any => action(ClientActionTypes.UPDATE_CLIENT_PROFILE_REQUEST, clientProfile, meta)
export const updateClientProfileSuccess = (data: ClientProfile): any =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_SUCCESS, data)
export const updateClientProfileError = (message: string): any =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_ERROR, message)

export const verifyPhoneRequest = (code: number): any =>
  action(ClientActionTypes.VERIFY_PHONE_REQUEST, code)
export const verifyPhoneSuccess = (data: ClientProfile): any =>
  action(ClientActionTypes.VERIFY_PHONE_SUCCESS, data)
export const verifyPhoneError = (message: string): any =>
  action(ClientActionTypes.VERIFY_PHONE_ERROR, message)

export const signoutRequest = (): any => action(ClientActionTypes.SIGNOUT_REQUEST)
export const signoutSuccess = (): any => action(ClientActionTypes.SIGNOUT_SUCCESS)

export const authRequest = (creds: AuthCreds, meta: AuthMeta): any =>
  action(ClientActionTypes.AUTH_REQUEST, creds, meta)
export const authSuccess = (clientCreds: ClientCredentials): any =>
  action(ClientActionTypes.AUTH_SUCCESS, clientCreds)
export const authError = (message: string): any => action(ClientActionTypes.AUTH_ERROR, message)
