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
import { API } from '../api'
import { removeDraftRequest } from '../drafts/actions'
import { Draft } from '../drafts/types'
import { ClientCredentials } from '../models/client'
import { APIMessage, Message } from '../models/messages'
import {
  fetchMessagesError,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  initializeMessagesError,
  initializeMessagesSuccess,
  sendMessageError,
  sendMessageRequest,
  sendMessageSuccess,
  updateSketchRequest,
  updateSketchSuccess
} from './actions'
import { MessagesActionTypes } from './types'

// This doesn't work unless we use the old-style of import. I gave up trying to
// figure out why.
// tslint:disable-next-line
const sodium = require('libsodium-wrappers')

async function getAllMessages(): Promise<Message[]> {
  return db.messages
    .orderBy('received_at')
    .reverse()
    .toArray()
}

function* handleInitializeMessages() {
  try {
    // Update message sketch first
    yield put(updateSketchRequest())
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
  const fetchIntervalMillis = 2000
  yield delay(fetchIntervalMillis)
  yield put(fetchMessagesRequest())
}

async function fetchMessages(credentials: ClientCredentials, sketch: string) {
  const api = new API(credentials)
  return api.fetchMessages(sketch)
}

async function decryptStoreAndRetrieveMessages(messages: Message[]) {
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

async function sendMessage(
  credentials: ClientCredentials,
  apiMessage: APIMessage
): Promise<Message> {
  const api = new API(credentials)
  return api.sendMessage(apiMessage)
}

function* handleSendMessage(values: ReturnType<typeof sendMessageRequest>) {
  const { payload } = values
  const draft: Draft = payload
  const { apiMessage } = draft
  try {
    console.log(draft)
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(sendMessage, credentials, apiMessage!)
    console.log(res)

    if (res.error) {
      yield put(sendMessageError(res.error))
      yield put(removeDraftRequest({ ...draft, sending: false }))
    } else {
      yield put(sendMessageSuccess())
      yield put(removeDraftRequest(draft))
    }
  } catch (err) {
    console.log(err)
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

async function getAllMessagesInLast31Days(): Promise<Message[]> {
  const nowMinus31Days = new Date()
  nowMinus31Days.setDate(nowMinus31Days.getDate() - 31)

  return db.messages
    .orderBy('received_at')
    .reverse()
    .filter(message => {
      return message.received_at! >= nowMinus31Days
    })
    .toArray()
}

async function calculateMessageSketch(): Promise<string> {
  const messagesFromLast30days = await getAllMessagesInLast31Days()

  // Construct bloom filter
  const bf = new BloomFilter()
  messagesFromLast30days.forEach(message => bf.add(message.hash!))

  await sodium.ready
  return sodium.to_base64(bf.as_bytes(), sodium.base64_variants.ORIGINAL_NO_PADDING)
}

function* handleUpdateSketch(values: ReturnType<typeof updateSketchRequest>) {
  const sketch = yield call(calculateMessageSketch)
  yield put(updateSketchSuccess(sketch))
}

function* watchUpdateSketchRequest() {
  yield takeLatest(MessagesActionTypes.UPDATE_SKETCH_REQUEST, handleUpdateSketch)
}

export function* sagas() {
  yield all([
    fork(watchInitializeMessagesRequest),
    fork(watchFetchMessagesRequest),
    fork(watchSendMessageRequest),
    fork(watchUpdateSketchRequest)
  ])
}
