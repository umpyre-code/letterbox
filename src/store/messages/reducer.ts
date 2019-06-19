import { Reducer } from 'redux'
import { MessagesState, MessagesActionTypes, Message } from './types'

export const initialState: MessagesState = {
  messages: Array.from([
    {
      to: 'you',
      from: 'Umpyre',
      body: '# Welcome to Umpyre 🤗\nUmpyre is a messaging service.',
      created_at: new Date(),
      hash: 'lol'
    }
  ]),
  errors: undefined,
  loading: false,
  ready: false
}

const reducer: Reducer<MessagesState> = (state = initialState, action) => {
  switch (action.type) {
    case MessagesActionTypes.INITIALIZE_MESSAGES_REQUEST: {
      return { ...state, loading: true }
    }
    case MessagesActionTypes.INITIALIZE_MESSAGES_SUCCESS: {
      return {
        ...state,
        loading: false,
        ready: true,
        messages: action.payload
      }
    }
    case MessagesActionTypes.INITIALIZE_MESSAGES_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    default: {
      return state
    }
  }
}

export { reducer as messagesReducer }
