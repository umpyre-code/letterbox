export interface Key {
  id?: number
  public_key: string
  private_key: string
  created_at: Date
}

export type KeyMap = Map<string, Key>

export const enum KeysActionTypes {
  INITIALIZE_KEYS_REQUEST = '@@keys/INITIALIZE_KEYS_REQUEST',
  INITIALIZE_KEYS_SUCCESS = '@@keys/INITIALIZE_KEYS_SUCCESS',
  INITIALIZE_KEYS_ERROR = '@@keys/INITIALIZE_KEYS_ERROR'
}

export interface KeysState {
  readonly ready: boolean
  readonly loading: boolean
  readonly keys: KeyMap
  readonly current_key?: Key
  readonly errors?: string
}
