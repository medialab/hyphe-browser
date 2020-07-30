import './css/style'
import './css/themify-icons.css'
import './css/helpers.styl'

import { hot } from 'react-hot-loader'


import React from 'react'
import { Provider } from 'react-redux'

// in this electron app it's easier to reason with hashHistory
import { ConnectedRouter } from 'connected-react-router'
import configureStore, { history } from './store/configureStore'
import Container from './containers/App'

import Routes from './routes'
import { setLocale } from './actions/intl'
import { DEFAULT_LOCALE } from './constants'

import getOption from './utils/get-option'

const store = configureStore()

// // Initialize i18n
const locale = getOption('locale', DEFAULT_LOCALE)
store.dispatch(setLocale(locale))

const App = () => (
  <Provider store={ store }>
    <ConnectedRouter history={ history }>
      <Container>
        <Routes />
      </Container>
    </ConnectedRouter>
  </Provider>
)

export default hot(module)(App)