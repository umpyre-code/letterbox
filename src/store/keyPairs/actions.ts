import { action } from 'typesafe-actions'
import { KeyMap, KeyPair, KeysActionTypes } from './types'

export const initializeKeysRequest = (): any => action(KeysActionTypes.INITIALIZE_KEYS_REQUEST)
export const initializeKeysSuccess = (keys: [KeyPair, KeyMap]): any =>
  action(KeysActionTypes.INITIALIZE_KEYS_SUCCESS, keys)
export const initializeKeysError = (message: string): any =>
  action(KeysActionTypes.INITIALIZE_KEYS_ERROR, message)

export const loadKeysRequest = (): any => action(KeysActionTypes.LOAD_KEYS_REQUEST)
export const loadKeysSuccess = (keys: [KeyPair, KeyMap]): any =>
  action(KeysActionTypes.LOAD_KEYS_SUCCESS, keys)
export const loadKeysError = (message: string): any =>
  action(KeysActionTypes.LOAD_KEYS_ERROR, message)

export const generateSeedSuccess = (seedWords: string[]): any =>
  action(KeysActionTypes.GENERATE_SEED_SUCCESS, seedWords)
