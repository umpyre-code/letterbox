import { Reducer } from 'redux'
import { ClientState, ClientActionTypes } from './types'

export const initialState: ClientState = {
  data: [],
  errors: undefined,
  loading: false
}

const reducer: Reducer<ClientState> = (state = initialState, action) => {
  switch (action.type) {
    case ClientActionTypes.GET_CLIENT_REQUEST: {
      return { ...state, loading: true }
    }
    case ClientActionTypes.GET_CLIENT_SUCCESS: {
      return { ...state, loading: false, data: action.payload }
    }
    case ClientActionTypes.GET_CLIENT_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST: {
      return { ...state, loading: true }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS: {
      return { ...state, loading: false, data: action.payload }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    default: {
      return state
    }
  }
}

export { reducer as clientReducer }
