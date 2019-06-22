import { Reducer } from 'redux'
import { MessagesActionTypes, MessagesState } from './types'

export const initialState: MessagesState = {
  errors: undefined,
  loading: false,
  messages: Array.from([])
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
        messages: action.payload
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
        messages: action.payload.messages
      }
    }
    case MessagesActionTypes.FETCH_MESSAGES_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    default: {
      return state
    }
  }
}
