import createReducer from '../utils/create-reducer'
import { FETCH_MOST_LINKED_SUCCESS } from '../actions/contextual-lists'

const initialState = {
  mostLinked: [],
  parents: [],
  subs: []
}

export default createReducer(initialState, {
  [FETCH_MOST_LINKED_SUCCESS]: (state, { links }) => ({
    ...state,
    mostLinked: links
  })
})
