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
  onControllerChange: () => {
    console.log('onControllerChange', Application)
    if (Application.isUpdating) {
      Application.isUpdating = false
      window.location.reload()
    }
  },
  onSuccess: () => {
    console.log('onSuccess', Application)
    // if (Application.isUpdating) {
    // Application.isUpdating = false
    //   window.location.reload()
    // }
  },
  onUpdate: registration => {
    console.log('onUpdate', Application)
    Application.isUpdating = true
    const updateAvailable = document.getElementById('updateAvailable')
    const button = updateAvailable.querySelector('button')
    button.onclick = () => {
      console.log('button clicked')
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    updateAvailable.style.display = ''
  }
})
