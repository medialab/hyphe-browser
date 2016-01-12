import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'

import corpora from './corpora'
import servers from './servers'
import tabs from './tabs'
import ui from './ui'
import intl from './intl'

export default combineReducers({
  corpora,
  servers,
  tabs,
  ui,
  intl,
  // let redux store the current URL
  routing: routeReducer
})
