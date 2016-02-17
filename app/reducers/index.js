import { combineReducers } from 'redux'
// let redux store the current location object
import { routeReducer as routing } from 'react-router-redux'

// sub reducers
import corpora from './corpora'
import intl from './intl'
import options from './options'
import servers from './servers'
import stacks from './stacks'
import tabs from './tabs'
import ui from './ui'
import webentities from './webentities'

// returns the rootReducer
export default combineReducers({
  corpora,
  intl,
  options,
  servers,
  stacks,
  tabs,
  ui,
  webentities,
  routing
})
