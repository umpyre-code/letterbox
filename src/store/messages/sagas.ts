import { all, call, delay, fork, put, select, spawn, takeEvery } from 'redux-saga/effects'
import { ApplicationState } from '../'
import { API } from '../api'
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

async function initializeMessages() {
  return Array.from([
    {
      body: '# Welcome to Umpyre 🤗\nUmpyre is a messaging service.',
      created_at: new Date(),
      from: 'Umpyre',
      hash: 'lol',
      pda: 'Greetings',
      to: 'you'
    }
  ])
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
  yield put(fetchMessagesRequest())
}

function* watchInitializeMessagesRequest() {
  yield takeEvery(MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST, handleInitializeMessages)
}

function* delayThenFetchMessages() {
  const fetchIntervalMillis = 1500
  yield delay(fetchIntervalMillis)
  yield put(fetchMessagesRequest())
}

// Message fetch main loop: this saga runs forever and ever
function* handleFetchMessages() {
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(API.FETCH_MESSAGES, credentials)

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
  body: string,
  myPrivateKey: string,
  theirPublicKey: string
): Promise<string> {
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)
  const ciphertext = sodium.crypto_box_easy(
    body,
    nonce,
    sodium.from_base64(theirPublicKey, sodium.base64_variants.ORIGINAL_NO_PADDING),
    sodium.from_base64(myPrivateKey, sodium.base64_variants.ORIGINAL_NO_PADDING)
  )
  return sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL_NO_PADDING)
}

async function sendMessage(
  credentials: ClientCredentials,
  myPrivateKey: string,
  message: Message
): Promise<Message> {
  const api = new API(credentials)
  const recipientProfile: ClientProfile = await api.fetchClient(message.to)
  const encryptedMessage = {
    ...message,
    body: await encryptMessageBody(message.body, myPrivateKey, recipientProfile.public_key)
  }
  return api.sendMessage(encryptedMessage)
}

function* handleSendMessage(values: ReturnType<typeof sendMessageRequest>) {
  const { payload } = values
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const myPrivateKey = state.keysState.current_key!.private_key
    const res = yield call(sendMessage, credentials, myPrivateKey, payload)

    if (res.error) {
      yield put(sendMessageError(res.error))
    } else {
      yield put(sendMessageSuccess())
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
