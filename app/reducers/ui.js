import createReducer from '../utils/create-reducer'
import {
  FETCH_CORPORA_REQUEST,
  FETCH_CORPORA_SUCCESS,
  FETCH_CORPORA_FAILURE
} from '../actions/servers'
import {
  SHOW_ERROR,
  HIDE_ERROR
} from '../actions/browser'

const initialState = {
  // error message
  error: {
    message: null,
    fatal: false,
    icon: ''
  },
  // to display loaders in different places
  loaders: {
    // when fetching the list of corpora
    corpora: false
  }
}

export default createReducer(initialState, {
  // display loader
  [FETCH_CORPORA_REQUEST]: (state) => {
    return {
      ...state,
      loaders: { ...state.loaders, corpora: true }
    }
  },
  [FETCH_CORPORA_SUCCESS]: (state) => {
    return {
      ...state,
      loaders: { ...state.loaders, corpora: false }
    }
  },
  [FETCH_CORPORA_FAILURE]: (state) => {
    return {
      ...state,
      loaders: { ...state.loaders, corpora: false }
    }
  },

  [SHOW_ERROR]: (state, error) => ({
    ...state,
    error
  }),
  [HIDE_ERROR]: (state) => ({
    ...state,
    error: { message: '', icon: '', fatal: false }
  })
})
