import { ClientID } from './client'

export interface Message {
  hash: string
  body: string
  to: ClientID
  from: ClientID
  pda: string
  created_at: Date
}
