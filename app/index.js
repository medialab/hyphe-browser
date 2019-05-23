import './css/style'
import './css/themify-icons'

import { hot } from 'react-hot-loader'

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

import Container from './Container'

const store = configureStore()

// Initialize i18n
store.dispatch(setLocale(getOption('locale', DEFAULT_LOCALE)))

const history = syncHistoryWithStore(hashHistory, store)
// Reset URI
location.hash = 'login'

const domRoot = document.getElementById('root')

render(<Container />, domRoot)

// Debugging utilities
if (process.env.NODE_ENV === 'development') {
  console.debug('Development: JSON RPC client set as global variable') // eslint-disable-line no-console
  window.client = jsonrpc('http://hyphe.medialab.sciences-po.fr/dev-forccast-api')
}
