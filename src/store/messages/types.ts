import { ClientID } from '../client/types'

export interface Message {
  id?: number
  hash: string
  body: string
  to: ClientID
  from: ClientID
}

export const enum MessagesActionTypes {
  INITIALIZE_MESSAGES_REQUEST = '@@messages/INITIALIZE_MESSAGES_REQUEST',
  INITIALIZE_MESSAGES_SUCCESS = '@@messages/INITIALIZE_MESSAGES_SUCCESS',
  INITIALIZE_MESSAGES_ERROR = '@@messages/INITIALIZE_MESSAGES_ERROR'
}

export interface MessagesState {
  readonly ready: boolean
  readonly loading: boolean
  readonly messages: Array<Message>
  readonly errors?: string
}
