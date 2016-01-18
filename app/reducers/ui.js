import createReducer from '../utils/create-reducer'
import {
  FETCH_CORPORA_REQUEST,
  FETCH_CORPORA_SUCCESS,
  FETCH_CORPORA_FAILURE,
  FETCH_CORPUS_STATUS_REQUEST,
  FETCH_CORPUS_STATUS_SUCCESS,
  FETCH_CORPUS_STATUS_FAILURE,
  CREATE_CORPUS_FAILURE
} from '../actions/corpora'
import {
  SHOW_ERROR,
  HIDE_ERROR
} from '../actions/browser'
import {
  DECLARE_PAGE_REQUEST,
  DECLARE_PAGE_SUCCESS,
  DECLARE_PAGE_FAILURE
} from '../actions/webentities'
import {
  ERROR_SERVER_NO_RESOURCE
} from '../constants'

const getEmptyError = () => ({
  id: null,
  message: null,
  fatal: false,
  icon: ''
})

const initialState = {
  // error message
  error: getEmptyError(),
  // to display loaders in different places
  loaders: {
    // when fetching the list of corpora
    corpora: false,
    corpus_status: false,
    webentity: false
  }
}

const toggleLoader = (which, bool) => (state) => ({
  ...state,
  loaders: { ...state.loaders, [which]: bool }
})

export default createReducer(initialState, {
  [SHOW_ERROR]: (state, error) => ({ ...state, error }),
  [HIDE_ERROR]: (state) => ({ ...state, error: getEmptyError() }),

  [FETCH_CORPORA_REQUEST]: toggleLoader('corpora', true),
  [FETCH_CORPORA_SUCCESS]: toggleLoader('corpora', false),
  [FETCH_CORPORA_FAILURE]: toggleLoader('corpora', true),

  [FETCH_CORPUS_STATUS_REQUEST]: toggleLoader('corporus_status', true),
  [FETCH_CORPUS_STATUS_SUCCESS]: toggleLoader('corporus_status', false),
  [FETCH_CORPUS_STATUS_FAILURE]: toggleLoader('corporus_status', false),

  [DECLARE_PAGE_REQUEST]: toggleLoader('webentity', true),
  [DECLARE_PAGE_SUCCESS]: toggleLoader('webentity', false),
  [DECLARE_PAGE_FAILURE]: toggleLoader('webentity', false),

  [CREATE_CORPUS_FAILURE]: (state /*, error */) => ({ ...state, error: { id: ERROR_SERVER_NO_RESOURCE } })
})
