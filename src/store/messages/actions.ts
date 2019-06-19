import { action } from 'typesafe-actions'
import { MessagesActionTypes, Message } from './types'

export const initializeMessagesRequest = () =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST)
export const initializeMessagesSuccess = (messages: Array<Message>) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS, messages)
export const initializeMessagesError = (message: string) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_ERROR, message)
