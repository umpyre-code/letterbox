import { action } from 'typesafe-actions'
import { MessagesActionTypes, Message, MessageList } from './types'

export const initializeMessagesRequest = () =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST)
export const initializeMessagesSuccess = (messages: Array<Message>) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS, messages)
export const initializeMessagesError = (message: string) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_ERROR, message)

export const fetchMessagesRequest = () => action(MessagesActionTypes.FETCH_MESSAGES_REQUEST)
export const fetchMessagesSuccess = (messages: MessageList) =>
  action(MessagesActionTypes.FETCH_MESSAGES_SUCCESS, messages)
export const fetchMessagesError = (message: string) =>
  action(MessagesActionTypes.FETCH_MESSAGES_ERROR, message)
