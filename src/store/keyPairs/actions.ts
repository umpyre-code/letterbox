import { action } from 'typesafe-actions'
import { KeyMap, KeyPair, KeysActionTypes } from './types'

export const initializeKeysRequest = () => action(KeysActionTypes.INITIALIZE_KEYS_REQUEST)
export const initializeKeysSuccess = (keys: [KeyPair, KeyMap]) =>
  action(KeysActionTypes.INITIALIZE_KEYS_SUCCESS, keys)
export const initializeKeysError = (message: string) =>
  action(KeysActionTypes.INITIALIZE_KEYS_ERROR, message)