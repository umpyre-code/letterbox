import { Reducer } from 'redux'
import { DraftsActionTypes, DraftsState } from './types'

export const initialState: DraftsState = {
  drafts: Array.from([]),
  errors: undefined,
  loading: false
}

export const reducer: Reducer<DraftsState> = (state = initialState, action) => {
  switch (action.type) {
    case DraftsActionTypes.ADD_DRAFT_REQUEST:
    case DraftsActionTypes.INITIALIZE_DRAFTS_REQUEST:
    case DraftsActionTypes.REMOVE_DRAFT_REQUEST:
    case DraftsActionTypes.SEND_DRAFTS_REQUEST:
    case DraftsActionTypes.UPDATE_DRAFT_REQUEST: {
      return state
    }
    case DraftsActionTypes.ADD_DRAFT_SUCCESS:
    case DraftsActionTypes.INITIALIZE_DRAFTS_SUCCESS:
    case DraftsActionTypes.REMOVE_DRAFT_SUCCESS:
    case DraftsActionTypes.UPDATE_DRAFT_SUCCESS: {
      return {
        ...state,
        drafts: action.payload,
        loading: false
      }
    }
    case DraftsActionTypes.ADD_DRAFT_ERROR:
    case DraftsActionTypes.INITIALIZE_DRAFTS_ERROR:
    case DraftsActionTypes.REMOVE_DRAFT_ERROR:
    case DraftsActionTypes.SEND_DRAFTS_ERROR:
    case DraftsActionTypes.UPDATE_DRAFT_ERROR: {
      return { ...state, errors: action.payload }
    }
    default: {
      return state
    }
  }
}
