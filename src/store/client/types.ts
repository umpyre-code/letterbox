import { FormikActions } from 'formik'
import { ClientCredentials, ClientProfile } from '../models/client'

export const enum ClientActionTypes {
  INITIALIZE_CLIENT_REQUEST = '@@client/INITIALIZE_CLIENT_REQUEST',
  INITIALIZE_CLIENT_SUCCESS = '@@client/INITIALIZE_CLIENT_SUCCESS',
  INITIALIZE_CLIENT_ERROR = '@@client/INITIALIZE_CLIENT_ERROR',
  FETCH_CLIENT_REQUEST = '@@client/FETCH_CLIENT_REQUEST',
  FETCH_CLIENT_SUCCESS = '@@client/FETCH_CLIENT_SUCCESS',
  FETCH_CLIENT_ERROR = '@@client/FETCH_CLIENT_ERROR',
  SUBMIT_NEW_CLIENT_REQUEST = '@@client/SUBMIT_NEW_CLIENT_REQUEST',
  SUBMIT_NEW_CLIENT_SUCCESS = '@@client/SUBMIT_NEW_CLIENT_SUCCESS',
  SUBMIT_NEW_CLIENT_ERROR = '@@client/SUBMIT_NEW_CLIENT_ERROR'
}

export interface ClientState {
  readonly credentials?: ClientCredentials
  readonly profile?: ClientProfile
  readonly errors?: string
  readonly loading: boolean
  readonly ready: boolean
}

export interface NewClientMeta {
  actions: FormikActions<{}>
}

export class ClientProfileHelper implements ClientProfile {
  public static FROM(clientProfile: ClientProfile): ClientProfileHelper {
    return new ClientProfileHelper(clientProfile)
  }

  // tslint:disable variable-name
  public client_id: string = ''
  public full_name: string = ''
  public public_key: string = ''

  constructor(clientProfile: ClientProfile) {
    this.client_id = clientProfile.client_id
    this.full_name = clientProfile.full_name
    this.public_key = clientProfile.public_key
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
