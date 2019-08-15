import { createBrowserHistory } from 'history'
import React from 'react'
import * as ReactDOM from 'react-dom'
import configureStore from './configureStore'
import { Main } from './Main'

const history = createBrowserHistory()
const store = configureStore(history)

ReactDOM.render(<Main store={store} history={history} />, document.getElementById('root'))
