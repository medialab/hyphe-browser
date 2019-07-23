import createReducer from '../utils/create-reducer'

import {
  EMPTY_STACK,
  FETCH_STACK_REQUEST,
  FETCH_STACK_SUCCESS,
  FETCH_STACK_ERROR,
  VIEW_WEBENTITY,
  STOPPED_LOADING_WEBENTITY
} from '../actions/stacks'
import { SELECT_CORPUS } from '../actions/corpora'

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

  [FETCH_STACK_REQUEST]: (state) => ({
    ...state,
    loading: true
  }),

  [FETCH_STACK_SUCCESS]: (state, { stack, webentities }) => ({
    ...state,
    loading: false,
    selected: stack.name,
    lastRefresh: Date.now(),
    webentities: {
      ...state.webentities,
      [stack.name]: webentities
    }
  }),

  [FETCH_STACK_ERROR]: (state) => ({
    ...state,
    loading: false
  }),

  [VIEW_WEBENTITY]: (state, { webentity }) => ({
    ...state,
    loadingWebentity: true,
    webentities: {
      ...state.webentities,
      [state.selected]: state.webentities[state.selected].map((w) => {
        if (w.id === webentity.id) {
          w.viewed = true
        }
        return w
      })
    }
  }),

  [STOPPED_LOADING_WEBENTITY]: (state) => ({
    ...state,
    loadingWebentity: false
  })

})
