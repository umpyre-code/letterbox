import { action } from 'typesafe-actions'
import { Draft, DraftsActionTypes } from './types'

export const initializeDraftsRequest = (): any =>
  action(DraftsActionTypes.INITIALIZE_DRAFTS_REQUEST)
export const initializeDraftsSuccess = (drafts: Draft[]): any =>
  action(DraftsActionTypes.INITIALIZE_DRAFTS_SUCCESS, drafts)
export const initializeDraftsError = (errorMessage: string): any =>
  action(DraftsActionTypes.INITIALIZE_DRAFTS_ERROR, errorMessage)

export const addDraftRequest = (): any => action(DraftsActionTypes.ADD_DRAFT_REQUEST)
export const addDraftSuccess = (drafts: Draft[]): any =>
  action(DraftsActionTypes.ADD_DRAFT_SUCCESS, drafts)
export const addDraftError = (errorMessage: string): any =>
  action(DraftsActionTypes.ADD_DRAFT_ERROR, errorMessage)

export const removeDraftRequest = (draft: Draft): any =>
  action(DraftsActionTypes.REMOVE_DRAFT_REQUEST, draft)
export const removeDraftSuccess = (drafts: Draft[]): any =>
  action(DraftsActionTypes.REMOVE_DRAFT_SUCCESS, drafts)
export const removeDraftError = (errorMessage: string): any =>
  action(DraftsActionTypes.REMOVE_DRAFT_ERROR, errorMessage)

export const updateDraftRequest = (draft: Draft): any =>
  action(DraftsActionTypes.UPDATE_DRAFT_REQUEST, draft)
export const updateDraftSuccess = (drafts: Draft[]): any =>
  action(DraftsActionTypes.UPDATE_DRAFT_SUCCESS, drafts)
export const updateDraftError = (errorMessage: string): any =>
  action(DraftsActionTypes.UPDATE_DRAFT_ERROR, errorMessage)

export const sendDraftRequest = (draft: Draft): any =>
  action(DraftsActionTypes.SEND_DRAFT_REQUEST, draft)
export const sendDraftSuccess = (): any => action(DraftsActionTypes.SEND_DRAFT_SUCCESS)
export const sendDraftError = (errorMessage: string): any =>
  action(DraftsActionTypes.SEND_DRAFT_ERROR, errorMessage)
