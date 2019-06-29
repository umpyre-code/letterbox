import { ClientID } from './client'

export interface Timestamp {
  seconds: number
  nanos: number
}

// Our internal representation of a message
export interface Message {
  hash: string
  body: string
  to: ClientID
  from: ClientID
  pda: string
  received_at: Date
  nonce: string
  public_key: string
}

// The API's actual representation of a message
export interface APIMessage {
  hash: string
  body: string
  to: ClientID
  from: ClientID
  pda: string
  received_at: Timestamp
  nonce: string
  public_key: string
}

export interface MessagesResponse {
  messages: APIMessage[]
}
