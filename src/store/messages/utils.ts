import sodium from 'libsodium-wrappers'
import { KeyPair } from '../keyPairs/types'
import { ClientID } from '../models/client'
import { APIMessage, Message } from '../models/messages'

export function toApiMessage(message: Message, from: ClientID): APIMessage {
  return {
    ...message,
    body: message.body as string,
    from,
    received_at: undefined,
    sent_at: {
      nanos: (message.sent_at.getTime() % 1000) * 1e6,
      seconds: Math.floor(message.sent_at.getTime() / 1000)
    }
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
