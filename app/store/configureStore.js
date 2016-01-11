import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import rootReducer from '../reducers'
import DevTools from '../components/DevTools' // make it NODE_ENV-dependent

const finalCreateStore = getCreateStoreModifier()(createStore)

export default (initialState) => finalCreateStore(rootReducer, initialState)


function getCreateStoreModifier () {
  if (process.env.NODE_ENV === 'development') {
    return compose(
      applyMiddleware(thunk),
      DevTools.instrument()
    )
  } else {
    return applyMiddleware(thunk)
  }
}
