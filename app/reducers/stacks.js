import createReducer from '../utils/create-reducer'

const initialState = {
  selected: null,
  list: [
    {
      name: 'PROSPECT',
      description: 'PROSPECT description',
      method: 'advanced_search_webentities',
      arguments: [[], [['status', 'DISCOVERED']], ['-indegree', 'name'], 50, 0, false, false, true]
    },
    {
      name: 'IN',
      description: 'IN description',
      method: 'get_webentities_by_status',
      arguments: ['IN', 'name', -1, 0]
    },
    {
      name: 'UNDECIDED',
      description: 'UNDECIDED description',
      method: 'get_webentities_by_status',
      arguments: ['UNDECIDED', 'name', -1, 0]
    },
    {
      name: 'OUT',
      description: 'OUT description',
      method: 'get_webentities_by_status',
      arguments: ['OUT', 'name', -1, 0]
    },
    {
      name: 'TOTAG',
      description: 'TOTAG description',
      method: 'unwritten_yet',
      arguments: ['COMING...']
    }
  ]
}

export default createReducer(initialState, {
})
