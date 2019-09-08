import { ClientID } from './client'

export interface Timestamp {
  nanos: number
  seconds: number
}

export type MessageHash = string

export enum MessageType {
  // a plain old message
  MESSAGE = '@@message/message',
  // message was seen by the recipient (aka read)
  SYSTEM_READ = '@@system/read'
}

export interface MessageBody {
  // The message type
  type: MessageType
  // The markdown message body
  markdown?: string
  // Parent message hash, used for message replies
  parent?: MessageHash
  // Message PDA
  pda?: string
  // the message that was seen, if this is a SYSTEM_READ message
  messageSeen?: MessageHash
}

// The message body when it's stored in the DB
export interface DBMessageBody {
  hash: MessageHash
  body: string
}

// Our internal representation of a message
export interface MessageBase {
  deleted: boolean
  from: ClientID
  hash?: MessageHash
  nonce: string
  pda?: string
  read: boolean
  received_at?: Date
  recipient_public_key: string
  sender_public_key: string
  sent_at: Date
  signature?: string
  to: ClientID
  value_cents: number
  children?: MessageHash[]
  type?: MessageType
}

export interface DecryptedMessage extends MessageBase {
  body?: MessageBody
}

export interface EncryptedMessage extends MessageBase {
  body?: string
}

// The API's actual representation of a message
export interface APIMessage {
  body: string
  from: ClientID
  hash?: string
  nonce: string
  pda?: string
  received_at?: Timestamp
  recipient_public_key: string
  sender_public_key: string
  sent_at: Timestamp
  signature?: string
  to: ClientID
  value_cents: number
}

export interface MessagesResponse {
  messages: APIMessage[]
}

export function fromApiMessage(message: APIMessage): EncryptedMessage {
  return {
    ...message,
    deleted: false,
    read: false,
    received_at: new Date(message.received_at.seconds * 1000 + message.received_at.nanos / 1e6),
    sent_at: new Date(message.sent_at.seconds * 1000 + message.sent_at.nanos / 1e6)
  }
}
