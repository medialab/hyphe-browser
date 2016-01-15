import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'

import corpora from './corpora'
import intl from './intl'
import options from './options'
import servers from './servers'
import tabs from './tabs'
import ui from './ui'
import webentities from './webentities'

export default combineReducers({
  corpora,
  intl,
  options,
  servers,
  tabs,
  ui,
  webentities,
  // let redux store the current URL
  routing: routeReducer
})
