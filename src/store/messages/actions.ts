import { action } from 'typesafe-actions'
import { Draft } from '../drafts/types'
import { MessageBase, MessageHash } from '../models/messages'
import { MessagesActionTypes } from './types'

export const initializeMessagesRequest = (): any =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST)
export const initializeMessagesSuccess = (messages: MessageBase[]): any =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS, messages)
export const initializeMessagesError = (errorMessage: string): any =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_ERROR, errorMessage)

export const fetchMessagesRequest = (): any => action(MessagesActionTypes.FETCH_MESSAGES_REQUEST)
export const fetchMessagesSuccess = (messages: MessageBase[]): any =>
  action(MessagesActionTypes.FETCH_MESSAGES_SUCCESS, messages)
export const fetchMessagesError = (errorMessage: string): any =>
  action(MessagesActionTypes.FETCH_MESSAGES_ERROR, errorMessage)

export const deleteMessageRequest = (hash: MessageHash): any =>
  action(MessagesActionTypes.DELETE_MESSAGE_REQUEST, hash)
export const deleteMessageSuccess = (messages: MessageBase[]): any =>
  action(MessagesActionTypes.DELETE_MESSAGE_SUCCESS, messages)
export const deleteMessageError = (errorMessage: string): any =>
  action(MessagesActionTypes.DELETE_MESSAGE_ERROR, errorMessage)

export const sendMessagesRequest = (draft: Draft): any =>
  action(MessagesActionTypes.SEND_MESSAGES_REQUEST, draft)
export const sendMessagesSuccess = (): any => action(MessagesActionTypes.SEND_MESSAGES_SUCCESS)
export const sendMessagesError = (errorMessage: string): any =>
  action(MessagesActionTypes.SEND_MESSAGES_ERROR, errorMessage)

export const updateSketchRequest = (): any => action(MessagesActionTypes.UPDATE_SKETCH_REQUEST)
export const updateSketchSuccess = (sketch: string): any =>
  action(MessagesActionTypes.UPDATE_SKETCH_SUCCESS, sketch)

export const messageReadRequest = (hash: MessageHash): any =>
  action(MessagesActionTypes.MESSAGE_READ_REQUEST, hash)
export const messageReadSuccess = (messages: MessageBase[]): any =>
  action(MessagesActionTypes.MESSAGE_READ_SUCCESS, messages)
export const messageReadError = (errorMessage: string): any =>
  action(MessagesActionTypes.MESSAGE_READ_ERROR, errorMessage)
