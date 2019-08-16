// tslint:disable-next-line:import-name
import Dexie from 'dexie'
import { Draft } from '../store/drafts/types'
import { KeyPair } from '../store/keyPairs/types'
import { ClientCredentials } from '../store/models/client'
import { DBMessageBody, MessageBase, MessageHash } from '../store/models/messages'

interface Token extends ClientCredentials {
  created_at: Date
}

// A simple key/value pair
interface KeyValue {
  key: string
  value: string
}

class UmpyreDb extends Dexie {
  public apiTokens: Dexie.Table<Token, number>

  public drafts: Dexie.Table<Draft, number>

  public keyPairs: Dexie.Table<KeyPair, number>

  public keyValues: Dexie.Table<KeyValue, string>

  // The message info (i.e., everything except the body) and the message body
  // are stored separately. This is done as a performance optimization, since
  // the bodies are only ever loaded when a message is explicitly read.

  // messageInfos includes everything _except_ the body
  public messageInfos: Dexie.Table<MessageBase, MessageHash>

  // messageBodies is _just_ the message body
  public messageBodies: Dexie.Table<DBMessageBody, MessageHash>

  public constructor() {
    super('Umpyre')
    this.init()
  }

  public async deleteAndReset() {
    await this.delete()
    await this.close()
    this.init()
    await this.open()
  }

  private init() {
    this.version(1).stores({
      api_tokens: '++id, client_id, token, created_at',
      drafts: '++id, recipient, created_at',
      keyPairs:
        '++id, box_public_key, box_secret_key, signing_public_key, signing_secret_key, created_at',
      keyValues: 'key, value',
      messageBodies: 'hash',
      messageInfos:
        'hash, to, from, received_at, recipient_public_key, sender_public_key, nonce, sent_at, signature'
    })
    this.apiTokens = this.table('api_tokens')
    this.drafts = this.table('drafts')
    this.keyPairs = this.table('keyPairs')
    this.keyValues = this.table('keyValues')
    this.messageInfos = this.table('messageInfos')
    this.messageBodies = this.table('messageBodies')
  }
}

export const db = new UmpyreDb()
