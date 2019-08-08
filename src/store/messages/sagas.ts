import {
  all,
  call,
  delay,
  fork,
  put,
  select,
  spawn,
  takeEvery,
  takeLatest
} from 'redux-saga/effects'
import { ApplicationState } from '../'
import { db } from '../../db/db'
import { BloomFilter } from '../../util/BloomFilter'
import { fetchBalanceRequest, fetchBalanceSuccess } from '../account/actions'
import { API } from '../api'
import { removeDraftRequest } from '../drafts/actions'
import { Draft } from '../drafts/types'
import { SettlePaymentResponse } from '../models/account'
import { ClientCredentials } from '../models/client'
import { APIMessage, fromApiMessage, Message, MessageBody, MessageHash } from '../models/messages'
import {
  deleteMessageError,
  deleteMessageRequest,
  deleteMessageSuccess,
  fetchMessagesError,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  initializeMessagesError,
  initializeMessagesSuccess,
  messageReadError,
  messageReadRequest,
  messageReadSuccess,
  sendMessagesError,
  sendMessagesRequest,
  sendMessagesSuccess,
  updateSketchRequest,
  updateSketchSuccess
} from './actions'
import { MessagesActionTypes } from './types'

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

async function getMessagesWithoutBody(
  withinDays: number,
  includeDeleted: boolean
): Promise<Message[]> {
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

function* handleInitializeMessages() {
  try {
    // Update message sketch first
    yield put(updateSketchRequest())
    const res = yield call(getMessagesWithoutBody, 30, false)

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
  const fetchIntervalMillis = 2000
  yield delay(fetchIntervalMillis)
  yield put(fetchMessagesRequest())
}

async function decryptStoreAndRetrieveMessages(messages: APIMessage[]) {
  const decryptedMessages = await Promise.all(
    messages.map((message: APIMessage) => decryptMessage(message))
  )
  const messageBodies = decryptedMessages.map(message => ({
    body: message.body!,
    hash: message.hash!
  }))
  const messageInfos = decryptedMessages.map(message => ({
    ...message,
    body: undefined
  }))
  await db.transaction('rw', db.messageInfos, db.messageBodies, async () => {
    await db.messageInfos.bulkAdd(messageInfos)
    await db.messageBodies.bulkAdd(messageBodies)
  })
  return getMessagesWithoutBody(30, false)
}

async function decryptMessage(message: APIMessage): Promise<Message> {
  // Need to gracefully handle the case where this DB doesn't contain this public
  // key
  const myKeyPair = await db.keyPairs.get({ box_public_key: message.recipient_public_key })
  return {
    ...fromApiMessage(message),
    body: JSON.parse(
      await decryptMessageBody(
        message.body,
        message.nonce,
        myKeyPair!.box_secret_key,
        message.sender_public_key
      )
    ) as MessageBody
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
      sodium.from_base64(body, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(nonce, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(theirPublicKey, sodium.base64_variants.URLSAFE_NO_PADDING),
      sodium.from_base64(myPrivateKey, sodium.base64_variants.URLSAFE_NO_PADDING)
    )
  )
}

async function fetchMessages(
  credentials: ClientCredentials,
  sketch: string
): Promise<APIMessage[]> {
  const api = new API(credentials)
  return api.fetchMessages(sketch)
}

// Message fetch main loop: this saga runs forever and ever
function* handleFetchMessages() {
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const sketch = state.messagesState.sketch
    const messages = yield call(fetchMessages, credentials, sketch)

    if (messages.error) {
      yield put(fetchMessagesError(messages.error))
    } else if (messages.length > 0) {
      yield put(updateSketchRequest())
      const res = yield call(decryptStoreAndRetrieveMessages, messages)
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

async function sendMessages(
  credentials: ClientCredentials,
  apiMessages: APIMessage[]
): Promise<APIMessage[]> {
  const api = new API(credentials)
  return api.sendMessages(apiMessages)
}

function* handleSendMessages(values: ReturnType<typeof sendMessagesRequest>) {
  const { payload } = values
  const draft: Draft = payload
  const { apiMessages } = draft
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(sendMessages, credentials, apiMessages!)

    if (res.error) {
      yield put(sendMessagesError(res.error))
      yield put(removeDraftRequest({ ...draft, sending: false }))
    } else {
      yield put(sendMessagesSuccess())
      yield put(removeDraftRequest(draft))
      yield put(fetchBalanceRequest())
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(sendMessagesError(err.response.data.message))
    } else if (err.message) {
      yield put(sendMessagesError(err.message))
    } else {
      yield put(sendMessagesError(err))
    }
  }
}

function* watchSendMessagesRequest() {
  yield takeEvery(MessagesActionTypes.SEND_MESSAGES_REQUEST, handleSendMessages)
}

async function calculateMessageSketch(): Promise<string> {
  const messagesFromLast31days = await getMessagesWithoutBody(31, true)

  // Construct bloom filter
  const bf = new BloomFilter()
  messagesFromLast31days.forEach(message => bf.add(message.hash!))

  await sodium.ready
  return sodium.to_base64(bf.as_bytes(), sodium.base64_variants.URLSAFE_NO_PADDING)
}

function* handleUpdateSketch(values: ReturnType<typeof updateSketchRequest>) {
  const sketch = yield call(calculateMessageSketch)
  yield put(updateSketchSuccess(sketch))
}

function* watchUpdateSketchRequest() {
  yield takeLatest(MessagesActionTypes.UPDATE_SKETCH_REQUEST, handleUpdateSketch)
}

async function settlePayment(
  credentials: ClientCredentials,
  hash: MessageHash
): Promise<SettlePaymentResponse | undefined> {
  // fetch the message first, check if the value is >0
  const message = await db.messageInfos.get(hash)
  if (message && message.value_cents > 0) {
    const api = new API(credentials)
    return api.settlePayment(hash)
  } else {
    return Promise.resolve(undefined)
  }
}

async function markMessageAsRead(hash: MessageHash) {
  return db.messageInfos.update(hash, { read: true })
}

// Message fetch main loop: this saga runs forever and ever
function* handleMessageRead(values: ReturnType<typeof messageReadRequest>) {
  const { payload } = values
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(settlePayment, credentials, payload)

    if (res && res.error) {
      yield put(messageReadError(res.error))
    } else if (res) {
      yield put(fetchBalanceSuccess(res.balance))
    }

    // No result from settlePayment() just means the message was $0, so there's no need to hit the
    // API.
    yield call(markMessageAsRead, payload)
    // Reload messages from DB
    const messages = yield call(getMessagesWithoutBody, 30, false)
    yield put(messageReadSuccess(messages))
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(messageReadError(err.response.data.message))
    } else if (err.message) {
      yield put(messageReadError(err.message))
    } else {
      yield put(messageReadError(err))
    }
  }
}

function* watchMessageReadRequest() {
  yield takeEvery(MessagesActionTypes.MESSAGE_READ_REQUEST, handleMessageRead)
}

async function markMessageDeleted(hash: MessageHash) {
  await db.messageBodies.delete(hash)
  await db.messageInfos.update(hash, { deleted: true })
  return getMessagesWithoutBody(30, false)
}

function* handleDeleteMessage(values: ReturnType<typeof deleteMessageRequest>) {
  const { payload } = values
  try {
    const state: ApplicationState = yield select()
    const res = yield call(markMessageDeleted, payload)

    if (res.error) {
      yield put(deleteMessageError(res.error))
    } else {
      yield put(deleteMessageSuccess(res))
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      yield put(deleteMessageError(err.response.data.message))
    } else if (err.message) {
      yield put(deleteMessageError(err.message))
    } else {
      yield put(deleteMessageError(err))
    }
  }
}

function* watchDeleteMessageRequest() {
  yield takeEvery(MessagesActionTypes.DELETE_MESSAGE_REQUEST, handleDeleteMessage)
}

export function* sagas() {
  yield all([
    fork(watchDeleteMessageRequest),
    fork(watchFetchMessagesRequest),
    fork(watchInitializeMessagesRequest),
    fork(watchMessageReadRequest),
    fork(watchSendMessagesRequest),
    fork(watchUpdateSketchRequest)
  ])
}
