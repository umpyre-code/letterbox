export interface Client extends ApiResponse {
  id: string
  full_name: string
  email: string
}

// This type is basically shorthand for `{ [key: string]: any }`. Feel free to replace `any` with
// the expected return type of your API response.
export type ApiResponse = Record<string, any>

export const enum ClientActionTypes {
  GET_CLIENT_REQUEST = '@@client/GET_CLIENT_REQUEST',
  GET_CLIENT_SUCCESS = '@@client/GET_CLIENT_SUCCESS',
  GET_CLIENT_ERROR = '@@client/GET_CLIENT_ERROR'
}

export interface ClientState {
  readonly loading: boolean
  readonly data: Client
  readonly errors?: string
}
