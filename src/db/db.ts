import Dexie from 'dexie'
import { Key } from '../store/keys/types'
import { ClientID } from '../store/client/types'
import { Message } from '../store/messages/types'

interface Token {
  client_id: ClientID
  token: string
  created_at: Date
}

class UmpyreDb extends Dexie {
  public messages: Dexie.Table<Message, number>
  public keys: Dexie.Table<Key, number>
  public api_tokens: Dexie.Table<Token, number>

  public constructor() {
    super('Umpyre')
    this.version(1).stores({
      messages: '++id, hash, body, to, from',
      keys: '++id, public_key, private_key, created_at',
      api_tokens: '++id, client_id, token, created_at'
    })
    this.messages = this.table('messages')
    this.keys = this.table('keys')
    this.api_tokens = this.table('api_tokens')
  }
}

const db = new UmpyreDb()

export default db
