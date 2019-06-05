import { Reducer } from 'redux'
import { ClientState, ClientActionTypes } from './types'

export const initialState: ClientState = {
  data: [],
  errors: undefined,
  loading: false
}

const reducer: Reducer<ClientState> = (state = initialState, action) => {
  switch (action.type) {
    case ClientActionTypes.FETCH_REQUEST: {
      return { ...state, loading: true }
    }
    case ClientActionTypes.FETCH_SUCCESS: {
      return { ...state, loading: false, data: action.payload }
    }
    case ClientActionTypes.FETCH_ERROR: {
      return { ...state, loading: false, errors: action.payload }
    }
    default: {
      return state
    }
  }
}

export { reducer as clientReducer }
