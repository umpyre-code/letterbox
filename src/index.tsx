import { createBrowserHistory, createMemoryHistory } from 'history'
import React from 'react'
import * as ReactDOM from 'react-dom'
import configureStore from './configureStore'
import { Main } from './Main'
import * as serviceWorker from './serviceWorker'

function createHistory() {
  if (process.versions.electron) {
    return createMemoryHistory()
  }
  return createBrowserHistory()
}

const history = createHistory()
const store = configureStore(history)

ReactDOM.render(<Main store={store} history={history} />, document.getElementById('root'))

serviceWorker.register({
  onSuccess: () => {
    console.log('onSuccess called')
  },
  onUpdate: () => {
    console.log('onUpdate called')
    document.getElementById('updateAvailable').style.display = ''
  }
})
