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

const Application = {
  isUpdating: false
}

serviceWorker.register({
  onSuccess: () => {
    if (Application.isUpdating) {
      window.location.reload()
    }
    Application.isUpdating = false
  },
  onUpdate: registration => {
    Application.isUpdating = true
    const updateAvailable = document.getElementById('updateAvailable')
    const button = updateAvailable.querySelector('button')
    button.onclick = () => {
      registration.waiting.postMessage({ type: 'skipWaiting' })
    }
    updateAvailable.style.display = ''
  }
})
