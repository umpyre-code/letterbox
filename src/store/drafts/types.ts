import { ClientID } from '../models/client'
import { APIMessage, Message } from '../models/messages'

export interface Draft {
  id?: number

  // treat editor state as a generic object to avoid including all of the editor
  // dependencies in the main app bundle
  editorContent?: string

  recipients: ClientID[]
  pda: string
  created_at: Date
  value_cents: number
  sending: boolean
  message?: Message
  apiMessages?: APIMessage[]
}

export interface FetchDraftsResponse {
  drafts: Draft[]
}

export enum DraftsActionTypes {
  ADD_DRAFT_ERROR = '@@drafts/ADD_DRAFT_ERROR',
  ADD_DRAFT_REQUEST = '@@drafts/ADD_DRAFT_REQUEST',
  ADD_DRAFT_SUCCESS = '@@drafts/ADD_DRAFT_SUCCESS',
  INITIALIZE_DRAFTS_ERROR = '@@drafts/INITIALIZE_DRAFTS_ERROR',
  INITIALIZE_DRAFTS_REQUEST = '@@drafts/INITIALIZE_DRAFTS_REQUEST',
  INITIALIZE_DRAFTS_SUCCESS = '@@drafts/INITIALIZE_DRAFTS_SUCCESS',
  REMOVE_DRAFT_ERROR = '@@drafts/REMOVE_DRAFT_ERROR',
  REMOVE_DRAFT_REQUEST = '@@drafts/REMOVE_DRAFT_REQUEST',
  REMOVE_DRAFT_SUCCESS = '@@drafts/REMOVE_DRAFT_SUCCESS',
  SEND_DRAFT_REQUEST = '@@drafts/SEND_DRAFT_REQUEST',
  SEND_DRAFT_ERROR = '@@drafts/SEND_DRAFT_ERROR',
  SEND_DRAFT_SUCCESS = '@@drafts/SEND_DRAFT_SUCCESS',
  UPDATE_DRAFT_ERROR = '@@drafts/UPDATE_DRAFT_ERROR',
  UPDATE_DRAFT_REQUEST = '@@drafts/UPDATE_DRAFT_REQUEST',
  UPDATE_DRAFT_SUCCESS = '@@drafts/UPDATE_DRAFT_SUCCESS'
}

export interface DraftsState {
  readonly loading: boolean
  readonly drafts: Draft[]
  readonly errors?: string
}
