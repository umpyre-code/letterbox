import Dexie from 'dexie'
import sodium from 'libsodium-wrappers'
import { Draft } from '../store/drafts/types'
import { KeyPair } from '../store/keys/types'
import { ClientCredentials } from '../store/models/client'
import { DBMessageBody, MessageBase, MessageHash } from '../store/models/messages'

interface Token extends ClientCredentials {
  created_at: Date
}

class UmpyreDb extends Dexie {
  public apiTokens: Dexie.Table<Token, number>

  public drafts: Dexie.Table<Draft, number>

  public keyPairs: Dexie.Table<KeyPair, number>

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
    try {
      await this.delete()
      this.close()
    } catch (error) {
      console.error('Error deleting DB', error)
    }
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

    this.version(2)
      .stores({
        messageBodies: 'hash'
      })
      .upgrade(async tx => {
        await sodium.ready
        return (tx as any).messageBodies.toCollection().modify((message: DBMessageBody) => {
          const bodyString = message.body
          // make sure it's a string
          if (bodyString && typeof bodyString === 'string') {
            const bodyBlob = new Blob(
              [sodium.from_base64(bodyString, sodium.base64_variants.URLSAFE_NO_PADDING)],
              { type: 'application/octet-binary' }
            )
            // eslint-disable-next-line no-param-reassign
            message.bodyBlob = bodyBlob
            // eslint-disable-next-line no-param-reassign
            delete message.body
          }
        })
      })

    this.apiTokens = this.table('api_tokens')
    this.drafts = this.table('drafts')
    this.keyPairs = this.table('keyPairs')
    this.messageInfos = this.table('messageInfos')
    this.messageBodies = this.table('messageBodies')
  }
}

export const db = new UmpyreDb()
