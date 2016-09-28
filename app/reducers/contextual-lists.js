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
  selected: 'mostLinked'
}

export default createReducer(initialState, {
  [FETCH_MOST_LINKED_SUCCESS]: (state, { links }) => ({
    ...state,
    mostLinked: links
  }),

  [FETCH_PARENTS_SUCCESS]: (state, { links }) => ({
    ...state,
    parents: links
  }),

  [FETCH_SUBS_SUCCESS]: (state, { links }) => ({
    ...state,
    subs: links
  }),

  [SELECT_CONTEXTUAL_LIST]: (state, { selected }) => ({
    ...state,
    selected
  })
})
