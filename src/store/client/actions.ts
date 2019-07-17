import { action } from 'typesafe-actions'
import { ClientProfile, NewClient } from '../models/client'
import { ClientActionTypes, NewClientMeta, UpdateClientProfileMeta } from './types'

export const initializeClientRequest = () => action(ClientActionTypes.INITIALIZE_CLIENT_REQUEST)
export const initializeClientSuccess = (data: Client) =>
  action(ClientActionTypes.INITIALIZE_CLIENT_SUCCESS, data)
export const initializeClientError = (message: string) =>
  action(ClientActionTypes.INITIALIZE_CLIENT_ERROR, message)

export const fetchClientRequest = () => action(ClientActionTypes.FETCH_CLIENT_REQUEST)
export const fetchClientSuccess = (data: Client) =>
  action(ClientActionTypes.FETCH_CLIENT_SUCCESS, data)
export const fetchClientError = (message: string) =>
  action(ClientActionTypes.FETCH_CLIENT_ERROR, message)

export const submitNewClientRequest = (newClient: NewClient, meta: NewClientMeta) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST, newClient, meta)
export const submitNewClientSuccess = (data: Client) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS, data)
export const submitNewClientError = (message: string) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR, message)

export const updateClientProfileRequest = (
  clientProfile: ClientProfile,
  meta: UpdateClientProfileMeta
) => action(ClientActionTypes.UPDATE_CLIENT_PROFILE_REQUEST, clientProfile, meta)
export const updateClientProfileSuccess = (data: Client) =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_SUCCESS, data)
export const updateClientProfileError = (message: string) =>
  action(ClientActionTypes.UPDATE_CLIENT_PROFILE_ERROR, message)
