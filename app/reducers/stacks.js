import createReducer from '../utils/create-reducer'
import set from 'lodash/fp/set'

import {
  EMPTY_STACK,
  SELECT_STACK,
  FETCH_STACK_REQUEST,
  FETCH_STACK_SUCCESS,
  FETCH_STACK_PAGE_REQUEST,
  FETCH_STACK_PAGE_SUCCESS,
  FETCH_STACK_FAILURE,
  STOPPED_LOADING_WEBENTITY
} from '../actions/stacks'
import { SELECT_CORPUS } from '../actions/corpora'

import {
  ADD_WEBENTITY_PREFIXES_SUCCESS,
  MERGE_WEBENTITY_SUCCESS,
  SET_WEBENTITY_NAME_SUCCESS,
  SET_WEBENTITY_HOMEPAGE_SUCCESS,
  SET_WEBENTITY_STATUS_SUCCESS
} from '../actions/webentities'
import {
  ADD_TAG_SUCCESS,
  UPDATE_TAG_SUCCESS,
  REMOVE_TAG_SUCCESS,
} from '../actions/tags'

// methods and args → for API calls
const initialState = {
  selected: null,
  lastRefresh: null,
  webentities: {},
  loadingWebentity: false
}

export default createReducer(initialState, {
  // reset
  [SELECT_CORPUS]: () => initialState,

  [EMPTY_STACK]: (state) => ({
    ...state,
    selected: null
  }),

  [SELECT_STACK]: (state, { stack }) => ({
    ...state,
    selected: stack
  }),

  [FETCH_STACK_REQUEST]: (state) => ({
    ...state,
    loading: true
  }),

  [FETCH_STACK_PAGE_REQUEST]: (state) => ({
    ...state,
    loading: true
  }),

  [FETCH_STACK_SUCCESS]: (state, { stack, webentities }) => ({
    ...state,
    loading: false,
    selected: stack,
    lastRefresh: Date.now(),
    webentities: {
      ...state.webentities,
      [stack]: webentities
    }
  }),

  [FETCH_STACK_PAGE_SUCCESS]: (state, { stack, webentities }) => ({
    ...state,
    loading: false,
    selected: stack,
    lastRefresh: Date.now(),
    webentities: {
      ...state.webentities,
      [stack]: {
        ...webentities,
        webentities: state.webentities[stack].webentities.concat(webentities.webentities)
      }
    }
  }),

  [FETCH_STACK_FAILURE]: (state) => ({
    ...state,
    loading: false
  }),

  [STOPPED_LOADING_WEBENTITY]: (state) => ({
    ...state,
    loadingWebentity: false
  }),

  [ADD_WEBENTITY_PREFIXES_SUCCESS]: updateWebentity((webentity, payload) => {
    return {
      ...webentity,
      prefixes: webentity.prefixes.concat(payload.prefixes)
    }
  }),

  [SET_WEBENTITY_NAME_SUCCESS]: updateWebentity((webentity, payload) => {
    return {
      ...webentity,
      name: payload.name
    }
  }),

  [SET_WEBENTITY_HOMEPAGE_SUCCESS]: updateWebentity((webentity, payload) => {
    return {
      ...webentity,
      homepage: payload.homepage
    }
  }),


  [SET_WEBENTITY_STATUS_SUCCESS]: updateWebentity((webentity, payload) => {
    return {
      ...webentity,
      previousStatus: webentity.status,
      status: payload.status
    }
  }),

  [MERGE_WEBENTITY_SUCCESS]: updateWebentity((webentity, payload) => {
    return {
      ...webentity,
      previousStatus: webentity.status,
      status: 'merged'
    }
  }),


  [UPDATE_TAG_SUCCESS]: updateWebentity((webentity, payload) => {
    return {
      ...webentity,
      tags: {
        ...webentity.tags,
        USER: {
          ...webentity.tags.USER,
          [payload.category]: [payload.newValue]
        }
      }
    }
  }),

  [ADD_TAG_SUCCESS]: updateWebentity((webentity, payload) => {
    return {
      ...webentity,
      tags: {
        ...webentity.tags,
        USER: {
          ...webentity.tags.USER,
          [payload.category]: [payload.value]
        }
      }
    }
  }),

  [REMOVE_TAG_SUCCESS]: updateWebentity((webentity, payload) => {
    return {
      ...webentity,
      tags: {
        ...webentity.tags,
        USER: {
          ...webentity.tags.USER,
          [payload.category]: []
        }
      }
    }
  })
})

function updateWebentity (updator) {
  return (state, payload) => {
    const wes = state.webentities[state.selected].webentities.map((webentity) => {
      if (webentity.id === payload.webentityId) {
        // Can't use `loadsh#set` because it infer types 🥴
        return updator(webentity, payload)
      }
      return webentity
    })
    return set(['webentities', state.selected, 'webentities'])(wes)(state)
  }
}
