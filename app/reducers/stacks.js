import createReducer from '../utils/create-reducer'

import {
  EMPTY_STACK,
  SELECT_STACK,
  FETCH_STACK_REQUEST,
  FETCH_STACK_SUCCESS,
  FETCH_STACK_PAGE_REQUEST,
  FETCH_STACK_PAGE_SUCCESS,
  FETCH_STACK_FAILURE,
  VIEW_WEBENTITY,
  STOPPED_LOADING_WEBENTITY
} from '../actions/stacks'
import { SELECT_CORPUS } from '../actions/corpora'

// methods and args → for API calls
const initialState = {
  selected: null,
  lastRefresh: null,
  filter: null,
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

  [FETCH_STACK_SUCCESS]: (state, { stack, filter, webentities }) => ({
    ...state,
    loading: false,
    selected: stack,
    filter,
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

  [VIEW_WEBENTITY]: (state, { webentity }) => ({
    ...state,
    loadingWebentity: true,
    webentities: {
      ...state.webentities,
      [state.selected]: {
        ...state.webentities[state.selected],
        webentities: state.webentities[state.selected].webentities.map((w) => {
          if (w.id === webentity.id) {
            w.viewed = true
          }
          return w
        })
      }
    }
  }),

  [STOPPED_LOADING_WEBENTITY]: (state) => ({
    ...state,
    loadingWebentity: false
  })

})
