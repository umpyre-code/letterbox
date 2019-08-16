import { action } from 'typesafe-actions'
import { Draft } from '../drafts/types'
import { Message, MessageHash } from '../models/messages'
import { MessagesActionTypes } from './types'

export const initializeMessagesRequest = (): ReturnType<typeof action> =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST)
export const initializeMessagesSuccess = (messages: Message[]): ReturnType<typeof action> =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS, messages)
export const initializeMessagesError = (errorMessage: string): ReturnType<typeof action> =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_ERROR, errorMessage)

export const fetchMessagesRequest = (): ReturnType<typeof action> =>
  action(MessagesActionTypes.FETCH_MESSAGES_REQUEST)
export const fetchMessagesSuccess = (messages: Message[]): ReturnType<typeof action> =>
  action(MessagesActionTypes.FETCH_MESSAGES_SUCCESS, messages)
export const fetchMessagesError = (errorMessage: string): ReturnType<typeof action> =>
  action(MessagesActionTypes.FETCH_MESSAGES_ERROR, errorMessage)

export const deleteMessageRequest = (hash: MessageHash): ReturnType<typeof action> =>
  action(MessagesActionTypes.DELETE_MESSAGE_REQUEST, hash)
export const deleteMessageSuccess = (messages: Message[]): ReturnType<typeof action> =>
  action(MessagesActionTypes.DELETE_MESSAGE_SUCCESS, messages)
export const deleteMessageError = (errorMessage: string): ReturnType<typeof action> =>
  action(MessagesActionTypes.DELETE_MESSAGE_ERROR, errorMessage)

export const sendMessagesRequest = (draft: Draft): ReturnType<typeof action> =>
  action(MessagesActionTypes.SEND_MESSAGES_REQUEST, draft)
export const sendMessagesSuccess = (): ReturnType<typeof action> =>
  action(MessagesActionTypes.SEND_MESSAGES_SUCCESS)
export const sendMessagesError = (errorMessage: string): ReturnType<typeof action> =>
  action(MessagesActionTypes.SEND_MESSAGES_ERROR, errorMessage)

export const updateSketchRequest = (): ReturnType<typeof action> =>
  action(MessagesActionTypes.UPDATE_SKETCH_REQUEST)
export const updateSketchSuccess = (sketch: string): ReturnType<typeof action> =>
  action(MessagesActionTypes.UPDATE_SKETCH_SUCCESS, sketch)

export const messageReadRequest = (hash: MessageHash): ReturnType<typeof action> =>
  action(MessagesActionTypes.MESSAGE_READ_REQUEST, hash)
export const messageReadSuccess = (messages: Message[]): ReturnType<typeof action> =>
  action(MessagesActionTypes.MESSAGE_READ_SUCCESS, messages)
export const messageReadError = (errorMessage: string): ReturnType<typeof action> =>
  action(MessagesActionTypes.MESSAGE_READ_ERROR, errorMessage)
