import { action } from 'typesafe-actions'
import { ClientActionTypes, Client } from './types'

export const getClientRequest = () => action(ClientActionTypes.GET_CLIENT_REQUEST)
export const fetchSuccess = (data: Client) => action(ClientActionTypes.GET_CLIENT_SUCCESS, data)
export const fetchError = (message: string) => action(ClientActionTypes.GET_CLIENT_ERROR, message)

export const submitNewClientRequest = () => action(ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST)
export const submitNewClientSuccess = (data: Client) => action(ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS, data)
export const submitNewClientError = (message: string) => action(ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR, message)

