import createReducer from '../utils/create-reducer'

import {
  EMPTY_STACK,
  FETCH_STACK_SUCCESS,
  VIEW_WEBENTITY
} from '../actions/stacks'
import { SELECT_CORPUS } from '../actions/corpora'

// methods and args → for API calls
const initialState = {
  selected: null,
  lastRefresh: null,
  webentities: [],
  list: [
    {
      name: 'PROSPECT',
      description: 'PROSPECT description',
      method: 'store.advanced_search_webentities',
      args: [[], [['status', 'DISCOVERED']], ['-indegree', 'name'], 50, 0, false, false, true],
      condition: 'DISCOVERED'
    },
    {
      name: 'TOTAG',
      description: 'TOTAG description',
      method: 'store.get_webentities_mistagged',
      args: ['IN', true, false, 'name', -1, 0],
      condition: 'IN'
    },
    {
      name: 'IN',
      description: 'IN description',
      method: 'store.get_webentities_by_status',
      args: ['IN', 'name', -1, 0],
      condition: 'IN'
    },
    {
      name: 'UNDECIDED',
      description: 'UNDECIDED description',
      method: 'store.get_webentities_by_status',
      args: ['UNDECIDED', 'name', -1, 0],
      condition: 'UNDECIDED'
    },
    {
      name: 'OUT',
      description: 'OUT description',
      method: 'store.get_webentities_by_status',
      args: ['OUT', 'name', -1, 0],
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

  [FETCH_STACK_SUCCESS]: (state, { stack, webentities }) => ({
    ...state,
    selected: stack,
    lastRefresh: Date.now(),
    webentities
  }),

  [VIEW_WEBENTITY]: (state, { webentity }) => ({
    ...state,
    webentities: state.webentities.map((w) => {
      if (w.id === webentity.id) {
        w.viewed = true
      }
      return w
    })
  })
})
