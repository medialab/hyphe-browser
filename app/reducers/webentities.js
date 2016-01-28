// This reducer should handle web entities status transitions, not implemented yet

import createReducer from '../utils/create-reducer'
import {
  DECLARE_PAGE_SUCCESS,
  SET_WEBENTITY_HOMEPAGE_REQUEST,
  SET_WEBENTITY_HOMEPAGE_SUCCESS,
  SET_WEBENTITY_HOMEPAGE_FAILURE,
  SET_WEBENTITY_NAME_REQUEST,
  SET_WEBENTITY_NAME_SUCCESS,
  SET_WEBENTITY_NAME_FAILURE,
  SET_WEBENTITY_STATUS_REQUEST,
  SET_WEBENTITY_STATUS_SUCCESS,
  SET_WEBENTITY_STATUS_FAILURE,
  SET_TAB_WEBENTITY,
  CREATE_WEBENTITY_SUCCESS,
  ADJUST_WEBENTITY
  // Note we don't subscribe to SAVE_ADJUSTED_WEBENTITY_* because we're already plugged to its sub-actions
} from '../actions/webentities'
import { SELECT_CORPUS } from '../actions/corpora'

const initialState = {
  webentities: {}, // id → WebEntity
  tabs: {}, // tabId → webEntityId
  adjustments: {} // webEntityId → adjustment { name, homepage, prefix, crawl }
}


export default createReducer(initialState, {

  [DECLARE_PAGE_SUCCESS]: (state, { webentity }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentity.id]: webentity
    }
  }),

  ...optimisticUpdateWebentity(
    'homepage',
    SET_WEBENTITY_HOMEPAGE_REQUEST,
    SET_WEBENTITY_HOMEPAGE_SUCCESS,
    SET_WEBENTITY_HOMEPAGE_FAILURE
  ),

  ...optimisticUpdateWebentity(
    'name',
    SET_WEBENTITY_NAME_REQUEST,
    SET_WEBENTITY_NAME_SUCCESS,
    SET_WEBENTITY_NAME_FAILURE
  ),

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
  [SELECT_CORPUS]: () => ({ ...initialState }),

  // Keep track of current WE adjustments
  [ADJUST_WEBENTITY]: (state, { id, info }) => ({
    ...state,
    adjustments: {
      ...state.adjustments,
      [id]: (info && state.adjustments[id])
        ? {...state.adjustments[id], ...info}
        : info
    }
  })
})


function optimisticUpdateWebentity (field, request, success, failure) {
  return {
    [request]: updateWebentity((webentity, payload) => ({
      [field]: payload[field], // optimistically update field
      [field + '_prev']: webentity[field] // keep track of previous value for cancellation
    })),
    [success]: updateWebentity((webentity, payload) => {
      console.log('SUCCESS', webentity, payload, {
        [field]: payload[field], // in case we receive success with no previous request
        [field + '_prev']: undefined // remove track of previous value
      })
      return {
        [field]: payload[field], // in case we receive success with no previous request
        [field + '_prev']: undefined // remove track of previous value
      }
    }),
    [failure]: updateWebentity((webentity) => ({
      [field]: webentity[field + '_prev'], // restore previous value
      [field + '_prev']: undefined // remove track of previous value
    }))
  }
}

function updateWebentity (updator) {
  return (state, payload) => {
    const id = payload.webentityId
    const webentity = state.webentities[id]
    const updated = {...webentity, ...updator(webentity, payload)}
    return {...state, webentities: {...state.webentities, [id]: updated}}
  }
}
