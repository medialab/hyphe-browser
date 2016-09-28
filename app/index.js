import './css/style'
import './css/themify-icons'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
// in this electron app it's easier to reason with hashHistory
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import routes from './routes'
import configureStore from './store/configureStore'
import { setLocale } from './actions/intl'
import { DEFAULT_LOCALE } from './constants'

import getOption from './utils/get-option'
import jsonrpc from './utils/jsonrpc'

const store = configureStore()

// Initialize i18n
store.dispatch(setLocale(getOption('locale', DEFAULT_LOCALE)))

const history = syncHistoryWithStore(hashHistory, store)
// Reset URI
location.hash = 'login'

const domRoot = document.getElementById('root')

const rootElement = (
  <Provider store={ store }>
    <div>
      <Router history={ history }>
        { routes }
      </Router>
    </div>
  </Provider>
)

render(rootElement, domRoot)

// Debugging utilities
if (process.env.NODE_ENV === 'development') {
  console.debug('Development: JSON RPC client set as global variable') // eslint-disable-line no-console
  window.client = jsonrpc('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')
}
