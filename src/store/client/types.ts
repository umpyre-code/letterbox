import { FormikActions } from 'formik'
import _ from 'lodash'
import {
  AuthVerifyResponse,
  ClientCredentials,
  ClientProfile,
  MicroClientProfile
} from '../models/client'

export enum ClientActionTypes {
  AUTH_ERROR = '@@client/AUTH_ERROR',
  AUTH_REQUEST = '@@client/AUTH_REQUEST',
  AUTH_SUCCESS = '@@client/AUTH_SUCCESS',
  FETCH_CLIENT_ERROR = '@@client/FETCH_CLIENT_ERROR',
  FETCH_CLIENT_REQUEST = '@@client/FETCH_CLIENT_REQUEST',
  FETCH_CLIENT_SUCCESS = '@@client/FETCH_CLIENT_SUCCESS',
  LOAD_CREDENTIALS_ERROR = '@@client/LOAD_CREDENTIALS_ERROR',
  LOAD_CREDENTIALS_REQUEST = '@@client/LOAD_CREDENTIALS_REQUEST',
  LOAD_CREDENTIALS_SUCCESS = '@@client/LOAD_CREDENTIALS_SUCCESS',
  SIGNOUT_REQUEST = '@@client/SIGNOUT_REQUEST',
  SIGNOUT_SUCCESS = '@@client/SIGNOUT_SUCCESS',
  SUBMIT_NEW_CLIENT_ERROR = '@@client/SUBMIT_NEW_CLIENT_ERROR',
  SUBMIT_NEW_CLIENT_REQUEST = '@@client/SUBMIT_NEW_CLIENT_REQUEST',
  SUBMIT_NEW_CLIENT_SUCCESS = '@@client/SUBMIT_NEW_CLIENT_SUCCESS',
  UNAUTHORIZED_CLIENT = '@@client/UNAUTHORIZED_CLIENT',
  UPDATE_AND_LOAD_CREDENTIALS_ERROR = '@@client/UPDATE_AND_LOAD_CREDENTIALS_ERROR',
  UPDATE_AND_LOAD_CREDENTIALS_REQUEST = '@@client/UPDATE_AND_LOAD_CREDENTIALS_REQUEST',
  UPDATE_AND_LOAD_CREDENTIALS_SUCCESS = '@@client/UPDATE_AND_LOAD_CREDENTIALS_SUCCESS',
  UPDATE_CLIENT_PROFILE_ERROR = '@@client/UPDATE_CLIENT_PROFILE_ERROR',
  UPDATE_CLIENT_PROFILE_REQUEST = '@@client/UPDATE_CLIENT_PROFILE_REQUEST',
  UPDATE_CLIENT_PROFILE_SUCCESS = '@@client/UPDATE_CLIENT_PROFILE_SUCCESS',
  VERIFY_PHONE_ERROR = '@@client/VERIFY_PHONE_ERROR',
  VERIFY_PHONE_REQUEST = '@@client/VERIFY_PHONE_REQUEST',
  VERIFY_PHONE_SUCCESS = '@@client/VERIFY_PHONE_SUCCESS',
  INCREMENT_AVATAR_VERSION_REQUEST = '@@client/INCREMENT_AVATAR_VERSION_REQUEST'
}

export interface ClientState {
  readonly authError?: string
  readonly authResult?: AuthVerifyResponse
  readonly authSubmitting: boolean
  readonly clientLoading: boolean
  readonly clientReady: boolean
  readonly credentials?: ClientCredentials
  readonly credentialsError?: string
  readonly credentialsLoading: boolean
  readonly credentialsReady: boolean
  readonly errors?: string
  readonly newClientSubmitting: boolean
  readonly phoneVerificationError?: string
  readonly phoneVerifying: boolean
  readonly profile?: ClientProfile
  readonly reload: boolean
  readonly signUpFormErrors?: string
}

export interface AuthCreds {
  email: string
  password: string
}

export interface AuthMeta {
  actions: FormikActions<{}>
}

export interface NewClientMeta {
  actions: FormikActions<{}>
}

export interface UpdateClientProfileMeta {
  actions?: FormikActions<{}>
  setIsEditing?: (arg0: boolean) => void
  redirect: boolean
}

export const emptyClientProfile: ClientProfile = {
  box_public_key: '',
  client_id: '',
  full_name: '',
  handle: undefined,
  joined: 0,
  phone_sms_verified: false,
  profile: undefined,
  ral: 0,
  signing_public_key: '',
  avatar_version: 0
}

export const loadingClientProfile: ClientProfile = {
  box_public_key: '',
  client_id: '',
  full_name: 'Unknown Person',
  handle: undefined,
  joined: 0,
  phone_sms_verified: false,
  profile: undefined,
  ral: 0,
  signing_public_key: '',
  avatar_version: 0
}

export class ClientProfileHelper implements MicroClientProfile {
  public static FROM(clientProfile: MicroClientProfile): ClientProfileHelper {
    return new ClientProfileHelper(clientProfile)
  }

  public client_id = ''

  public full_name = ''

  public handle?: string

  constructor(clientProfile: MicroClientProfile) {
    Object.assign(this, clientProfile)
  }

  public getInitials(): string {
    const splat = this.full_name
      .split(/[ ,.]+/)
      .map(s => s.trim())
      .filter(s => s != null && s !== '' && s.match(/[a-zA-Z]+/))
      .map(s => _.deburr(s))
    if (splat.length >= 2) {
      return splat[0][0] + splat[splat.length - 1][0]
    }
    return this.full_name[0]
  }
}
