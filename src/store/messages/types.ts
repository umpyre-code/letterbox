import { Message } from '../models/messages'

export interface FetchMessagesResponse {
  messages: Message[]
}

export const enum MessagesActionTypes {
  INITIALIZE_MESSAGES_REQUEST = '@@messages/INITIALIZE_MESSAGES_REQUEST',
  INITIALIZE_MESSAGES_SUCCESS = '@@messages/INITIALIZE_MESSAGES_SUCCESS',
  INITIALIZE_MESSAGES_ERROR = '@@messages/INITIALIZE_MESSAGES_ERROR',
  FETCH_MESSAGES_REQUEST = '@@messages/FETCH_MESSAGES_REQUEST',
  FETCH_MESSAGES_SUCCESS = '@@messages/FETCH_MESSAGES_SUCCESS',
  FETCH_MESSAGES_ERROR = '@@messages/FETCH_MESSAGES_ERROR',
  SEND_MESSAGE_REQUEST = '@@messages/SEND_MESSAGE_REQUEST',
  SEND_MESSAGE_SUCCESS = '@@messages/SEND_MESSAGE_SUCCESS',
  SEND_MESSAGE_ERROR = '@@messages/SEND_MESSAGE_ERROR',
  UPDATE_SKETCH_REQUEST = '@@messages/UPDATE_SKETCH_REQUEST',
  UPDATE_SKETCH_SUCCESS = '@@messages/UPDATE_SKETCH_SUCCESS'
}

export interface MessagesState {
  readonly errors?: string
  readonly loading: boolean
  readonly readMessages: Message[]
  readonly sketch: string
  readonly unreadMessages: Message[]
}
