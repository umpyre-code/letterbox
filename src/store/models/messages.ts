import { ClientID } from './client'

export interface Timestamp {
  nanos: number
  seconds: number
}

export interface MessageBody {
  // The markdown message body
  markdown: string
  // Parent message hash, if this is a reply.
  parent?: string
}

// Our internal representation of a message
export interface Message {
  body: MessageBody
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

export function fromApiMessage(message: APIMessage): Message {
  return {
    ...message,
    received_at: new Date(message.received_at!.seconds * 1000 + message.received_at!.nanos / 1e6),
    sent_at: new Date(message.sent_at.seconds * 1000 + message.sent_at.nanos / 1e6)
  }
}
