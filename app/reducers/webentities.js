// This reducer should handle web entities status transitions, not implemented yet

import createReducer from '../utils/create-reducer'
import {
  DECLARE_PAGE_SUCCESS,
  SET_TAB_WEBENTITY
} from '../actions/webentities'

const initialState = {
  webentities: {}, // id → WebEntity
  tabs: {} // tabId → WebEntity
}


export default createReducer(initialState, {

  [DECLARE_PAGE_SUCCESS]: (state, { webentity }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentity.id]: webentity
    }
  }),

  [SET_TAB_WEBENTITY]: (state, { tabId, webentityId }) => ({
    ...state,
    tabs: {
      ...state.tabs,
      [tabId]: webentityId
    }
  })

})
