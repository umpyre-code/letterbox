import { Message, MessageList, MessagesActionTypes } from 'store/messages/types'
import { action } from 'typesafe-actions'

export const initializeMessagesRequest = () =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST)
export const initializeMessagesSuccess = (messages: Message[]) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS, messages)
export const initializeMessagesError = (message: string) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_ERROR, message)

export const fetchMessagesRequest = () => action(MessagesActionTypes.FETCH_MESSAGES_REQUEST)
export const fetchMessagesSuccess = (messages: MessageList) =>
  action(MessagesActionTypes.FETCH_MESSAGES_SUCCESS, messages)
export const fetchMessagesError = (message: string) =>
  action(MessagesActionTypes.FETCH_MESSAGES_ERROR, message)
