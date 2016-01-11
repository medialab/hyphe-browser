import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'

import servers from './servers'
import tabs from './tabs'

export default combineReducers({
  servers,
  tabs,
  // let redux store the current URL
  routing: routeReducer
})
