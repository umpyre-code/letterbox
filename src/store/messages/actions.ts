import { action } from 'typesafe-actions'
import { Draft } from '../drafts/types'
import { Message, MessageHash } from '../models/messages'
import { MessagesActionTypes } from './types'

export const initializeMessagesRequest = () =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST)
export const initializeMessagesSuccess = (messages: Message[]) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS, messages)
export const initializeMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_ERROR, errorMessage)

export const fetchMessagesRequest = () => action(MessagesActionTypes.FETCH_MESSAGES_REQUEST)
export const fetchMessagesSuccess = (messages: Message[]) =>
  action(MessagesActionTypes.FETCH_MESSAGES_SUCCESS, messages)
export const fetchMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.FETCH_MESSAGES_ERROR, errorMessage)

export const deleteMessageRequest = (hash: MessageHash) =>
  action(MessagesActionTypes.DELETE_MESSAGE_REQUEST, hash)
export const deleteMessageSuccess = (messages: Message[]) =>
  action(MessagesActionTypes.DELETE_MESSAGE_SUCCESS, messages)
export const deleteMessageError = (errorMessage: string) =>
  action(MessagesActionTypes.DELETE_MESSAGE_ERROR, errorMessage)

export const sendMessagesRequest = (draft: Draft) =>
  action(MessagesActionTypes.SEND_MESSAGES_REQUEST, draft)
export const sendMessagesSuccess = () => action(MessagesActionTypes.SEND_MESSAGES_SUCCESS)
export const sendMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.SEND_MESSAGES_ERROR, errorMessage)

export const updateSketchRequest = () => action(MessagesActionTypes.UPDATE_SKETCH_REQUEST)
export const updateSketchSuccess = (sketch: string) =>
  action(MessagesActionTypes.UPDATE_SKETCH_SUCCESS, sketch)

export const messageReadRequest = (hash: MessageHash) =>
  action(MessagesActionTypes.MESSAGE_READ_REQUEST, hash)
export const messageReadSuccess = (messages: Message[]) =>
  action(MessagesActionTypes.MESSAGE_READ_SUCCESS, messages)
export const messageReadError = (errorMessage: string) =>
  action(MessagesActionTypes.MESSAGE_READ_ERROR, errorMessage)
