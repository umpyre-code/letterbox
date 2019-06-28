import { action } from 'typesafe-actions'
import { Message, MessageList } from '../models/messages'
import { MessagesActionTypes } from './types'

export const initializeMessagesRequest = () =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST)
export const initializeMessagesSuccess = (messages: Message[]) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS, messages)
export const initializeMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.INITIALIZE_MESSAGES_ERROR, errorMessage)

export const fetchMessagesRequest = () => action(MessagesActionTypes.FETCH_MESSAGES_REQUEST)
export const fetchMessagesSuccess = (messages: MessageList) =>
  action(MessagesActionTypes.FETCH_MESSAGES_SUCCESS, messages)
export const fetchMessagesError = (errorMessage: string) =>
  action(MessagesActionTypes.FETCH_MESSAGES_ERROR, errorMessage)

export const sendMessageRequest = (message: Message) =>
  action(MessagesActionTypes.SEND_MESSAGE_REQUEST, message)
export const sendMessageSuccess = () => action(MessagesActionTypes.SEND_MESSAGE_SUCCESS)
export const sendMessageError = (errorMessage: string) =>
  action(MessagesActionTypes.SEND_MESSAGE_ERROR, errorMessage)
