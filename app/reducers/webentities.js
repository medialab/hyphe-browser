// This reducer should handle web entities status transitions, not implemented yet

import mergeWith from 'lodash.mergewith'
import set from 'lodash.set'
import uniq from 'lodash.uniq'
import without from 'lodash.without'
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
  SET_WEBENTITY_CRAWLING_STATUS,
  SET_TAB_WEBENTITY,
  CREATE_WEBENTITY_SUCCESS,
  ADJUST_WEBENTITY
  // Note we don't subscribe to SAVE_ADJUSTED_WEBENTITY_* because we're already plugged to its sub-actions
} from '../actions/webentities'
import { SELECT_CORPUS } from '../actions/corpora'
import {
  ADD_TAG_REQUEST,
  ADD_TAG_SUCCESS,
  ADD_TAG_FAILURE,
  REMOVE_TAG_REQUEST,
  REMOVE_TAG_SUCCESS,
  REMOVE_TAG_FAILURE
} from '../actions/tags'

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

  [SET_WEBENTITY_CRAWLING_STATUS]: updateWebentity((webentity, { crawling_status }) => ({ crawling_status })),

  // (Optimistically) add tag
  [ADD_TAG_REQUEST]: updateWebentity((webentity, { category, value, updatedValue }) => {
    const oldTags = ((webentity.tags || {}).USER || {})[category] || []
    const newTags = updatedValue
      ? oldTags.map((v) => (v === updatedValue) ? value : v)
      : uniq(oldTags.concat([value]))
    return set({ ['tags_' + category + '_prev']: oldTags }, 'tags.USER.' + category, newTags)
  }),
  [ADD_TAG_SUCCESS]: updateWebentity((webentity, { category }) => ({
    ['tags_' + category + '_prev']: null
  })),
  [ADD_TAG_FAILURE]: updateWebentity((webentity, { category }) => set(
    { ['tags_' + category + '_prev']: null },
    'tags.USER.' + category, webentity['tags_' + category + '_prev']
  )),

  // (Optimistically) remove tag
  [REMOVE_TAG_REQUEST]: updateWebentity((webentity, { category, value }) => set(
    { ['tags_' + category + '_prev']: webentity.tags.USER[category] },
    'tags.USER.' + category, without(webentity.tags.USER[category] || [], value)
  )),
  [REMOVE_TAG_SUCCESS]: updateWebentity((webentity, { category }) => ({
    ['tags_' + category + '_prev']: null
  })),
  [REMOVE_TAG_FAILURE]: updateWebentity((webentity, { category }) => set(
    { ['tags_' + category + '_prev']: null },
    'tags.USER.' + category, webentity['tags_' + category + '_prev']
  )),

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
    [success]: updateWebentity((webentity, payload) => ({
      [field]: payload[field], // in case we receive success with no previous request
      [field + '_prev']: null // remove track of previous value
    })),
    [failure]: updateWebentity((webentity) => ({
      [field]: webentity[field + '_prev'], // restore previous value
      [field + '_prev']: null // remove track of previous value
    }))
  }
}

function updateWebentity (updator) {
  return (state, payload) => {
    const id = payload.webentityId
    const webentity = state.webentities[id]
    const updates = updator(webentity, payload)
    const updated = mergeWith({}, webentity, updates, (prev, next) => {
      if (Array.isArray(next)) {
        return next // override arrays instead of merging them
      }
    })
    return {...state, webentities: {...state.webentities, [id]: updated}}
  }
}
