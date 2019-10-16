import { MessageBase, DecryptedMessage } from '../models/messages'

export interface FetchMessagesResponse {
  messages: MessageBase[]
}

export enum MessagesActionTypes {
  DELETE_MESSAGE_ERROR = '@@messages/DELETE_MESSAGE_ERROR',
  DELETE_MESSAGE_REQUEST = '@@messages/DELETE_MESSAGE_REQUEST',
  DELETE_MESSAGE_SUCCESS = '@@messages/DELETE_MESSAGE_SUCCESS',
  DELETE_SWEEP_ERROR = '@@messages/DELETE_SWEEP_ERROR',
  DELETE_SWEEP_REQUEST = '@@messages/DELETE_SWEEP_REQUEST',
  DELETE_SWEEP_SUCCESS = '@@messages/DELETE_SWEEP_SUCCESS',
  FETCH_MESSAGES_ERROR = '@@messages/FETCH_MESSAGES_ERROR',
  FETCH_MESSAGES_REQUEST = '@@messages/FETCH_MESSAGES_REQUEST',
  FETCH_MESSAGES_SUCCESS = '@@messages/FETCH_MESSAGES_SUCCESS',
  INITIALIZE_MESSAGES_ERROR = '@@messages/INITIALIZE_MESSAGES_ERROR',
  INITIALIZE_MESSAGES_REQUEST = '@@messages/INITIALIZE_MESSAGES_REQUEST',
  INITIALIZE_MESSAGES_SUCCESS = '@@messages/INITIALIZE_MESSAGES_SUCCESS',
  LOAD_MESSAGES_ERROR = '@@messages/LOAD_MESSAGES_ERROR',
  LOAD_MESSAGES_REQUEST = '@@messages/LOAD_MESSAGES_REQUEST',
  LOAD_MESSAGES_SUCCESS = '@@messages/LOAD_MESSAGES_SUCCESS',
  MESSAGE_READ_ERROR = '@@messages/MESSAGE_READ_ERROR',
  MESSAGE_READ_REQUEST = '@@messages/MESSAGE_READ_REQUEST',
  MESSAGE_READ_SUCCESS = '@@messages/MESSAGE_READ_SUCCESS',
  SEND_MESSAGES_ERROR = '@@messages/SEND_MESSAGES_ERROR',
  SEND_MESSAGES_REQUEST = '@@messages/SEND_MESSAGES_REQUEST',
  SEND_MESSAGES_SUCCESS = '@@messages/SEND_MESSAGES_SUCCESS',
  UNLOAD_MESSAGES_REQUEST = '@@messages/UNLOAD_MESSAGES_REQUEST',
  UPDATE_SKETCH_REQUEST = '@@messages/UPDATE_SKETCH_REQUEST',
  UPDATE_SKETCH_SUCCESS = '@@messages/UPDATE_SKETCH_SUCCESS'
}

export interface RankedMessages {
  readMessages: MessageBase[]
  unreadMessages: MessageBase[]
}

export type LoadedMessages = Map<string, DecryptedMessage[]>

export interface MessagesState {
  readonly errors?: string
  readonly loadedMessages: LoadedMessages
  readonly loading: boolean
  readonly readMessages: MessageBase[]
  readonly sentMessages: MessageBase[]
  readonly sketch: Sketch
  readonly unreadMessages: MessageBase[]
}

export interface Sketch {
  salt: string
  sketch: string
}
