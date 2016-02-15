import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { hashHistory } from 'react-router'
import { syncHistory } from 'react-router-redux'
import persistState from 'redux-localstorage'

import rootReducer from '../reducers'

// slicer's goal is to select subkeys of the state to be local-stored
// for ex., we are only interested in saving servers.list, not servers.selected
const slicer = () => (state) =>
  ({
    options: state.options,
    servers: {
      list: state.servers.list
    }
  })

// configureStore
export default (initialState) => {
  // configure middlewares
  const routerMiddleware = syncHistory(hashHistory)
  const middlewares = applyMiddleware(thunk, routerMiddleware)

  const storage = persistState(null, { slicer, key: 'hyphe' })

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
