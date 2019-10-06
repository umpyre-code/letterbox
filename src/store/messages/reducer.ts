import { Reducer } from 'redux'
import { MessagesActionTypes, MessagesState } from './types'

export const initialState: MessagesState = {
  errors: undefined,
  loadedMessages: new Map(),
  loading: false,
  readMessages: Array.from([]),
  sentMessages: Array.from([]),
  sketch: '',
  unreadMessages: Array.from([])
}

export const reducer: Reducer<MessagesState> = (state = initialState, action) => {
  switch (action.type) {
    case MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST: {
      return { ...state, loading: true }
    }
    case MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS: {
      return {
        ...state,
        loading: false,
        ...action.payload
      }
    }
    case MessagesActionTypes.INITIALIZE_MESSAGES_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case MessagesActionTypes.FETCH_MESSAGES_REQUEST: {
      return { ...state, loading: true }
    }
    case MessagesActionTypes.FETCH_MESSAGES_SUCCESS: {
      return {
        ...state,
        loading: false,
        ...action.payload
      }
    }
    case MessagesActionTypes.FETCH_MESSAGES_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case MessagesActionTypes.DELETE_MESSAGE_REQUEST: {
      return { ...state, loading: true }
    }
    case MessagesActionTypes.DELETE_MESSAGE_SUCCESS: {
      return {
        ...state,
        loading: false,
        ...action.payload
      }
    }
    case MessagesActionTypes.DELETE_MESSAGE_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case MessagesActionTypes.MESSAGE_READ_REQUEST: {
      return { ...state, loading: true }
    }
    case MessagesActionTypes.MESSAGE_READ_SUCCESS: {
      return {
        ...state,
        loading: false,
        ...action.payload
      }
    }
    case MessagesActionTypes.MESSAGE_READ_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case MessagesActionTypes.UPDATE_SKETCH_SUCCESS: {
      return { ...state, sketch: action.payload }
    }
    case MessagesActionTypes.LOAD_MESSAGES_ERROR: {
      return { ...state, loading: false }
    }
    case MessagesActionTypes.LOAD_MESSAGES_REQUEST: {
      return { ...state, loading: true }
    }
    case MessagesActionTypes.LOAD_MESSAGES_SUCCESS: {
      return {
        ...state,
        loadedMessages: new Map([...state.loadedMessages, ...action.payload]),
        loading: false
      }
    }
    case MessagesActionTypes.UNLOAD_MESSAGES_REQUEST: {
      return { ...state, loadedMessages: new Map() }
    }
    case MessagesActionTypes.SEND_MESSAGES_REQUEST: {
      return { ...state }
    }
    case MessagesActionTypes.SEND_MESSAGES_SUCCESS: {
      return {
        ...state,
        ...action.payload
      }
    }
    case MessagesActionTypes.SEND_MESSAGES_ERROR: {
      return { ...state }
    }
    default: {
      return state
    }
  }
}
