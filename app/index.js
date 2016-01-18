import './css/photon'
import './css/style'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
// in this electron app it's easier to reason with hashHistory
import { Router, hashHistory } from 'react-router'
import { syncReduxAndRouter } from 'redux-simple-router'

import routes from './routes'
import DevTools from './components/DevTools'
import configureStore from './store/configureStore'
import { setLocale } from './actions/intl'
import { DEFAULT_LOCALE } from './constants'

import getOption from './utils/get-option'
import jsonrpc from './utils/jsonrpc'

const store = configureStore()

// Initialize i18n
store.dispatch(setLocale(getOption('locale', DEFAULT_LOCALE)))

// Reset URI
location.hash = 'login'
syncReduxAndRouter(hashHistory, store)

const domRoot = document.getElementById('root')

const rootElement = (
  <Provider store={ store }>
    <div>
      <Router history={ hashHistory }>
        { routes }
      </Router>
      { process.env.NODE_ENV === 'development' ? <DevTools /> : null }
    </div>
  </Provider>
)

render(rootElement, domRoot)

// Debugging utilities
if (process.env.NODE_ENV === 'development') {
  console.debug('Development: JSON RPC client set as global variable') // eslint-disable-line no-console
  window.client = jsonrpc('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')
}


if (process.env.DIRECT_ACCESS_CORPUS_TEST) {
  console.debug('Defined environment variable $DIRECT_ACCESS_CORPUS_TEST: switch login form') // eslint-disable-line no-console
  store.dispatch(require('./actions/corpora').requestCorpora('http://hyphe.medialab.sciences-po.fr/dev-forccast-api'))
  store.dispatch(require('./actions/corpora').selectCorpus({ corpus_id: 'test' }))
  store.dispatch(require('redux-simple-router').pushPath('browser'))
}
