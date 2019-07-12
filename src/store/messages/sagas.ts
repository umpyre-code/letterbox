import { all, call, delay, fork, put, select, spawn, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from '../'
import { db } from '../../db/db'
import { BloomFilter } from '../../util/BloomFilter'
import { API } from '../api'
import { removeDraftRequest } from '../drafts/actions'
import { KeyPair } from '../keyPairs/types'
import { ClientCredentials, ClientID, ClientProfile } from '../models/client'
import { APIMessage, Message } from '../models/messages'
import {
  fetchMessagesError,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  initializeMessagesError,
  initializeMessagesSuccess,
  sendMessageError,
  sendMessageRequest,
  sendMessageSuccess
} from './actions'
import { MessagesActionTypes } from './types'

async function getAllMessages(): Promise<Message[]> {
  return db.messages
    .orderBy('received_at')
    .reverse()
    .toArray()
}

function* handleInitializeMessages() {
  try {
    const res = yield call(getAllMessages)

    if (res.error) {
      yield put(initializeMessagesError(res.error))
    } else {
      yield put(initializeMessagesSuccess(res))
    }
  } catch (err) {
    if (err instanceof Error) {
      yield put(initializeMessagesError(err.stack!))
    } else {
      yield put(initializeMessagesError('An unknown error occured.'))
    }
  }

  // Start message fetch loop
  yield spawn(delayThenFetchMessages)
}

function* watchInitializeMessagesRequest() {
  yield takeEvery(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST, handleInitializeMessages)
}

function* delayThenFetchMessages() {
  const fetchIntervalMillis = 1500
  yield delay(fetchIntervalMillis)
  yield put(fetchMessagesRequest())
}

async function getAllMessagesInLast30Days(): Promise<Message[]> {
  const nowMinus30Days = new Date()
  nowMinus30Days.setDate(nowMinus30Days.getDate() - 30)

  return db.messages
    .orderBy('received_at')
    .reverse()
    .filter(message => {
      return message.received_at! >= nowMinus30Days
    })
    .toArray()
}

async function calculateMessageSketch(): Promise<string> {
  const messagesFromLast30days = await getAllMessagesInLast30Days()

  // Construct bloom filter
  const bf = new BloomFilter()
  messagesFromLast30days.forEach(message => bf.add(message.hash!))

  await sodium.ready
  return sodium.to_base64(bf.as_bytes(), sodium.base64_variants.ORIGINAL_NO_PADDING)
}

async function fetchMessages(credentials: ClientCredentials) {
  const api = new API(credentials)
  const sketch = await calculateMessageSketch()
  const messages = await api.fetchMessages(sketch)
  const decryptedMessages = await Promise.all(
    messages.map((message: Message) => decryptMessage(message))
  )
  await db.messages.bulkPut(decryptedMessages)
  return db.messages
    .orderBy('received_at')
    .reverse()
    .toArray()
}

async function decryptMessage(message: Message): Promise<Message> {
  // Need to gracefully handle the case where this DB doesn't contain this public
  // key
  const myKeyPair = await db.keyPairs.get({ box_public_key: message.recipient_public_key })
  return {
    ...message,
    body: await decryptMessageBody(
      message.body,
      message.nonce,
      myKeyPair!.box_secret_key,
      message.sender_public_key
    )
  }
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
      sodium.from_base64(body, sodium.base64_variants.ORIGINAL_NO_PADDING),
      sodium.from_base64(nonce, sodium.base64_variants.ORIGINAL_NO_PADDING),
      sodium.from_base64(theirPublicKey, sodium.base64_variants.ORIGINAL_NO_PADDING),
      sodium.from_base64(myPrivateKey, sodium.base64_variants.ORIGINAL_NO_PADDING)
    )
  )
}

// Message fetch main loop: this saga runs forever and ever
function* handleFetchMessages() {
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(fetchMessages, credentials)

    if (res.error) {
      yield put(fetchMessagesError(res.error))
    } else {
      yield put(fetchMessagesSuccess(res))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(fetchMessagesError(err.response.data.message))
    } else if (err.message) {
      yield put(fetchMessagesError(err.message))
    } else {
      yield put(fetchMessagesError(err))
    }
  }
  yield spawn(delayThenFetchMessages)
}

function* watchFetchMessagesRequest() {
  yield takeEvery(MessagesActionTypes.FETCH_MESSAGES_REQUEST, handleFetchMessages)
}

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

function toApiMessage(message: Message, from: ClientID): APIMessage {
  return {
    ...message,
    from,
    received_at: undefined,
    sent_at: {
      nanos: (message.sent_at.getTime() % 1000) * 1e6,
      seconds: Math.floor(message.sent_at.getTime() / 1000)
    }
  }
}

async function encryptMessageBody(
  message: APIMessage,
  keyPair: KeyPair,
  theirPublicKey: string
): Promise<APIMessage> {
  await sodium.ready
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)
  const ciphertext = sodium.crypto_box_easy(
    sodium.from_string(message.body),
    nonce,
    sodium.from_base64(theirPublicKey, sodium.base64_variants.ORIGINAL_NO_PADDING),
    sodium.from_base64(keyPair.box_secret_key, sodium.base64_variants.ORIGINAL_NO_PADDING)
  )
  return {
    ...message,
    body: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL_NO_PADDING),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL_NO_PADDING),
    recipient_public_key: theirPublicKey,
    sender_public_key: keyPair.box_public_key
  }
}

async function hashMessage(message: APIMessage): Promise<APIMessage> {
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
  })
  const hash = sodium.to_base64(
    sodium.crypto_generichash(32, sodium.from_string(hashableMessageJson)),
    sodium.base64_variants.ORIGINAL_NO_PADDING
  )

  return {
    ...message,
    hash
  }
}

async function signMessage(message: APIMessage, keyPair: KeyPair): Promise<APIMessage> {
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
      sodium.from_base64(keyPair.signing_secret_key, sodium.base64_variants.ORIGINAL_NO_PADDING)
    ),
    sodium.base64_variants.ORIGINAL_NO_PADDING
  )

  return {
    ...message,
    signature
  }
}

async function sendMessage(
  credentials: ClientCredentials,
  keyPair: KeyPair,
  message: Message
): Promise<Message> {
  const api = new API(credentials)
  const recipientProfile: ClientProfile = await api.fetchClient(message.to)
  const apiMessage = toApiMessage(message, credentials.client_id)
  const encryptedMessage = await encryptMessageBody(
    apiMessage,
    keyPair,
    recipientProfile.box_public_key
  )
  const hashedMessage = await hashMessage(encryptedMessage)
  const signedMessage = await signMessage(hashedMessage, keyPair)

  return api.sendMessage(signedMessage)
}

function* handleSendMessage(values: ReturnType<typeof sendMessageRequest>) {
  const { payload } = values
  const { message, draft } = payload
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(sendMessage, credentials, state.keysState.current_key!, message)

    if (res.error) {
      yield put(sendMessageError(res.error))
      yield put(removeDraftRequest({ ...draft, sending: false }))
    } else {
      yield put(sendMessageSuccess())
      yield put(removeDraftRequest(draft))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(sendMessageError(err.response.data.message))
    } else if (err.message) {
      yield put(sendMessageError(err.message))
    } else {
      yield put(sendMessageError(err))
    }
  }
}

function* watchSendMessageRequest() {
  yield takeEvery(MessagesActionTypes.SEND_MESSAGE_REQUEST, handleSendMessage)
}

export function* sagas() {
  yield all([
    fork(watchInitializeMessagesRequest),
    fork(watchFetchMessagesRequest),
    fork(watchSendMessageRequest)
  ])
}
