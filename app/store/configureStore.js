import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { hashHistory } from 'react-router'
import { syncHistory } from 'react-router-redux'
import persistState from 'redux-localstorage'

import rootReducer from '../reducers'

// only these branches of the state tree will be persisted in the localStorage
const branches = [ 'options', 'servers' ]

// configureStore
export default (initialState) => {
  // configure middlewares
  const routerMiddleware = syncHistory(hashHistory)
  const middlewares = applyMiddleware(thunk, routerMiddleware)

  const storage = persistState(branches, { key: 'hyphe' })

  const enhancers = process.env.NODE_ENV === 'development'
    ? compose(middlewares, storage, require('../components/DevTools').default.instrument())
    : compose(middlewares, storage)

  const store = createStore(rootReducer, initialState, enhancers)
  // only needed to work correctly with redux devtools
  if (process.env.NODE_ENV === 'development') {
    routerMiddleware.listenForReplays(store)
  }
  return store
}
