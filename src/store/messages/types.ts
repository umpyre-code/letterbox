import { ClientID } from 'store/client/types'

export interface Message {
  id?: number
  hash: string
  body: string
  to: ClientID
  from: ClientID
}

export type MessageList = Message[]

export interface FetchMessagesResponse {
  messages: MessageList
}

export const enum MessagesActionTypes {
  INITIALIZE_MESSAGES_REQUEST = '@@messages/INITIALIZE_MESSAGES_REQUEST',
  INITIALIZE_MESSAGES_SUCCESS = '@@messages/INITIALIZE_MESSAGES_SUCCESS',
  INITIALIZE_MESSAGES_ERROR = '@@messages/INITIALIZE_MESSAGES_ERROR',
  FETCH_MESSAGES_REQUEST = '@@messages/FETCH_MESSAGES_REQUEST',
  FETCH_MESSAGES_SUCCESS = '@@messages/FETCH_MESSAGES_SUCCESS',
  FETCH_MESSAGES_ERROR = '@@messages/FETCH_MESSAGES_ERROR'
}

export interface MessagesState {
  readonly ready: boolean
  readonly loading: boolean
  readonly messages: MessageList
  readonly errors?: string
}
