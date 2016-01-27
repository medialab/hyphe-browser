// This reducer should handle web entities status transitions, not implemented yet

import createReducer from '../utils/create-reducer'
import {
  DECLARE_PAGE_SUCCESS,
  SET_WEBENTITY_HOMEPAGE_SUCCESS,
  SET_WEBENTITY_NAME_SUCCESS,
  SET_WEBENTITY_STATUS_REQUEST,
  SET_WEBENTITY_STATUS_SUCCESS,
  SET_WEBENTITY_STATUS_FAILURE,
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

  // Optimistic update
  ...optimisticUpdateWebentity(
    'status',
    SET_WEBENTITY_STATUS_REQUEST,
    SET_WEBENTITY_STATUS_SUCCESS,
    SET_WEBENTITY_STATUS_FAILURE
  ),

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


function optimisticUpdateWebentity (field, request, success, failure) {
  return {
    [request]: updateWebentity((webentity, payload) => {
      console.log('UPDATE', { request, webentity, payload })
      return {
        [field]: payload[field], // optimistically update field
        [field + '_prev']: webentity[field] // keep track of previous value for cancellation
      }
    }),
    [success]: updateWebentity((webentity, payload) => {
      console.log('UPDATE', { success, webentity, payload })
      return {
        [field + '_prev']: undefined // remove track of previous value
      }
    }),
    [failure]: updateWebentity((webentity, payload) => {
      return {
        [field]: webentity[field + '_prev'], // restore previous value
        [field + '_prev']: undefined // remove track of previous value
      }
    })
  }
}

function updateWebentity (updator) {
  return (state, payload) => {
    const id = payload.webentityId
    const webentity = state.webentities[id]
    console.log('updates', webentity, payload)
    const updated = {...webentity, ...updator(webentity, payload)}
    console.log('updated', updated)
    return {...state, webentities: {...state.webentities, [id]: updated}}
  }
}
