import { hot } from 'react-hot-loader'/* eslint no-unused-vars : 0 */

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
// in this electron app it's easier to reason with hashHistory
import configureStore from './store/configureStore'

import { setLocale } from './actions/intl'
import { DEFAULT_LOCALE } from './constants'

import getOption from './utils/get-option'
import jsonrpc from './utils/jsonrpc'

import Container from './Container'

const store = configureStore()

// // Initialize i18n
store.dispatch(setLocale(getOption('locale', DEFAULT_LOCALE)))

// const history = syncHistoryWithStore(browserHistory, store)
// Reset URI
location.hash = 'login'

const domRoot = document.getElementById('root')
render(<Container />, domRoot)

window.rebuild = () => render(<Container />, domRoot)
