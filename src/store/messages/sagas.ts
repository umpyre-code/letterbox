import * as Immutable from 'immutable'
import sodium from 'libsodium-wrappers'
import _ from 'lodash'
import {
  all,
  call,
  delay,
  fork,
  put,
  putResolve,
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
import { removeDraftRequest, updateDraftRequest } from '../drafts/actions'
import { Draft } from '../drafts/types'
import { KeyPair } from '../keys/types'
import { SettlePaymentResponse } from '../models/account'
import { ClientCredentials, ClientID } from '../models/client'
import { APIMessage, DecryptedMessage, MessageBase, MessageHash } from '../models/messages'
import {
  deleteMessageError,
  deleteMessageRequest,
  deleteMessageSuccess,
  deleteSweepError,
  deleteSweepSuccess,
  fetchMessagesError,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  initializeMessagesError,
  initializeMessagesSuccess,
  loadMessagesError,
  loadMessagesRequest,
  loadMessagesSuccess,
  messageReadError,
  messageReadRequest,
  messageReadSuccess,
  sendMessagesError,
  sendMessagesRequest,
  sendMessagesSuccess,
  updateSketchRequest,
  updateSketchSuccess
} from './actions'
import { MessagesActionTypes, RankedMessages } from './types'
import {
  addChildMessageInDb,
  decryptMessage,
  fetchMessages,
  getMessagesWithoutBody,
  storeAndRetrieveMessages,
  systemMessageReadFor,
  systemMessageDeletedFor
} from './utils'

function* delayThenFetchMessages() {
  const fetchIntervalMillis = 3000
  yield delay(fetchIntervalMillis)
  yield put(fetchMessagesRequest())
}

function cmpByValue(first: MessageBase, second: MessageBase): number {
  if (first.value_cents > second.value_cents) {
    return -1
  }
  if (second.value_cents > first.value_cents) {
    return 1
  }
  if (first.received_at > second.received_at) {
    return -1
  }
  if (second.received_at > first.received_at) {
    return 1
  }
  return 0
}

function rankMessages(clientId: ClientID, messages: MessageBase[]): RankedMessages {
  const unreadMessages = _.chain(messages)
    .filter(message => message.read === false && message.to === clientId)
    .groupBy(message => message.thread || [message.to, message.from].sort().join() + message.pda)
    .map(messageDict => {
      // compute the sum of message values, where the recipient is this client
      const valueCents = _.chain(messageDict)
        .filter(message => message.to === clientId)
        .sumBy('value_cents')
        .value()
      const topMessage = _.chain(messageDict)
        .maxBy('received_at') // show only most recent in thread
        .value()
      return { ...topMessage, value_cents: valueCents }
    })
    .sort(cmpByValue)
    .take(5)
    .value()

  const unreadHashes = new Set(_.map(unreadMessages, 'hash'))

  const readMessages = _.chain(messages)
    .filter(
      message => message.from === clientId || (message.read === true && message.to === clientId)
    )
    .groupBy(message => message.thread || [message.to, message.from].sort().join() + message.pda)
    .map(messageDict => {
      // compute the sum of message values, where the recipient is this client
      const valueCents = _.chain(messageDict)
        .filter(message => message.to === clientId)
        .sumBy('value_cents')
        .value()
      const topMessage = _.chain(messageDict)
        .maxBy('received_at') // show only most recent in thread
        .value()
      return { ...topMessage, value_cents: valueCents }
    })
    .sortBy(['received_at'])
    .reverse()
    .filter(
      // Filter out threads which have unread children from above
      m => !m.children || m.children.find(childHash => unreadHashes.has(childHash)) === undefined
    )
    .take(7)
    .value()
  return { unreadMessages, readMessages }
}

function* handleInitializeMessages() {
  try {
    // Update message sketch first
    yield putResolve(updateSketchRequest())
    const res = yield call(getMessagesWithoutBody, 30, false, false, false)

    if (res.error) {
      yield put(initializeMessagesError(res.error))
    } else {
      const state: ApplicationState = yield select()
      const clientId = state.clientState.credentials.client_id

      const rankedMessages = rankMessages(clientId, res)
      yield put(initializeMessagesSuccess(rankedMessages))
    }
  } catch (error) {
    console.error(error)
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
    const { credentials } = state.clientState
    const { sketch } = state.messagesState
    const messages = yield call(fetchMessages, credentials, sketch)

    if (messages.error) {
      yield put(fetchMessagesError(messages.error))
    } else if (messages.length > 0) {
      const clientId = state.clientState.credentials.client_id

      const res = yield call(storeAndRetrieveMessages, credentials.client_id, messages)
      const rankedMessages = rankMessages(clientId, res)
      yield put(fetchMessagesSuccess(rankedMessages))
      yield put(updateSketchRequest())
    }
  } catch (error) {
    console.error(error)
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
  yield takeLatest(MessagesActionTypes.FETCH_MESSAGES_REQUEST, handleFetchMessages)
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
    const { credentials } = state.clientState
    const res = yield call(sendMessages, credentials, apiMessages)

    if (res.error) {
      yield put(sendMessagesError(res.error))
      yield put(updateDraftRequest({ ...draft, sending: false, sendError: res.error }))
    } else {
      const storedMessages = yield call(storeAndRetrieveMessages, credentials.client_id, res)
      const rankedMessages = rankMessages(credentials.client_id, storedMessages)
      yield put(sendMessagesSuccess(rankedMessages))
      yield put(removeDraftRequest(draft))
      yield put(fetchBalanceRequest())
      // reload messages if this was sent in reply to another
      if (draft.inReplyTo) {
        yield put(loadMessagesRequest(draft.inReplyTo))
      }
    }
  } catch (error) {
    console.error(error)
    if (error.response && error.response.data && error.response.data.message) {
      yield put(
        updateDraftRequest({ ...draft, sending: false, sendError: error.response.data.message })
      )
      yield put(sendMessagesError(error.response.data.message))
    } else if (error.message) {
      yield put(sendMessagesError(error.message))
      yield put(updateDraftRequest({ ...draft, sending: false, sendError: error.message }))
    } else {
      yield put(sendMessagesError(error))
      yield put(updateDraftRequest({ ...draft, sending: false, sendError: error }))
    }
  }
}

function* watchSendMessagesRequest() {
  yield takeEvery(MessagesActionTypes.SEND_MESSAGES_REQUEST, handleSendMessages)
}

async function calculateMessageSketch(): Promise<string> {
  const messagesFromLast31days = await getMessagesWithoutBody(31, true, true, true)

  // Construct bloom filter
  const bf = new BloomFilter()
  messagesFromLast31days.forEach(message => bf.add(message.hash))

  await sodium.ready
  return sodium.to_base64(bf.asBytes(), sodium.base64_variants.URLSAFE_NO_PADDING)
}

function* handleUpdateSketch() {
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
  if (message && message.to === credentials.client_id && message.value_cents > 0) {
    const api = new API(credentials)
    return api.settlePayment(hash)
  }
  return Promise.resolve(undefined)
}

async function markMessageAsRead(hash: MessageHash) {
  return db.messageInfos.update(hash, { read: true })
}

function* handleMessageReadSuccess(payload: string, state: ApplicationState) {
  // No result from settlePayment() just means the message was $0, so there's no need to hit the
  // API.
  yield call(markMessageAsRead, payload)

  // Reload messages from DB
  const messages = yield call(getMessagesWithoutBody, 30, false, false, false)
  const clientId = state.clientState.credentials.client_id

  const rankedMessages = rankMessages(clientId, messages)
  yield put(messageReadSuccess(rankedMessages))
}

function* handleMessageRead(values: ReturnType<typeof messageReadRequest>) {
  const { payload } = values
  const state: ApplicationState = yield select()
  try {
    const { credentials } = state.clientState
    const res = yield call(settlePayment, credentials, payload)

    if (res && res.error) {
      yield put(messageReadError(res.error))
    } else if (res) {
      yield put(fetchBalanceSuccess(res.balance))
    }

    // send system message to mark this message as read
    const messages = yield call(systemMessageReadFor, credentials, state.keysState.current_key, [
      payload
    ])
    yield call(sendMessages, credentials, messages)

    yield handleMessageReadSuccess(payload, state)
  } catch (error) {
    console.error(error)
    if (error.response && error.response.status === 400) {
      // Not really an error, this just means it was already read.
      yield handleMessageReadSuccess(payload, state)
    } else if (error.response && error.response.data && error.response.data.message) {
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

async function markMessageDeleted(hash: MessageHash): Promise<number> {
  await db.messageBodies.delete(hash)
  return db.messageInfos.update(hash, { deleted: true })
}

async function markMessageDeletedAndFetch(
  credentials: ClientCredentials,
  keyPair: KeyPair,
  hash: MessageHash
): Promise<MessageBase[]> {
  await markMessageDeleted(hash)

  // send system message to mark this message as deleted
  const messages = await systemMessageDeletedFor(credentials, keyPair, [hash])
  await sendMessages(credentials, messages)

  return getMessagesWithoutBody(30, false, false, false)
}

function* handleDeleteMessage(values: ReturnType<typeof deleteMessageRequest>) {
  const { payload } = values
  try {
    const state: ApplicationState = yield select()
    const res = yield call(
      markMessageDeletedAndFetch,
      state.clientState.credentials,
      state.keysState.current_key,
      payload
    )

    if (res.error) {
      yield put(deleteMessageError(res.error))
    } else {
      const clientId = state.clientState.credentials.client_id
      const rankedMessages = rankMessages(clientId, res)
      yield put(deleteMessageSuccess(rankedMessages))
    }
  } catch (error) {
    console.error(error)
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

async function deleteSweep(
  credentials: ClientCredentials,
  keyPair: KeyPair,
  clientId: ClientID
): Promise<MessageBase[]> {
  const messages = await getMessagesWithoutBody(30, false, false, false)
  const unreadMessages = _.filter(
    messages,
    message => message.read === false && message.to === clientId
  )
  await Promise.all(_.map(unreadMessages, async m => markMessageDeleted(m.hash)))

  // send system message to mark these messages as deleted
  const systemMessages = await systemMessageDeletedFor(
    credentials,
    keyPair,
    _.map(unreadMessages, m => m.hash)
  )
  sendMessages(credentials, systemMessages)

  return getMessagesWithoutBody(30, false, false, false)
}

function* handleSweepMessage() {
  try {
    const state: ApplicationState = yield select()
    const clientId = state.clientState.credentials.client_id
    const res = yield call(
      deleteSweep,
      state.clientState.credentials,
      state.keysState.current_key,
      clientId
    )

    if (res.error) {
      yield put(deleteSweepError(res.error))
    } else {
      const rankedMessages = rankMessages(clientId, res)
      yield put(deleteSweepSuccess(rankedMessages))
    }
  } catch (error) {
    console.error(error)
    if (error.response && error.response.data && error.response.data.message) {
      yield put(deleteSweepError(error.response.data.message))
    } else if (error.message) {
      yield put(deleteSweepError(error.message))
    } else {
      yield put(deleteSweepError(error))
    }
  }
}

function* watchDeleteSweepRequest() {
  yield takeEvery(MessagesActionTypes.DELETE_SWEEP_REQUEST, handleSweepMessage)
}

async function loadMessages(
  clientId: ClientID,
  hash: MessageHash,
  messages: Immutable.Map<MessageHash, DecryptedMessage>,
  child?: MessageBase
): Promise<Immutable.Map<MessageHash, DecryptedMessage>> {
  if (hash !== null && hash !== undefined) {
    // double check that the hash is valid
    if (messages.has(hash)) {
      const messageInfo = await db.messageInfos.get({ hash })
      if (
        messageInfo &&
        child &&
        (!messageInfo.children || !messageInfo.children.includes(child.hash))
      ) {
        await addChildMessageInDb(messageInfo.hash, child.hash)
      }
      return Promise.resolve(messages)
    }
    const messageInfo = await db.messageInfos.get({ hash })
    const messageBody = await db.messageBodies.get({ hash })
    const decryptedMessage = await decryptMessage(clientId, {
      ...messageInfo,
      ...messageBody
    })

    // Check if we're actually able to decrypt this message
    if (decryptedMessage) {
      // Using asMutable() is less preferable, but the alternative is some very
      // messy code.
      let map = messages.asMutable()
      map.set(decryptedMessage.hash, decryptedMessage)

      if (decryptedMessage.children) {
        await Promise.all(
          decryptedMessage.children.map(async childHash => {
            map = map.merge(await loadMessages(clientId, childHash, map.asImmutable(), undefined))
            Promise.resolve(true)
          })
        )
      }

      if (child && (!messageInfo.children || !messageInfo.children.includes(child.hash))) {
        await addChildMessageInDb(messageInfo.hash, child.hash)
      }

      if (decryptedMessage.body.parent) {
        return loadMessages(
          clientId,
          decryptedMessage.body.parent,
          map.asImmutable(),
          decryptedMessage
        )
      }
      return Promise.resolve(map.asImmutable())
    }
  }
  return Promise.resolve(messages)
}

function* handleLoadMessages(values: ReturnType<typeof loadMessagesRequest>) {
  const { payload } = values
  try {
    const state: ApplicationState = yield select()
    const clientId = state.clientState.credentials.client_id
    const res = yield call(
      loadMessages,
      clientId,
      payload,
      Immutable.Map<MessageHash, DecryptedMessage>()
    )

    if (res.error) {
      console.error(res.error)
      yield put(loadMessagesError(res.error))
    } else {
      const messageArray = _.chain(res.valueSeq().toArray())
        .sortBy(['received_at'])
        .value()
      yield put(loadMessagesSuccess(messageArray))
    }
  } catch (error) {
    console.error(error)
    if (error.response && error.response.data && error.response.data.message) {
      yield put(loadMessagesError(error.response.data.message))
    } else if (error.message) {
      yield put(loadMessagesError(error.message))
    } else {
      yield put(loadMessagesError(error))
    }
  }
}

function* watchLoadMessagesRequest() {
  yield takeLatest(MessagesActionTypes.LOAD_MESSAGES_REQUEST, handleLoadMessages)
}

export function* sagas() {
  yield all([
    fork(watchDeleteMessageRequest),
    fork(watchDeleteSweepRequest),
    fork(watchFetchMessagesRequest),
    fork(watchInitializeMessagesRequest),
    fork(watchLoadMessagesRequest),
    fork(watchMessageReadRequest),
    fork(watchSendMessagesRequest),
    fork(watchUpdateSketchRequest)
  ])
}
