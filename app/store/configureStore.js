import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { hashHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
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
  const middlewares = applyMiddleware(thunk, routerMiddleware(hashHistory))

  const storage = persistState(null, { slicer, key: 'hyphe' })

  const enhancers = process.env.NODE_ENV === 'development'
    ? compose(middlewares, storage, require('../components/DevTools').default.instrument())
    : compose(middlewares, storage)

  return createStore(rootReducer, initialState, enhancers)
}
