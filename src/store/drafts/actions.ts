import { action } from 'typesafe-actions'
import { Draft, DraftsActionTypes, NewDraft } from './types'

export const initializeDraftsRequest = () => action(DraftsActionTypes.INITIALIZE_DRAFTS_REQUEST)
export const initializeDraftsSuccess = (drafts: Draft[]) =>
  action(DraftsActionTypes.INITIALIZE_DRAFTS_SUCCESS, drafts)
export const initializeDraftsError = (errorMessage: string) =>
  action(DraftsActionTypes.INITIALIZE_DRAFTS_ERROR, errorMessage)

export const addDraftRequest = (newDraft: NewDraft = {}) =>
  action(DraftsActionTypes.ADD_DRAFT_REQUEST, newDraft)
export const addDraftSuccess = (drafts: Draft[]) =>
  action(DraftsActionTypes.ADD_DRAFT_SUCCESS, drafts)
export const addDraftError = (errorMessage: string) =>
  action(DraftsActionTypes.ADD_DRAFT_ERROR, errorMessage)

export const removeDraftRequest = (draft: Draft) =>
  action(DraftsActionTypes.REMOVE_DRAFT_REQUEST, draft)
export const removeDraftSuccess = (drafts: Draft[]) =>
  action(DraftsActionTypes.REMOVE_DRAFT_SUCCESS, drafts)
export const removeDraftError = (errorMessage: string) =>
  action(DraftsActionTypes.REMOVE_DRAFT_ERROR, errorMessage)

export const updateDraftRequest = (draft: Draft) =>
  action(DraftsActionTypes.UPDATE_DRAFT_REQUEST, draft)
export const updateDraftSuccess = (drafts: Draft[]) =>
  action(DraftsActionTypes.UPDATE_DRAFT_SUCCESS, drafts)
export const updateDraftError = (errorMessage: string) =>
  action(DraftsActionTypes.UPDATE_DRAFT_ERROR, errorMessage)

export const sendDraftRequest = (draft: Draft) =>
  action(DraftsActionTypes.SEND_DRAFT_REQUEST, draft)
export const sendDraftSuccess = () => action(DraftsActionTypes.SEND_DRAFT_SUCCESS)
export const sendDraftError = (errorMessage: string, draft: Draft) =>
  action(DraftsActionTypes.SEND_DRAFT_ERROR, errorMessage, draft)
