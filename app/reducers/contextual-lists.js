import createReducer from '../utils/create-reducer'
import {
  FETCH_MOST_LINKED_SUCCESS,
  FETCH_PARENTS_SUCCESS,
  FETCH_SUBS_SUCCESS,
  SELECT_CONTEXTUAL_LIST
} from '../actions/contextual-lists'

const initialState = {
  mostLinked: [],
  parents: [],
  subs: [],
  selected: 'mostLinked',
  loading: true
}

export default createReducer(initialState, {
  [FETCH_MOST_LINKED_SUCCESS]: (state, { links }) => ({
    ...state,
    mostLinked: links,
    loading: false
  }),

  [FETCH_PARENTS_SUCCESS]: (state, { links }) => ({
    ...state,
    parents: links,
    loading: false
  }),

  [FETCH_SUBS_SUCCESS]: (state, { links }) => ({
    ...state,
    subs: links,
    loading: false
  }),

  [SELECT_CONTEXTUAL_LIST]: (state, { selected }) => ({
    ...state,
    selected,
    loading: false
  })
})
