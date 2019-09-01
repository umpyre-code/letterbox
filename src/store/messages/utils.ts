import sodium from 'libsodium-wrappers'
import _ from 'lodash'
import { db } from '../../db/db'
import { API } from '../api'
import { KeyPair } from '../keys/types'
import { ClientCredentials, ClientID } from '../models/client'
import {
  APIMessage,
  DecryptedMessage,
  EncryptedMessage,
  fromApiMessage,
  MessageBase,
  MessageBody,
  MessageHash
} from '../models/messages'

export async function addChildMessage(
  parentHash: MessageHash,
  childHash: MessageHash
): Promise<number> {
  const parent = await db.messageInfos.get(parentHash)
  return db.messageInfos.update(parent.hash, {
    ...parent,
    children: _.uniq([...(parent.children || []), childHash])
  })
}

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
  const hashableMessage = {
    ...message,
    hash: undefined,
    signature: undefined
  }

  const orderedKeysObj = {}
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
  const signableMessage = {
    ...message,
    signature: undefined
  }

  const orderedKeysObj = {}
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
  includeDeleted: boolean,
  includeMissingKey: boolean
): Promise<MessageBase[]> {
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - withinDays)
  const boxPublicKeys = new Set()
  if (!includeMissingKey) {
    await db.keyPairs.each(keyPair => boxPublicKeys.add(keyPair.box_public_key))
  }

  return db.messageInfos
    .orderBy('received_at')
    .filter(message => {
      return (
        (!message.deleted || includeDeleted) &&
        message.received_at !== undefined &&
        message.received_at > fromDate &&
        (includeMissingKey ||
          boxPublicKeys.has(message.recipient_public_key) ||
          boxPublicKeys.has(message.sender_public_key))
      )
    })
    .toArray()
}

async function decryptMessageBody(
  body: string,
  nonce: string,
  publicKey: string,
  privateKey: string
): Promise<string> {
  await sodium.ready
  return sodium.to_string(
    sodium.crypto_box_open_easy(
      sodium.from_base64(body, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(nonce, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(publicKey, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(privateKey, sodium.base64_variants.URLSAFE_NO_PADDING)
    )
  )
}

function getMyPublicKey(clientId: ClientID, message: EncryptedMessage): string {
  if (message.from === clientId) {
    return message.sender_public_key
  }
  return message.recipient_public_key
}

function getTheirPublicKey(clientId: ClientID, message: EncryptedMessage): string {
  if (message.from === clientId) {
    return message.recipient_public_key
  }
  return message.sender_public_key
}

export async function decryptMessage(
  clientId: ClientID,
  message: EncryptedMessage
): Promise<DecryptedMessage | undefined> {
  // Need to gracefully handle the case where this DB doesn't contain this public
  // key
  const myPublicKey = getMyPublicKey(clientId, message)
  const theirPublicKey = getTheirPublicKey(clientId, message)
  const myKeyPair = await db.keyPairs.get({ box_public_key: myPublicKey })
  if (myKeyPair) {
    return {
      ...message,
      body: JSON.parse(
        await decryptMessageBody(
          message.body,
          message.nonce,
          theirPublicKey,
          myKeyPair.box_secret_key
        )
      ) as MessageBody
    }
  }
  return undefined
}

export async function storeAndRetrieveMessages(
  clientId: ClientID,
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

  // check if these messages have parents, and if so, update them accordingly
  await Promise.all(
    _.zipWith(messageInfos, messageBodies, (m1, m2) => ({ ...m1, ...m2 })).map(async message => {
      const decryptedMessage = await decryptMessage(clientId, message)
      if (decryptedMessage && decryptedMessage.body && decryptedMessage.body.parent) {
        addChildMessage(decryptedMessage.body.parent, decryptedMessage.hash)
      }
    })
  )

  return getMessagesWithoutBody(30, false, false)
}

export async function fetchMessages(
  credentials: ClientCredentials,
  sketch: string
): Promise<APIMessage[]> {
  const api = new API(credentials)
  return api.fetchMessages(sketch)
}
