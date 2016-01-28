import createReducer from '../utils/create-reducer'
import {
  FETCH_CORPORA_REQUEST,
  FETCH_CORPORA_SUCCESS,
  FETCH_CORPORA_FAILURE,
  FETCH_CORPUS_STATUS_REQUEST,
  FETCH_CORPUS_STATUS_SUCCESS,
  FETCH_CORPUS_STATUS_FAILURE,
  CREATE_CORPUS_FAILURE,
  SELECT_CORPUS
} from '../actions/corpora'
import {
  SHOW_ERROR,
  HIDE_ERROR
} from '../actions/browser'
import {
  DECLARE_PAGE_REQUEST,
  DECLARE_PAGE_SUCCESS,
  DECLARE_PAGE_FAILURE,
  SET_WEBENTITY_STATUS_REQUEST,
  SET_WEBENTITY_STATUS_SUCCESS,
  SET_WEBENTITY_STATUS_FAILURE,
  SAVE_ADJUSTED_WEBENTITY_REQUEST,
  SAVE_ADJUSTED_WEBENTITY_SUCCESS,
  SAVE_ADJUSTED_WEBENTITY_FAILURE
} from '../actions/webentities'
import {
  ERROR_SERVER_NO_RESOURCE,
  ERROR_SET_WEBENTITY_STATUS
} from '../constants'

const emptyError = {
  id: null,
  message: null,
  fatal: false,
  icon: ''
}

const initialState = {
  // error message
  error: emptyError,
  // to display loaders in different places
  loaders: {
    // when fetching the list of corpora
    corpora: false,
    corpus_status: false,
    webentity: false,
    webentity_status: false,
    webentity_adjust: false
  }
}

const toggleLoader = (which, bool, err) => (state, { error }) => ({
  error: err ? {...err, messageValues: { error } } : state.error,
  loaders: { ...state.loaders, [which]: bool }
})

export default createReducer(initialState, {
  [SHOW_ERROR]: (state, error) => ({ ...state, error }),
  [HIDE_ERROR]: (state) => ({ ...state, error: emptyError }),
  [SELECT_CORPUS]: (state) => ({ ...state, error: emptyError }),

  [FETCH_CORPORA_REQUEST]: toggleLoader('corpora', true),
  [FETCH_CORPORA_SUCCESS]: toggleLoader('corpora', false),
  [FETCH_CORPORA_FAILURE]: toggleLoader('corpora', true),

  [FETCH_CORPUS_STATUS_REQUEST]: toggleLoader('corporus_status', true),
  [FETCH_CORPUS_STATUS_SUCCESS]: toggleLoader('corporus_status', false),
  [FETCH_CORPUS_STATUS_FAILURE]: toggleLoader('corporus_status', false),

  [DECLARE_PAGE_REQUEST]: toggleLoader('webentity', true),
  [DECLARE_PAGE_SUCCESS]: toggleLoader('webentity', false),
  [DECLARE_PAGE_FAILURE]: toggleLoader('webentity', false),

  [SET_WEBENTITY_STATUS_REQUEST]: toggleLoader('webentity_status', true),
  [SET_WEBENTITY_STATUS_SUCCESS]: toggleLoader('webentity_status', false),
  [SET_WEBENTITY_STATUS_FAILURE]: toggleLoader('webentity_status', false, {
    id: ERROR_SET_WEBENTITY_STATUS,
    messageId: 'error.set-webentity-status'
  }),

  [SAVE_ADJUSTED_WEBENTITY_REQUEST]: toggleLoader('webentity_adjust', true),
  [SAVE_ADJUSTED_WEBENTITY_SUCCESS]: toggleLoader('webentity_adjust', false),
  [SAVE_ADJUSTED_WEBENTITY_FAILURE]: toggleLoader('webentity_adjust', false, {
    messageId: 'error.save-webentity'
  }),

  [CREATE_CORPUS_FAILURE]: (state /*, error */) => ({ ...state, error: { id: ERROR_SERVER_NO_RESOURCE } })
})
