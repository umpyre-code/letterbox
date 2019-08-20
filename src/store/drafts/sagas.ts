import { all, call, fork, put, select, takeEvery, throttle } from 'redux-saga/effects'
import { db } from '../../db/db'
import { API } from '../api'
import { ApplicationState } from '../ApplicationState'
import { KeyPair } from '../keys/types'
import { sendMessagesRequest } from '../messages/actions'
import { encryptMessageBody, hashMessage, signMessage, toApiMessage } from '../messages/utils'
import { ClientCredentials, ClientID, ClientProfile } from '../models/client'
import { APIMessage, MessageBase } from '../models/messages'
import {
  addDraftError,
  addDraftSuccess,
  initializeDraftsError,
  initializeDraftsSuccess,
  removeDraftError,
  removeDraftRequest,
  removeDraftSuccess,
  sendDraftError,
  sendDraftRequest,
  updateDraftError,
  updateDraftRequest,
  updateDraftSuccess
} from './actions'
import { Draft, DraftsActionTypes } from './types'

async function initializeDrafts(): Promise<Draft[]> {
  return db.drafts
    .orderBy('created_at')
    .reverse()
    .toArray()
}

function* handleInitializeDrafts() {
  try {
    const res = yield call(initializeDrafts)

    if (res.error) {
      yield put(initializeDraftsError(res.error))
    } else {
      yield put(initializeDraftsSuccess(res))
    }
  } catch (error) {
    if (error instanceof Error) {
      yield put(initializeDraftsError(error.stack!))
    } else {
      yield put(initializeDraftsError('An unknown error occured.'))
    }
  }
}

async function addDraft(): Promise<Draft[]> {
  db.drafts.add({
    created_at: new Date(),
    editorContent: undefined,
    pda: '',
    recipients: [],
    sending: false,
    value_cents: 0
  })
  return db.drafts
    .orderBy('created_at')
    .reverse()
    .toArray()
}

function* handleAddDraft() {
  try {
    const res = yield call(addDraft)

    if (res.error) {
      yield put(addDraftError(res.error))
    } else {
      yield put(addDraftSuccess(res))
    }
  } catch (error) {
    if (error instanceof Error) {
      yield put(addDraftError(error.stack!))
    } else {
      yield put(addDraftError('An unknown error occured.'))
    }
  }
}

async function removeDraft(draft: Draft): Promise<Draft[]> {
  db.drafts.delete(draft.id)
  return db.drafts
    .orderBy('created_at')
    .reverse()
    .toArray()
}

function* handleRemoveDraft(values: ReturnType<typeof removeDraftRequest>) {
  const { payload } = values
  try {
    const res = yield call(removeDraft, payload)

    if (res.error) {
      yield put(removeDraftError(res.error))
    } else {
      yield put(removeDraftSuccess(res))
    }
  } catch (error) {
    if (error instanceof Error) {
      yield put(removeDraftError(error.stack!))
    } else {
      yield put(removeDraftError('An unknown error occured.'))
    }
  }
}

async function updateDraft(draft: Draft) {
  await db.drafts.update(draft.id, draft)
  return db.drafts
    .orderBy('created_at')
    .reverse()
    .toArray()
}

function* handleUpdateDraft(values: ReturnType<typeof updateDraftRequest>) {
  const { payload } = values
  try {
    const res = yield call(updateDraft, payload)

    if (res.error) {
      yield put(updateDraftError(res.error))
    } else {
      yield put(updateDraftSuccess(res))
    }
  } catch (error) {
    if (error instanceof Error) {
      yield put(updateDraftError(error.stack!))
    } else {
      yield put(updateDraftError('An unknown error occured.'))
    }
  }
}

function* watchInitializeDraftsRequest() {
  yield takeEvery(DraftsActionTypes.INITIALIZE_DRAFTS_REQUEST, handleInitializeDrafts)
}

function* watchAddDraftRequest() {
  yield takeEvery(DraftsActionTypes.ADD_DRAFT_REQUEST, handleAddDraft)
}

function* watchRemoveDraftRequest() {
  yield takeEvery(DraftsActionTypes.REMOVE_DRAFT_REQUEST, handleRemoveDraft)
}

function* watchUpdateDraftRequest() {
  // Throttle this so we don't update too often
  yield throttle(500, DraftsActionTypes.UPDATE_DRAFT_REQUEST, handleUpdateDraft)
}

async function prepareMessage(
  credentials: ClientCredentials,
  keyPair: KeyPair,
  message: MessageBase,
  recipients: ClientID[]
): Promise<APIMessage[]> {
  const api = new API(credentials)
  const res = recipients.map(recipient => {
    async function inner(): Promise<APIMessage> {
      const recipientProfile: ClientProfile = await api.fetchClient(recipient)
      const apiMessage = toApiMessage({ ...message, to: recipient }, credentials.client_id)
      const encryptedMessage = await encryptMessageBody(
        apiMessage,
        keyPair,
        recipientProfile.box_public_key
      )
      const hashedMessage = await hashMessage(encryptedMessage)
      return signMessage(hashedMessage, keyPair)
    }
    return inner()
  })

  return Promise.all(res)
}

function* handleSendDraft(values: ReturnType<typeof sendDraftRequest>) {
  const { payload } = values
  const draft: Draft = payload
  const { message } = draft
  try {
    const state: ApplicationState = yield select()
    const credentials = state.clientState.credentials!
    const res = yield call(
      prepareMessage,
      credentials,
      state.keysState.current_key!,
      message!,
      draft.recipients
    )

    if (res.error) {
      yield put(sendDraftError(res.error))
    } else {
      // Save the message to the DB
      const apiMessages: APIMessage[] = res
      const draftToSend: Draft = { ...draft, apiMessages }

      // Trigger send loop
      yield put(sendMessagesRequest(draftToSend))
    }
  } catch (error) {
    console.log(error)
    if (error instanceof Error) {
      yield put(sendDraftError(error.stack!))
    } else {
      yield put(sendDraftError('An unknown error occured.'))
    }
  }
}

function* watchSendDraftRequest() {
  yield takeEvery(DraftsActionTypes.SEND_DRAFT_REQUEST, handleSendDraft)
}

export function* sagas() {
  yield all([
    fork(watchAddDraftRequest),
    fork(watchInitializeDraftsRequest),
    fork(watchRemoveDraftRequest),
    fork(watchSendDraftRequest),
    fork(watchUpdateDraftRequest)
  ])
}
