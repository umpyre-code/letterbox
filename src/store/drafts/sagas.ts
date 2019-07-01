import { all, call, fork, put, takeEvery, throttle } from 'redux-saga/effects'
import { db } from '../../db/db'
import {
  addDraftError,
  addDraftSuccess,
  initializeDraftsError,
  initializeDraftsSuccess,
  removeDraftError,
  removeDraftRequest,
  removeDraftSuccess,
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
  } catch (err) {
    if (err instanceof Error) {
      yield put(initializeDraftsError(err.stack!))
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
    recipient: '',
    sending: false
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
  } catch (err) {
    if (err instanceof Error) {
      yield put(addDraftError(err.stack!))
    } else {
      yield put(addDraftError('An unknown error occured.'))
    }
  }
}

async function removeDraft(draft: Draft): Promise<Draft[]> {
  db.drafts.delete(draft.id!)
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
  } catch (err) {
    if (err instanceof Error) {
      yield put(removeDraftError(err.stack!))
    } else {
      yield put(removeDraftError('An unknown error occured.'))
    }
  }
}

async function updateDraft(draft: Draft) {
  db.drafts.update(draft.id!, draft)
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
  } catch (err) {
    if (err instanceof Error) {
      yield put(updateDraftError(err.stack!))
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

export function* sagas() {
  yield all([
    fork(watchAddDraftRequest),
    fork(watchInitializeDraftsRequest),
    fork(watchRemoveDraftRequest),
    fork(watchUpdateDraftRequest)
  ])
}
