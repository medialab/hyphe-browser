import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import persistState from 'redux-localstorage'

import rootReducer from '../reducers'
import DevTools from '../components/DevTools' // make it NODE_ENV-dependent

const finalCreateStore = getCreateStoreModifier()(createStore)

export default (initialState) => finalCreateStore(rootReducer, initialState)

function getCreateStoreModifier () {
  const storage = persistState(['servers'], { key: 'hyphe' })

  if (process.env.NODE_ENV === 'development') {
    return compose(
      applyMiddleware(thunk),
      storage,
      DevTools.instrument()
    )
  } else {
    return compose(
      applyMiddleware(thunk),
      storage
    )
  }
}
