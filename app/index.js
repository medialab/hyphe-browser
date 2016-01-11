import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
// in this electron app it's easier to reason with hashHistory
import { Router, hashHistory } from 'react-router'
import { syncReduxAndRouter } from 'redux-simple-router'

import routes from './routes'
import DevTools from './components/DevTools'
import configureStore from './store/configureStore'

const store = configureStore()

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
