import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'
import { cache } from 'emotion'
import { CacheProvider } from '@emotion/core'

import Main from './main'
import * as serviceWorker from './serviceWorker'
import configureStore from './configureStore'

import 'semantic-ui-css/semantic.min.css'

const history = createBrowserHistory()

const store = configureStore(history)

ReactDOM.render(
  <CacheProvider value={cache}>
    <Main store={store} history={history} />
  </CacheProvider>,
  document.getElementById('root')
)

serviceWorker.register()
