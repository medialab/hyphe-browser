// This reducer should handle web entities status transitions, not implemented yet

import createReducer from '../utils/create-reducer'
import {
  DECLARE_PAGE_SUCCESS,
  SET_WEBENTITY_HOMEPAGE_SUCCESS,
  SET_WEBENTITY_NAME_SUCCESS,
  SET_TAB_WEBENTITY,
  CREATE_WEBENTITY_SUCCESS
} from '../actions/webentities'
import { SELECT_CORPUS } from '../actions/corpora'

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

  [SET_WEBENTITY_HOMEPAGE_SUCCESS]: (state, { homepage, webentityId }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentityId]: {
        ...state.webentities[webentityId],
        homepage
      }
    }
  }),

  [SET_WEBENTITY_NAME_SUCCESS]: (state, { name, webentityId }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentityId]: {
        ...state.webentities[webentityId],
        name
      }
    }
  }),

  [SET_TAB_WEBENTITY]: (state, { tabId, webentityId }) => ({
    ...state,
    tabs: {
      ...state.tabs,
      [tabId]: webentityId
    }
  }),

  [CREATE_WEBENTITY_SUCCESS]: (state, { webentity }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentity.id]: webentity
    }
  }),

  // Reset state when selecting corpus
  [SELECT_CORPUS]: () => ({ ...initialState })

})
