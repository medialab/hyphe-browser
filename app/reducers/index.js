import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'

import corpora from './corpora'
import servers from './servers'
import tabs from './tabs'
import ui from './ui'

export default combineReducers({
  corpora,
  servers,
  tabs,
  ui,
  // let redux store the current URL
  routing: routeReducer
})
