import { FormikActions } from 'formik'
import { RouterState } from 'connected-react-router'

export interface Client {
  client_id: string
  token: string
}

interface PhoneNumber {
  country_code?: string
  national_number?: string
}

export interface NewClient {
  full_name: string
  email: string
  password_hash: string
  phone_number: PhoneNumber
  public_key?: string
}

export const enum ClientActionTypes {
  INITIALIZE_CLIENT_REQUEST = '@@client/INITIALIZE_CLIENT_REQUEST',
  INITIALIZE_CLIENT_SUCCESS = '@@client/INITIALIZE_CLIENT_SUCCESS',
  INITIALIZE_CLIENT_ERROR = '@@client/INITIALIZE_CLIENT_ERROR',
  SUBMIT_NEW_CLIENT_REQUEST = '@@client/SUBMIT_NEW_CLIENT_REQUEST',
  SUBMIT_NEW_CLIENT_SUCCESS = '@@client/SUBMIT_NEW_CLIENT_SUCCESS',
  SUBMIT_NEW_CLIENT_ERROR = '@@client/SUBMIT_NEW_CLIENT_ERROR'
}

export interface ClientState {
  readonly ready: boolean
  readonly loading: boolean
  readonly client?: Client
  readonly errors?: string
}

export interface NewClientMeta {
  actions: FormikActions<{}>
}
