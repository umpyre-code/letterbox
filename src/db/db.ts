import Dexie from 'dexie'
import Sodium from '../utils/sodium'

interface ClientID {
  id: string
}

interface Message {
  id?: number
  hash: string
  body: number
  to: ClientID
  from: ClientID
}

interface Key {
  id?: number
  created_at: Date
  public_key: string
  private_key: string
}

class UmpyreDb extends Dexie {
  public messages: Dexie.Table<Message, number>
  public keys: Dexie.Table<Key, number>

  public constructor() {
    super('Umpyre')
    this.version(1).stores({
      messages: '++id, hash, body, to, from',
      keys: '++id, created_at, public_key, private_key'
    })
    this.messages = this.table('messages')
    this.keys = this.table('keys')
  }
}

const db = new UmpyreDb()

export default db
