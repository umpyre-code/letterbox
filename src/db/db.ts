// tslint:disable-next-line:import-name
import Dexie from 'dexie'
import { ClientID } from 'store/client/types'
import { Key } from 'store/keys/types'
import { Message } from 'store/messages/types'

interface Token {
  client_id: ClientID
  token: string
  created_at: Date
}

class UmpyreDb extends Dexie {
  public apiTokens: Dexie.Table<Token, number>
  public keys: Dexie.Table<Key, number>
  public messages: Dexie.Table<Message, number>

  public constructor() {
    super('Umpyre')
    this.version(1).stores({
      api_tokens: '++id, client_id, token, created_at',
      keys: '++id, public_key, private_key, created_at',
      messages: 'hash, body, to, from, created_at'
    })
    this.apiTokens = this.table('api_tokens')
    this.keys = this.table('keys')
    this.messages = this.table('messages')
  }
}

export const db = new UmpyreDb()
