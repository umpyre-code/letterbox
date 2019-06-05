import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'
import { cache } from 'emotion'
import { CacheProvider } from '@emotion/core'

import Main from './main'
import * as serviceWorker from './serviceWorker'
import configureStore from './configureStore'

import 'typeface-ibm-plex-sans'
import './styles'

const history = createBrowserHistory()

const initialState = window.initialReduxState
const store = configureStore(history, initialState)

ReactDOM.render(
  <CacheProvider value={cache}>
    <Main store={store} history={history} />
  </CacheProvider>,
  document.getElementById('root')
)

serviceWorker.register()
