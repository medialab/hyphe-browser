import createReducer from '../utils/create-reducer'

import {
  EMPTY_STACK,
  FETCH_STACK_SUCCESS
} from '../actions/stacks'

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
      args: [[], [['status', 'DISCOVERED']], ['-indegree', 'name'], 50, 0, false, false, true]
    },
    {
      name: 'IN',
      description: 'IN description',
      method: 'store.get_webentities_by_status',
      args: ['IN', 'name', -1, 0]
    },
    {
      name: 'UNDECIDED',
      description: 'UNDECIDED description',
      method: 'store.get_webentities_by_status',
      args: ['UNDECIDED', 'name', -1, 0]
    },
    {
      name: 'OUT',
      description: 'OUT description',
      method: 'store.get_webentities_by_status',
      args: ['OUT', 'name', -1, 0]
    }
    // {
    //   name: 'TOTAG',
    //   description: 'TOTAG description',
    //   method: 'unwritten_yet',
    //   args: ['COMING...']
    // }
  ]
}

export default createReducer(initialState, {
  [EMPTY_STACK]: (state, { stack }) => ({
    ...state,
    selected: null
  }),

  [FETCH_STACK_SUCCESS]: (state, { stack, webentities }) => ({
    ...state,
    selected: stack,
    lastRefresh: Date.now(),
    webentities
  })
})
