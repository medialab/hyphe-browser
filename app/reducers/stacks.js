import createReducer from '../utils/create-reducer'

import {
  EMPTY_STACK,
  FETCH_STACK_REQUEST,
  FETCH_STACK_SUCCESS,
  FETCH_STACK_ERROR,
  VIEW_WEBENTITY,
  LOADING_WEBENTITY,
  STOPPED_LOADING_WEBENTITY
} from '../actions/stacks'
import { SELECT_CORPUS } from '../actions/corpora'

// methods and args → for API calls
const initialState = {
  selected: null,
  lastRefresh: null,
  webentities: [],
  loadingWebentity: false,
  list: [
    {
      name: 'DISCOVERED',
      method: 'store.wordsearch_webentities',
      args: [[], [['status', 'DISCOVERED']], ['-indegree', 'name'], 200, 0, false, false],
      condition: 'DISCOVERED'
    },
    {
      name: 'IN',
      method: 'store.get_webentities_by_status',
      args: ['IN', 'name', -1, 0, false, false],
      condition: 'IN'
    },
    {
      name: 'IN_UNTAGGED',
      method: 'store.get_webentities_mistagged',
      args: ['IN', true, false, 'name', -1, 0, false, false],
      condition: 'IN'
    },
    {
      name: 'IN_UNCRAWLED',
      method: 'store.get_webentities_uncrawled',
      args: ['name', -1, 0, false, false],
      condition: 'IN'
    },
    {
      name: 'UNDECIDED',
      method: 'store.get_webentities_by_status',
      args: ['UNDECIDED', 'name', -1, 0, false, false],
      condition: 'UNDECIDED'
    },
    {
      name: 'OUT',
      method: 'store.get_webentities_by_status',
      args: ['OUT', 'name', -1, 0, false, false],
      condition: 'OUT'
    }
  ]
}

export default createReducer(initialState, {
  // reset
  [SELECT_CORPUS]: (state) => ({
    ...state,
    selected: null,
    lastRefresh: null,
    webentities: []
  }),

  [EMPTY_STACK]: (state) => ({
    ...state,
    selected: null
  }),

  [FETCH_STACK_REQUEST]: (state, { stack }) => ({
    ...state,
    selected: stack,
    loading: true
  }),

  [FETCH_STACK_SUCCESS]: (state, { stack, webentities }) => ({
    ...state,
    loading: false,
    lastRefresh: Date.now(),
    webentities
  }),

  [FETCH_STACK_ERROR]: (state) => ({
    ...state,
    loading: false
  }),

  [VIEW_WEBENTITY]: (state, { webentity }) => ({
    ...state,
    webentities: state.webentities.map((w) => {
      if (w.id === webentity.id) {
        w.viewed = true
      }
      return w
    })
  }),

  [LOADING_WEBENTITY]: (state) => ({
    ...state,
    loadingWebentity: true
  }),

  [STOPPED_LOADING_WEBENTITY]: (state) => ({
    ...state,
    loadingWebentity: false
  })

})
