import { action } from 'typesafe-actions'
import { KeyMap, KeyPair, KeysActionTypes } from './types'

export const initializeKeysRequest = (): ReturnType<typeof action> =>
  action(KeysActionTypes.INITIALIZE_KEYS_REQUEST)
export const initializeKeysSuccess = (keys: [KeyPair, KeyMap]): ReturnType<typeof action> =>
  action(KeysActionTypes.INITIALIZE_KEYS_SUCCESS, keys)
export const initializeKeysError = (message: string): ReturnType<typeof action> =>
  action(KeysActionTypes.INITIALIZE_KEYS_ERROR, message)

export const loadKeysRequest = (): ReturnType<typeof action> =>
  action(KeysActionTypes.LOAD_KEYS_REQUEST)
export const loadKeysSuccess = (keys: [KeyPair, KeyMap]): ReturnType<typeof action> =>
  action(KeysActionTypes.LOAD_KEYS_SUCCESS, keys)
export const loadKeysError = (message: string): ReturnType<typeof action> =>
  action(KeysActionTypes.LOAD_KEYS_ERROR, message)

export const generateSeedSuccess = (seedWords: string[]): ReturnType<typeof action> =>
  action(KeysActionTypes.GENERATE_SEED_SUCCESS, seedWords)
