import { all, call, delay, fork, put, select, spawn, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from '../'
import { db } from '../../db/db'
import { API } from '../api'
import { KeyPair } from '../keyPairs/types'
import { ClientCredentials, ClientProfile } from '../models/client'
import { Message } from '../models/messages'
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
import { removeDraftRequest } from '../drafts/actions'

async function initializeMessages(): Promise<Message[]> {
  return db.messages
    .orderBy('received_at')
    .reverse()
    .toArray()
}

function* handleInitializeMessages() {
  try {
    const res = yield call(initializeMessages)

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

async function fetchMessages(credentials: ClientCredentials) {
  const api = new API(credentials)
  const messages = await api.fetchMessages()
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
  const myKeyPair = await db.keyPairs.get({ public_key: message.recipient_public_key })
  return {
    ...message,
    body: await decryptMessageBody(
      message.body,
      message.nonce,
      myKeyPair!.private_key,
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

async function encryptMessageBody(
  message: Message,
  keyPair: KeyPair,
  theirPublicKey: string
): Promise<Message> {
  await sodium.ready
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)
  const ciphertext = sodium.crypto_box_easy(
    sodium.from_string(message.body),
    nonce,
    sodium.from_base64(theirPublicKey, sodium.base64_variants.ORIGINAL_NO_PADDING),
    sodium.from_base64(keyPair.private_key, sodium.base64_variants.ORIGINAL_NO_PADDING)
  )
  return {
    ...message,
    body: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL_NO_PADDING),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL_NO_PADDING),
    recipient_public_key: theirPublicKey,
    sender_public_key: keyPair.public_key
  }
}

async function sendMessage(
  credentials: ClientCredentials,
  keyPair: KeyPair,
  message: Message
): Promise<Message> {
  const api = new API(credentials)
  const recipientProfile: ClientProfile = await api.fetchClient(message.to)
  const encryptedMessage = await encryptMessageBody(message, keyPair, recipientProfile.public_key)

  return api.sendMessage(encryptedMessage)
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
