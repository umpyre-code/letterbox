import { action } from 'typesafe-actions'
import { KeyMap, KeyPair, KeysActionTypes } from './types'

export const initializeKeysRequest = () => action(KeysActionTypes.INITIALIZE_KEYS_REQUEST)
export const initializeKeysSuccess = (keys: [KeyPair, KeyMap]) =>
  action(KeysActionTypes.INITIALIZE_KEYS_SUCCESS, keys)
export const initializeKeysError = (message: string) =>
  action(KeysActionTypes.INITIALIZE_KEYS_ERROR, message)

export const loadKeysRequest = () => action(KeysActionTypes.LOAD_KEYS_REQUEST)
export const loadKeysSuccess = (keys: [KeyPair, KeyMap]) =>
  action(KeysActionTypes.LOAD_KEYS_SUCCESS, keys)
export const loadKeysError = (message: string) => action(KeysActionTypes.LOAD_KEYS_ERROR, message)

export const generateSeedSuccess = (seedWords: string[]) =>
  action(KeysActionTypes.GENERATE_SEED_SUCCESS, seedWords)

export const initializeKeysFromSeedRequest = (seedWords: string[]) =>
  action(KeysActionTypes.INITIALIZE_KEYS_FROM_SEED_REQUEST, seedWords)
export const initializeKeysFromSeedSuccess = (keys: [KeyPair, KeyMap]) =>
  action(KeysActionTypes.INITIALIZE_KEYS_FROM_SEED_SUCCESS, keys)
export const initializeKeysFromSeedError = (message: string) =>
  action(KeysActionTypes.INITIALIZE_KEYS_FROM_SEED_ERROR, message)

export const resetKeysRequest = () => action(KeysActionTypes.RESET_KEYS_REQUEST)
export const resetKeysSuccess = (keys: [KeyPair, KeyMap]) =>
  action(KeysActionTypes.RESET_KEYS_SUCCESS, keys)
export const resetKeysError = (message: string) => action(KeysActionTypes.RESET_KEYS_ERROR, message)
