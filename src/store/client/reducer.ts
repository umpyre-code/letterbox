import { Reducer } from 'redux'
import { ClientState, ClientActionTypes } from './types'

export const initialState: ClientState = {
  client: undefined,
  errors: undefined,
  loading: false,
  ready: false
}

const reducer: Reducer<ClientState> = (state = initialState, action) => {
  switch (action.type) {
    case ClientActionTypes.INITIALIZE_CLIENT_REQUEST: {
      return { ...state, loading: true, errors: undefined }
    }
    case ClientActionTypes.INITIALIZE_CLIENT_SUCCESS: {
      return { ...state, loading: false, client: action.payload, ready: true }
    }
    case ClientActionTypes.INITIALIZE_CLIENT_ERROR: {
      return { ...state, loading: false, errors: action.payload, ready: true }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_REQUEST: {
      return { ...state, loading: true, errors: undefined }
    }
    case ClientActionTypes.SUBMIT_NEW_CLIENT_SUCCESS: {
      console.log(action.payload)
      return { ...state, loading: false, client: action.payload.data }
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
