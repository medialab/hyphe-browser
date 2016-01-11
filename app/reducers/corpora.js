import createReducer from '../utils/create-reducer'
import { FETCH_CORPORA_SUCCESS } from '../actions/servers'

const initialState = {}

export default createReducer(initialState, {
  [FETCH_CORPORA_SUCCESS]: (state, { corpora }) => ({...corpora})
})

