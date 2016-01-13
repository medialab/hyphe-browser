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

import jsonrpc from './utils/jsonrpc'

const store = configureStore()

// Initialize i18n
store.dispatch(setLocale(DEFAULT_LOCALE)) // TODO from user preferences

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
  console.log('Development: JSON RPC client set as global variable')
  window.client = jsonrpc('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')
}


if (process.env.DIRECT_ACCESS_CORPUS_TEST) {
  console.log('Defined environment variable $DIRECT_ACCESS_CORPUS_TEST: switch login form')
  store.dispatch(require('./actions/servers').fetchCorpora('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')).then((action) => {
    store.dispatch(require('./actions/corpora').selectCorpus(action.payload.corpora.test))
    store.dispatch(require('redux-simple-router').pushPath('browser'))
  })
}
