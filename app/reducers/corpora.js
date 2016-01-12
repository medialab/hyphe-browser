import createReducer from '../utils/create-reducer'
import { SELECT_CORPUS } from '../actions/corpora'
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
  },

  [SELECT_CORPUS]: (state, { corpus }) => {
    return {
      ...state,
      selected: corpus
    }
  }
})

