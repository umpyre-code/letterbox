// This file holds our state type, as well as any other types related to this Redux store.

// Response object for GET /heroes
// https://docs.opendota.com/#tag/heroes%2Fpaths%2F~1heroes%2Fget
export interface Client extends ApiResponse {
  id: number
  name: string
  localized_name: string
  primary_attr: string
  attack_type: string
  roles: string[]
  img: string
  icon: string
  legs: number
}

// This type is basically shorthand for `{ [key: string]: any }`. Feel free to replace `any` with
// the expected return type of your API response.
export type ApiResponse = Record<string, any>

// Use `const enum`s for better autocompletion of action type names. These will
// be compiled away leaving only the final value in your compiled code.
//
// Define however naming conventions you'd like for your action types, but
// personally, I use the `@@context/ACTION_TYPE` convention, to follow the convention
// of Redux's `@@INIT` action.
export const enum ClientActionTypes {
  FETCH_REQUEST = '@@client/FETCH_REQUEST',
  FETCH_SUCCESS = '@@client/FETCH_SUCCESS',
  FETCH_ERROR = '@@client/FETCH_ERROR',
  SELECT_HERO = '@@client/SELECT_HERO',
  SELECTED = '@@client/SELECTED'
}

// Declare state types with `readonly` modifier to get compile time immutability.
// https://github.com/piotrwitek/react-redux-typescript-guide#state-with-type-level-immutability
export interface ClientState {
  readonly loading: boolean
  readonly data: Client[]
  readonly errors?: string
}
