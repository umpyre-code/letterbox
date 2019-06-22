import { CacheProvider } from '@emotion/core'
import { cache } from 'emotion'
import { createBrowserHistory } from 'history'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import configureStore from './configureStore'
import { Main } from './Main'

const history = createBrowserHistory()
const store = configureStore(history)

ReactDOM.render(
  <CacheProvider value={cache}>
    <Main store={store} history={history} />
  </CacheProvider>,
  document.getElementById('root')
)
