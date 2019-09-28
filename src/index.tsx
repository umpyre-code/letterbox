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

const rootElement = document.getElementById('root')
if (rootElement.hasChildNodes() && rootElement.firstElementChild.className !== 'lds-heart') {
  ReactDOM.hydrate(<Main store={store} history={history} />, rootElement)
} else {
  ReactDOM.render(<Main store={store} history={history} />, rootElement)
}

const Application = {
  isUpdating: false
}

serviceWorker.register({
  onControllerChange: () => {
    if (Application.isUpdating) {
      Application.isUpdating = false
      window.location.reload()
    }
  },
  onSuccess: () => {},
  onUpdate: registration => {
    Application.isUpdating = true
    const updateAvailable = document.getElementById('updateAvailable')
    const button = updateAvailable.querySelector('button')
    button.onclick = () => {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    updateAvailable.style.display = ''
  }
})
