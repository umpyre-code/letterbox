import { Reducer } from 'redux'
import { MessagesActionTypes, MessagesState } from 'store/messages/types'

export const initialState: MessagesState = {
  errors: undefined,
  loading: false,
  messages: Array.from([
    {
      body: '# Welcome to Umpyre 🤗\nUmpyre is a messaging service.',
      created_at: new Date(),
      from: 'Umpyre',
      hash: 'lol',
      to: 'you'
    }
  ]),
  ready: false
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
        messages: action.payload,
        ready: true
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
        messages: action.payload,
        ready: true
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
