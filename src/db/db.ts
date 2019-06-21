import dexie from 'dexie'
import { ClientID } from 'store/client/types'
import { Key } from 'store/keys/types'
import { Message } from 'store/messages/types'

interface Token {
  client_id: ClientID
  token: string
  created_at: Date
}

class UmpyreDb extends Dexie {
  public messages: Dexie.Table<Message, number>
  public keys: Dexie.Table<Key, number>
  public apiTokens: Dexie.Table<Token, number>

  public constructor() {
    super('Umpyre')
    this.version(1).stores({
      api_tokens: '++id, client_id, token, created_at',
      keys: '++id, public_key, private_key, created_at',
      messages: '++id, hash, body, to, from'
    })
    this.messages = this.table('messages')
    this.keys = this.table('keys')
    this.apiTokens = this.table('api_tokens')
  }
}

const db = new UmpyreDb()

export default db
