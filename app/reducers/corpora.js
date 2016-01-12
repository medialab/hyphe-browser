import createReducer from '../utils/create-reducer'
import { FETCH_CORPORA_SUCCESS } from '../actions/servers'

const initialState = {
  // TODO: transform it in a array here?
  list: {},
  selected: null
}

export default createReducer(initialState, {
  [FETCH_CORPORA_SUCCESS]: (state, { corpora }) => {
    return {
      ...state,
      list: {...corpora}
    }
  }
})

