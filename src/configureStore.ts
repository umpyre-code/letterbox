import { routerMiddleware } from 'connected-react-router'
import { History } from 'history'
import { applyMiddleware, createStore, Store } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import reduxSaga from 'redux-saga'
import { createRootReducer, rootSaga } from './store'
import { ApplicationState } from './store/ApplicationState'

export default function configureStore(history: History): Store<ApplicationState> {
  const composeEnhancers = composeWithDevTools({})
  const sagaMiddleware = reduxSaga()
  const initialState = {}

  const store = createStore(
    createRootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware))
  )

  sagaMiddleware.run(rootSaga)
  return store
}
