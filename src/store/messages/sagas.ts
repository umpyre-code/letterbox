import sodium from 'libsodium-wrappers'
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
import { db } from '../../db/db'
import { BloomFilter } from '../../util/BloomFilter'
import { fetchBalanceRequest, fetchBalanceSuccess } from '../account/actions'
import { API } from '../api'
import { ApplicationState } from '../ApplicationState'
import { removeDraftRequest } from '../drafts/actions'
import { Draft } from '../drafts/types'
import { SettlePaymentResponse } from '../models/account'
import { ClientCredentials } from '../models/client'
import { APIMessage, MessageHash } from '../models/messages'
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
import { getMessagesWithoutBody, fetchMessages, decryptStoreAndRetrieveMessages } from './utils'

function* delayThenFetchMessages() {
  const fetchIntervalMillis = 2000
  yield delay(fetchIntervalMillis)
  yield put(fetchMessagesRequest())
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
  } catch (error) {
    if (error instanceof Error) {
      yield put(initializeMessagesError(error.stack))
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

// Message fetch main loop: this saga runs forever and ever
function* handleFetchMessages() {
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const { sketch } = state.messagesState
    const messages = yield call(fetchMessages, credentials, sketch)

    if (messages.error) {
      yield put(fetchMessagesError(messages.error))
    } else if (messages.length > 0) {
      const res = yield call(decryptStoreAndRetrieveMessages, messages)
      yield put(fetchMessagesSuccess(res))
      yield put(updateSketchRequest())
    }
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data && error.response.data.message) {
      yield put(fetchMessagesError(error.response.data.message))
    } else if (error.message) {
      yield put(fetchMessagesError(error.message))
    } else {
      yield put(fetchMessagesError(error))
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
  const draft: Draft = payload as Draft
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
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data && error.response.data.message) {
      yield put(sendMessagesError(error.response.data.message))
    } else if (error.message) {
      yield put(sendMessagesError(error.message))
    } else {
      yield put(sendMessagesError(error))
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
  return sodium.to_base64(bf.asBytes(), sodium.base64_variants.URLSAFE_NO_PADDING)
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
  }
  return Promise.resolve(undefined)
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
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      yield put(messageReadError(error.response.data.message))
    } else if (error.message) {
      yield put(messageReadError(error.message))
    } else {
      yield put(messageReadError(error))
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
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      yield put(deleteMessageError(error.response.data.message))
    } else if (error.message) {
      yield put(deleteMessageError(error.message))
    } else {
      yield put(deleteMessageError(error))
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
