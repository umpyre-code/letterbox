export interface KeyPair {
  box_public_key: string
  box_secret_key: string
  created_at: Date
  id?: number
  index: number
  masterKey: Uint8Array
  signing_public_key: string
  signing_secret_key: string
}

export type KeyMap = Map<string, KeyPair>

export enum KeysActionTypes {
  GENERATE_SEED_SUCCESS = '@@keys/GENERATE_SEED_SUCCESS',
  INITIALIZE_KEYS_ERROR = '@@keys/INITIALIZE_KEYS_ERROR',
  INITIALIZE_KEYS_FROM_SEED_ERROR = '@@keys/INITIALIZE_KEYS_FROM_SEED_ERROR',
  INITIALIZE_KEYS_FROM_SEED_REQUEST = '@@keys/INITIALIZE_KEYS_FROM_SEED_REQUEST',
  INITIALIZE_KEYS_FROM_SEED_SUCCESS = '@@keys/INITIALIZE_KEYS_FROM_SEED_SUCCESS',
  INITIALIZE_KEYS_REQUEST = '@@keys/INITIALIZE_KEYS_REQUEST',
  INITIALIZE_KEYS_SUCCESS = '@@keys/INITIALIZE_KEYS_SUCCESS',
  LOAD_KEYS_ERROR = '@@keys/LOAD_KEYS_ERROR',
  LOAD_KEYS_REQUEST = '@@keys/LOAD_KEYS_REQUEST',
  LOAD_KEYS_SUCCESS = '@@keys/LOAD_KEYS_SUCCESS',
  RESET_KEYS_ERROR = '@@keys/RESET_KEYS_ERROR',
  RESET_KEYS_REQUEST = '@@keys/RESET_KEYS_REQUEST',
  RESET_KEYS_SUCCESS = '@@keys/RESET_KEYS_SUCCESS'
}

export interface KeysState {
  readonly current_key?: KeyPair
  readonly errors?: string
  readonly keys: KeyMap
  readonly loading: boolean
  readonly ready: boolean
  readonly seedWords?: string[]
}
