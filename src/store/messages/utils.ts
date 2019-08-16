import sodium from 'libsodium-wrappers'
import { KeyPair } from '../keyPairs/types'
import { ClientID, ClientCredentials } from '../models/client'
import {
  APIMessage,
  MessageBase,
  fromApiMessage,
  MessageBody,
  EncryptedMessage,
  DecryptedMessage
} from '../models/messages'
import { db } from '../../db/db'
import { API } from '../api'

export function toApiMessage(message: EncryptedMessage, from: ClientID): APIMessage {
  return {
    body: message.body as string,
    from,
    nonce: message.nonce,
    pda: message.pda,
    received_at: undefined,
    recipient_public_key: message.recipient_public_key,
    sender_public_key: message.sender_public_key,
    sent_at: {
      nanos: (message.sent_at.getTime() % 1000) * 1e6,
      seconds: Math.floor(message.sent_at.getTime() / 1000)
    },
    to: message.to,
    value_cents: message.value_cents
  }
}

export async function encryptMessageBody(
  message: APIMessage,
  keyPair: KeyPair,
  theirPublicKey: string
): Promise<APIMessage> {
  await sodium.ready
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)
  const ciphertext = sodium.crypto_box_easy(
    sodium.from_string(message.body),
    nonce,
    sodium.from_base64(theirPublicKey, sodium.base64_variants.URLSAFE_NO_PADDING),
    sodium.from_base64(keyPair.box_secret_key, sodium.base64_variants.URLSAFE_NO_PADDING)
  )
  return {
    ...message,
    body: sodium.to_base64(ciphertext, sodium.base64_variants.URLSAFE_NO_PADDING),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.URLSAFE_NO_PADDING),
    recipient_public_key: theirPublicKey,
    sender_public_key: keyPair.box_public_key
  }
}

export async function hashMessage(message: APIMessage): Promise<APIMessage> {
  await sodium.ready
  const hashableMessage: any = {
    ...message,
    hash: undefined,
    signature: undefined
  }

  const orderedKeysObj: any = {}
  Object.keys(hashableMessage)
    .sort()
    .forEach(key => {
      orderedKeysObj[key] = hashableMessage[key]
    })
  const hashableMessageJson = JSON.stringify(orderedKeysObj, (key, value) => {
    if (value !== null) {
      return value
    }
    return undefined
  })
  const hash = sodium.to_base64(
    sodium.crypto_generichash(32, sodium.from_string(hashableMessageJson)),
    sodium.base64_variants.URLSAFE_NO_PADDING
  )

  return {
    ...message,
    hash
  }
}

export async function signMessage(message: APIMessage, keyPair: KeyPair): Promise<APIMessage> {
  await sodium.ready
  const signableMessage: any = {
    ...message,
    signature: undefined
  }

  const orderedKeysObj: any = {}
  Object.keys(signableMessage)
    .sort()
    .forEach(key => {
      orderedKeysObj[key] = signableMessage[key]
    })
  const signableMessageJson = JSON.stringify(orderedKeysObj)
  const signature = sodium.to_base64(
    sodium.crypto_sign_detached(
      sodium.from_string(signableMessageJson),
      sodium.from_base64(keyPair.signing_secret_key, sodium.base64_variants.URLSAFE_NO_PADDING)
    ),
    sodium.base64_variants.URLSAFE_NO_PADDING
  )

  return {
    ...message,
    signature
  }
}

export async function getMessagesWithoutBody(
  withinDays: number,
  includeDeleted: boolean
): Promise<MessageBase[]> {
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - withinDays)

  return db.messageInfos
    .orderBy('received_at')
    .filter(message => {
      return (
        (!message.deleted || includeDeleted) &&
        message.received_at !== undefined &&
        message.received_at > fromDate
      )
    })
    .toArray()
}

async function decryptMessageBody(
  body: string,
  nonce: string,
  myPrivateKey: string,
  theirPublicKey: string
): Promise<string> {
  await sodium.ready
  return sodium.to_string(
    sodium.crypto_box_open_easy(
      sodium.from_base64(body, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(nonce, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(theirPublicKey, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(myPrivateKey, sodium.base64_variants.URLSAFE_NO_PADDING)
    )
  )
}

async function decryptMessage(message: EncryptedMessage): Promise<DecryptedMessage> {
  // Need to gracefully handle the case where this DB doesn't contain this public
  // key
  const myKeyPair = await db.keyPairs.get({ box_public_key: message.recipient_public_key })
  if (myKeyPair) {
    return {
      ...message,
      body: JSON.parse(
        await decryptMessageBody(
          message.body,
          message.nonce,
          myKeyPair.box_secret_key,
          message.sender_public_key
        )
      ) as MessageBody
    }
  }
  return undefined
}

export async function decryptStoreAndRetrieveMessages(
  messages: APIMessage[]
): Promise<MessageBase[]> {
  // Look for messages that already exist in the DB, but were returned by the API
  const existingMessages = await Promise.all(
    messages.filter(message => message).map(message => db.messageInfos.get(message.hash))
  )
  // Filter out any existing messages
  const newMessages = messages.filter(
    message => message && !existingMessages.find(m => m && m.hash === message.hash)
  )

  // Split messages into info and body parts
  const messageBodies = newMessages.map(message => ({
    body: message.body,
    hash: message.hash
  }))

  const messageInfos = newMessages.map(message => ({
    ...fromApiMessage(message),
    body: undefined
  }))

  await db.transaction('rw', db.messageInfos, db.messageBodies, async () => {
    await db.messageInfos.bulkAdd(messageInfos)
    await db.messageBodies.bulkAdd(messageBodies)
  })
  return getMessagesWithoutBody(30, false)
}

export async function fetchMessages(
  credentials: ClientCredentials,
  sketch: string
): Promise<APIMessage[]> {
  const api = new API(credentials)
  return api.fetchMessages(sketch)
}
