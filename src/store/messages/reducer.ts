import { Reducer } from 'redux'
import { MessageBase } from '../models/messages'
import { MessagesActionTypes, MessagesState } from './types'

export const initialState: MessagesState = {
  errors: undefined,
  loading: false,
  readMessages: Array.from([]),
  sketch: '',
  unreadMessages: Array.from([])
}

interface RankedMessages {
  readMessages: MessageBase[]
  unreadMessages: MessageBase[]
}

function cmp(first: MessageBase, second: MessageBase): number {
  if (first.value_cents > second.value_cents) {
    return -1
  }
  if (second.value_cents > first.value_cents) {
    return 1
  }
  return 0
}

function rankMessages(messages: MessageBase[]): RankedMessages {
  return {
    readMessages: messages.filter(message => message.read === true).sort(cmp),
    unreadMessages: messages
      .filter(message => message.read === false)
      .sort(cmp)
      .slice(0, 5)
  }
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
        ...rankMessages(action.payload)
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
        ...rankMessages(action.payload)
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
        ...rankMessages(action.payload)
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
        ...rankMessages(action.payload)
      }
    }
    case MessagesActionTypes.MESSAGE_READ_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case MessagesActionTypes.UPDATE_SKETCH_SUCCESS: {
      return { ...state, sketch: action.payload }
    }
    default: {
      return state
    }
  }
}
