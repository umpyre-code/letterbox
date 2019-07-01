// tslint:disable-next-line:import-name
import Dexie from 'dexie'
import { Draft } from '../store/drafts/types'
import { KeyPair } from '../store/keyPairs/types'
import { ClientCredentials } from '../store/models/client'
import { Message } from '../store/models/messages'

interface Token extends ClientCredentials {
  created_at: Date
}

class UmpyreDb extends Dexie {
  public apiTokens: Dexie.Table<Token, number>
  public drafts: Dexie.Table<Draft, number>
  public keyPairs: Dexie.Table<KeyPair, number>
  public messages: Dexie.Table<Message, string>

  public constructor() {
    super('Umpyre')
    this.version(1).stores({
      api_tokens: '++id, client_id, token, created_at',
      drafts: '++id, editorContent, recipient, pda, created_at',
      keyPairs: '++id, public_key, private_key, created_at',
      messages: 'hash, body, to, from, received_at, pda, public_key, nonce'
    })
    this.apiTokens = this.table('api_tokens')
    this.drafts = this.table('drafts')
    this.keyPairs = this.table('keyPairs')
    this.messages = this.table('messages')
  }
}

export const db = new UmpyreDb()
