import { ClientID } from './client'

export interface Timestamp {
  nanos: number
  seconds: number
}

// Our internal representation of a message
export interface Message {
  body: string
  from: ClientID
  hash?: string
  nonce: string
  pda: string
  received_at?: Date
  recipient_public_key: string
  sender_public_key: string
  sent_at: Date
  signature?: string
  to: ClientID
}

// The API's actual representation of a message
export interface APIMessage {
  body: string
  from: ClientID
  hash?: string
  nonce: string
  pda: string
  received_at?: Timestamp
  recipient_public_key: string
  sender_public_key: string
  sent_at: Timestamp
  signature?: string
  to: ClientID
}

export interface MessagesResponse {
  messages: APIMessage[]
}
