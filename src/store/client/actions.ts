import { action } from 'typesafe-actions'
import { ClientActionTypes, Client, NewClient, NewClientMeta } from './types'

export const initializeClientRequest = () => action(ClientActionTypes.INITIALIZE_CLIENT_REQUEST)
export const initializeClientSuccess = (data: Client) =>
  action(ClientActionTypes.INITIALIZE_CLIENT_SUCCESS, data)
export const initializeClientError = (message: string) =>
  action(ClientActionTypes.INITIALIZE_CLIENT_ERROR, message)

export const submitNewClientRequest = (new_client: NewClient, meta: NewClientMeta) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST, new_client, meta)
export const submitNewClientSuccess = (data: Client) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS, data)
export const submitNewClientError = (message: string) =>
  action(ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR, message)
