import { action } from 'typesafe-actions'
import { Draft, DraftsActionTypes } from './types'

export const initializeDraftsRequest = (): ReturnType<typeof action> =>
  action(DraftsActionTypes.INITIALIZE_DRAFTS_REQUEST)
export const initializeDraftsSuccess = (drafts: Draft[]): ReturnType<typeof action> =>
  action(DraftsActionTypes.INITIALIZE_DRAFTS_SUCCESS, drafts)
export const initializeDraftsError = (errorMessage: string): ReturnType<typeof action> =>
  action(DraftsActionTypes.INITIALIZE_DRAFTS_ERROR, errorMessage)

export const addDraftRequest = (): ReturnType<typeof action> =>
  action(DraftsActionTypes.ADD_DRAFT_REQUEST)
export const addDraftSuccess = (drafts: Draft[]): ReturnType<typeof action> =>
  action(DraftsActionTypes.ADD_DRAFT_SUCCESS, drafts)
export const addDraftError = (errorMessage: string): ReturnType<typeof action> =>
  action(DraftsActionTypes.ADD_DRAFT_ERROR, errorMessage)

export const removeDraftRequest = (draft: Draft): ReturnType<typeof action> =>
  action(DraftsActionTypes.REMOVE_DRAFT_REQUEST, draft)
export const removeDraftSuccess = (drafts: Draft[]): ReturnType<typeof action> =>
  action(DraftsActionTypes.REMOVE_DRAFT_SUCCESS, drafts)
export const removeDraftError = (errorMessage: string): ReturnType<typeof action> =>
  action(DraftsActionTypes.REMOVE_DRAFT_ERROR, errorMessage)

export const updateDraftRequest = (draft: Draft): ReturnType<typeof action> =>
  action(DraftsActionTypes.UPDATE_DRAFT_REQUEST, draft)
export const updateDraftSuccess = (drafts: Draft[]): ReturnType<typeof action> =>
  action(DraftsActionTypes.UPDATE_DRAFT_SUCCESS, drafts)
export const updateDraftError = (errorMessage: string): ReturnType<typeof action> =>
  action(DraftsActionTypes.UPDATE_DRAFT_ERROR, errorMessage)

export const sendDraftRequest = (draft: Draft): ReturnType<typeof action> =>
  action(DraftsActionTypes.SEND_DRAFT_REQUEST, draft)
export const sendDraftSuccess = (): ReturnType<typeof action> =>
  action(DraftsActionTypes.SEND_DRAFT_SUCCESS)
export const sendDraftError = (errorMessage: string): ReturnType<typeof action> =>
  action(DraftsActionTypes.SEND_DRAFT_ERROR, errorMessage)
