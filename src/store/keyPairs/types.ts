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

export const enum KeysActionTypes {
  INITIALIZE_KEYS_REQUEST = '@@keys/INITIALIZE_KEYS_REQUEST',
  INITIALIZE_KEYS_SUCCESS = '@@keys/INITIALIZE_KEYS_SUCCESS',
  INITIALIZE_KEYS_ERROR = '@@keys/INITIALIZE_KEYS_ERROR'
}

export interface KeysState {
  readonly ready: boolean
  readonly loading: boolean
  readonly keys: KeyMap
  readonly current_key?: KeyPair
  readonly errors?: string
}
