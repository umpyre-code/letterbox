import { FormikActions } from 'formik'
import { ClientCredentials, ClientProfile } from '../models/client'

export const enum ClientActionTypes {
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
  UPDATE_CLIENT_PROFILE_ERROR = '@@client/UPDATE_CLIENT_PROFILE_ERROR',
  UPDATE_CLIENT_PROFILE_REQUEST = '@@client/UPDATE_CLIENT_PROFILE_REQUEST',
  UPDATE_CLIENT_PROFILE_SUCCESS = '@@client/UPDATE_CLIENT_PROFILE_SUCCESS',
  VERIFY_PHONE_ERROR = '@@client/VERIFY_PHONE_ERROR',
  VERIFY_PHONE_REQUEST = '@@client/VERIFY_PHONE_REQUEST',
  VERIFY_PHONE_SUCCESS = '@@client/VERIFY_PHONE_SUCCESS'
}

export interface ClientState {
  readonly clientLoading: boolean
  readonly clientReady: boolean
  readonly credentials?: ClientCredentials
  readonly credentialsError?: string
  readonly credentialsLoading: boolean
  readonly credentialsReady: boolean
  readonly errors?: string
  readonly phoneVerificationError?: string
  readonly phoneVerifying: boolean
  readonly profile?: ClientProfile
  readonly signUpFormErrors?: string
  readonly reload: boolean
}

export interface NewClientMeta {
  actions: FormikActions<{}>
}

export interface UpdateClientProfileMeta {
  actions: FormikActions<{}>
  setIsEditing: (arg0: boolean) => void
}

export const emptyClientProfile: ClientProfile = {
  box_public_key: '',
  client_id: '',
  full_name: '',
  handle: undefined,
  profile: undefined,
  signing_public_key: ''
}

export const loadingClientProfile: ClientProfile = {
  box_public_key: '',
  client_id: '',
  full_name: 'Unknown Person',
  handle: undefined,
  profile: undefined,
  signing_public_key: ''
}

export class ClientProfileHelper implements ClientProfile {
  public static FROM(clientProfile: ClientProfile): ClientProfileHelper {
    return new ClientProfileHelper(clientProfile)
  }

  // tslint:disable variable-name
  public box_public_key: string = ''
  public client_id: string = ''
  public full_name: string = ''
  public handle?: string
  public profile?: string
  public signing_public_key: string = ''

  constructor(clientProfile: ClientProfile) {
    this.box_public_key = clientProfile.box_public_key
    this.client_id = clientProfile.client_id
    this.full_name = clientProfile.full_name
    this.signing_public_key = clientProfile.signing_public_key
  }

  public getInitials(): string {
    const splat = this.full_name
      .split(/[ ,]+/)
      .map(s => s.trim())
      .filter(s => s != null && s !== '')
    if (splat.length >= 2) {
      return splat[0][0] + splat[splat.length - 1][0]
    } else {
      return this.full_name[0]
    }
  }
}
