import { action } from 'typesafe-actions'
import { Draft } from '../drafts/types'
import { DecryptedMessage, MessageHash } from '../models/messages'
import { MessagesActionTypes, RankedMessages } from './types'

export const initializeMessagesRequest = () =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST)
export const initializeMessagesSuccess = (messages: RankedMessages) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS, messages)
export const initializeMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_ERROR, errorMessage)

export const fetchMessagesRequest = () => action(MessagesActionTypes.FETCH_MESSAGES_REQUEST)
export const fetchMessagesSuccess = (messages: RankedMessages) =>
  action(MessagesActionTypes.FETCH_MESSAGES_SUCCESS, messages)
export const fetchMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.FETCH_MESSAGES_ERROR, errorMessage)

export const deleteMessageRequest = (hash: MessageHash) =>
  action(MessagesActionTypes.DELETE_MESSAGE_REQUEST, hash)
export const deleteMessageSuccess = (messages: RankedMessages) =>
  action(MessagesActionTypes.DELETE_MESSAGE_SUCCESS, messages)
export const deleteMessageError = (errorMessage: string) =>
  action(MessagesActionTypes.DELETE_MESSAGE_ERROR, errorMessage)

export const sendMessagesRequest = (draft: Draft) =>
  action(MessagesActionTypes.SEND_MESSAGES_REQUEST, draft)
export const sendMessagesSuccess = (messages: RankedMessages) =>
  action(MessagesActionTypes.SEND_MESSAGES_SUCCESS, messages)
export const sendMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.SEND_MESSAGES_ERROR, errorMessage)

export const updateSketchRequest = () => action(MessagesActionTypes.UPDATE_SKETCH_REQUEST)
export const updateSketchSuccess = (sketch: string) =>
  action(MessagesActionTypes.UPDATE_SKETCH_SUCCESS, sketch)

export const messageReadRequest = (hash: MessageHash) =>
  action(MessagesActionTypes.MESSAGE_READ_REQUEST, hash)
export const messageReadSuccess = (messages: RankedMessages) =>
  action(MessagesActionTypes.MESSAGE_READ_SUCCESS, messages)
export const messageReadError = (errorMessage: string) =>
  action(MessagesActionTypes.MESSAGE_READ_ERROR, errorMessage)

export const loadMessagesRequest = (hash: MessageHash) =>
  action(MessagesActionTypes.LOAD_MESSAGES_REQUEST, hash)
export const loadMessagesSuccess = (messages: DecryptedMessage[]) =>
  action(MessagesActionTypes.LOAD_MESSAGES_SUCCESS, messages)
export const loadMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.LOAD_MESSAGES_ERROR, errorMessage)
export const unloadMessages = () => action(MessagesActionTypes.UNLOAD_MESSAGES_REQUEST)

export const deleteSweepRequest = () => action(MessagesActionTypes.DELETE_SWEEP_REQUEST)
export const deleteSweepSuccess = (messages: RankedMessages) =>
  action(MessagesActionTypes.DELETE_SWEEP_SUCCESS, messages)
export const deleteSweepError = (errorMessage: string) =>
  action(MessagesActionTypes.DELETE_SWEEP_ERROR, errorMessage)
