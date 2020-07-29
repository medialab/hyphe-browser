import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import { createHashHistory } from 'history'
import { routerMiddleware } from 'connected-react-router'

// import { routerMiddleware } from 'connected-react-router'

// import { browserHistory } from 'react-router'
// import { routerMiddleware } from 'react-router-redux'
import persistState from 'redux-localstorage'

import createRouteReducer from '../reducers'

// slicer's goal is to select subkeys of the state to be local-stored
// for ex., we are only interested in saving servers.list, not servers.selected
const slicer = () => (state) =>
  ({
    options: state.options,
    servers: {
      list: state.servers.list
    },
    corpora: {
      navigationHistory: state.corpora.navigationHistory,
      searchEngines: state.corpora.searchEngines
    },
    cloud: state.cloud
  })

export const history = createHashHistory()

// configureStore
export default (initialState) => {
  const middlewares = applyMiddleware(thunk, routerMiddleware(history))

  const storage = persistState(null, { slicer, key: 'hyphe' })

  const enhancers = process.env.NODE_ENV === 'development'
    ? compose(storage, window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f)
    : compose(storage)

  return createStore(
    createRouteReducer(history),
    initialState,
    compose(
      middlewares,
      enhancers
    )
  )

  // return createStore(middlewares, initialState, enhancers)
}
