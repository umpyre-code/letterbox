import { ClientID } from './client'

export interface Timestamp {
  seconds: number
  nanos: number
}

export interface Message {
  hash: string
  body: string
  to: ClientID
  from: ClientID
  pda: string
  received_at: Timestamp
  nonce: string
  public_key: string
}
