import { combineReducers } from 'redux'
// let redux store the current location object
import { connectRouter } from 'connected-react-router'

// sub reducers
import corpora from './corpora'
import intl from './intl'
import options from './options'
import servers from './servers'
import stacks from './stacks'
import tabs from './tabs'
import ui from './ui'
import webentities from './webentities'
import cloud from './cloud'

// returns the rootReducer
const createRootReducer = ( history ) => combineReducers({
  corpora,
  intl,
  options,
  servers,
  stacks,
  tabs,
  ui,
  webentities,
  cloud,
  router: connectRouter(history),
})


export default createRootReducer
