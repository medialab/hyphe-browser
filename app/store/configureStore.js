import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { routeReducer } from 'redux-simple-router'

import rootReducer from '../reducers'
import DevTools from '../components/DevTools' // make it NODE_ENV-dependent

// let redux store the current URL
const reducer = combineReducers(Object.assign({}, rootReducer, {
  routing: routeReducer
}))

const finalCreateStore = getCreateStoreModifier()(createStore)

export default (initialState) => finalCreateStore(reducer, initialState)


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
