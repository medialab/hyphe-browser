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
  SHOW_NOTIFICATION,
  HIDE_NOTIFICATION,
  TOGGLE_DO_NOT_SHOW_AGAIN
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
  SAVE_ADJUSTED_WEBENTITY_FAILURE,
  FETCH_TLDS_REQUEST,
  FETCH_TLDS_SUCCESS,
  FETCH_TLDS_FAILURE
} from '../actions/webentities'
import {
  ERROR_SERVER_NO_RESOURCE,
  ERROR_SET_WEBENTITY_STATUS
} from '../constants'

const emptyNotification = {
  id: null,
  message: null,
  type: '',
  icon: ''
}

const initialState = {
  // current notification
  notification: emptyNotification,
  // to display loaders in different places
  loaders: {
    corpora: false,
    corpus_status: false,
    webentity: false,
    webentity_status: false,
    webentity_adjust: false,
    tlds: false
  },
  // for messages having a "do not show again" options
  // this is only for the session, maybe it shall be persisted in the future
  doNotShow: {
    crawlPopup: false
  }
}

const toggleLoader = (loader, enabled, err) => (state, { error }) => ({
  ...state,
  notification: err ? {...err, type: 'error', messageValues: { error } } : state.notification,
  loaders: { ...state.loaders, [loader]: enabled }
})

export default createReducer(initialState, {
  [SHOW_NOTIFICATION]: (state, notification) => ({ ...state, notification }),
  [HIDE_NOTIFICATION]: (state) => ({ ...state, notification: emptyNotification }),
  [SELECT_CORPUS]: (state) => ({ ...state, notification: emptyNotification }),

  [FETCH_CORPORA_REQUEST]: toggleLoader('corpora', true),
  [FETCH_CORPORA_SUCCESS]: toggleLoader('corpora', false),
  [FETCH_CORPORA_FAILURE]: toggleLoader('corpora', true),

  [FETCH_CORPUS_STATUS_REQUEST]: toggleLoader('corporus_status', true),
  [FETCH_CORPUS_STATUS_SUCCESS]: toggleLoader('corporus_status', false),
  [FETCH_CORPUS_STATUS_FAILURE]: toggleLoader('corporus_status', false),

  [DECLARE_PAGE_REQUEST]: toggleLoader('webentity', true),
  [DECLARE_PAGE_SUCCESS]: toggleLoader('webentity', false),
  [DECLARE_PAGE_FAILURE]: toggleLoader('webentity', false),

  [FETCH_TLDS_REQUEST]: toggleLoader('tlds', true),
  [FETCH_TLDS_SUCCESS]: toggleLoader('tlds', false),
  [FETCH_TLDS_FAILURE]: toggleLoader('tlds', false),

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

  [CREATE_CORPUS_FAILURE]: (state /*, error */) => ({
    ...state,
    notification: { id: ERROR_SERVER_NO_RESOURCE }
  }),

  [TOGGLE_DO_NOT_SHOW_AGAIN]: (state, { key }) => ({
    ...state,
    doNotShow: {
      ...state.doNotShow,
      [key]: !state.doNotShow[key]
    }
  }),
})
