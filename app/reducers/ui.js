import createReducer from '../utils/create-reducer'
import {
  FETCH_SERVER_STATUS_REQUEST,
  FETCH_SERVER_STATUS_SUCCESS,
  FETCH_SERVER_STATUS_FAILURE,
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
  SELECT_CONTEXTUAL_LIST,
  TOGGLE_DO_NOT_SHOW_AGAIN,
  TOGGLE_CONTEXT,
  TOGGLE_CATEGORIES,
  TOGGLE_FREETAGS
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
  MERGE_WEBENTITY_REQUEST,
  MERGE_WEBENTITY_SUCCESS,
  MERGE_WEBENTITY_FAILURE,
  BATCH_WEBENTITY_ACTIONS_REQUEST,
  BATCH_WEBENTITY_ACTIONS_SUCCESS,
  BATCH_WEBENTITY_ACTIONS_FAILURE,
  FETCH_TLDS_REQUEST,
  FETCH_TLDS_SUCCESS,
  FETCH_TLDS_FAILURE
} from '../actions/webentities'
import {
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
  selectedContext: 'mostLinked',
  showContext: false,
  showCategories: true,
  showFreetags: true,
  loaders: {
    corpora: false,
    corpus_status: false,
    webentity: false,
    webentity_status: false,
    webentity_adjust: false,
    webentity_merge: false,
    webentity_batch_actions: false,
    tlds: false
  },
  // for messages having a "do not show again" options
  // this is only for the session, maybe it shall be persisted in the future
  doNotShow: {
    crawlPopup: false
  }
}

const toggleLoader = (loader, enabled, err) => (state, payload) => {
  let notification = { ... state.notification }
  if (enabled) {
    notification = emptyNotification
  } 
  if (err) {
    const messageValues = payload && payload.error ? { error: payload.error } : null
    notification =  { ...err, type: 'error', messageValues }
  }
  return {
    ...state,
    loaders: { ...state.loaders, [loader]: enabled },
    notification
  }
}

export default createReducer(initialState, {
  [SHOW_NOTIFICATION]: (state, notification) => ({ ...state, notification }),
  [HIDE_NOTIFICATION]: (state, { id, type }) => ({
    ...state,
    notification: (id ? state.notification.id === id|| state.notification.messageId === id : (type ? state.notification.type === type : true))
      ? emptyNotification // id matches, or no id and type matches (general case of hideNotif())
      : state.notification // no match, keep it
  }),
  [SELECT_CORPUS]: (state) => ({
    ...state,
    notification: emptyNotification
  }),
  [FETCH_SERVER_STATUS_REQUEST]: toggleLoader('corpora', true),
  [FETCH_SERVER_STATUS_SUCCESS]: toggleLoader('corpora', false),
  [FETCH_SERVER_STATUS_FAILURE]: toggleLoader('corpora', false, {
    messageId: 'error.loading-server'
  }),

  [FETCH_CORPORA_REQUEST]: toggleLoader('corpora', true),
  [FETCH_CORPORA_SUCCESS]: toggleLoader('corpora', false),
  [FETCH_CORPORA_FAILURE]: toggleLoader('corpora', false, {
    messageId: 'error.loading-corpora'
  }),

  [FETCH_CORPUS_STATUS_REQUEST]: toggleLoader('corporus_status', true),
  [FETCH_CORPUS_STATUS_SUCCESS]: toggleLoader('corporus_status', false),
  [FETCH_CORPUS_STATUS_FAILURE]: toggleLoader('corporus_status', false),

  [DECLARE_PAGE_REQUEST]: toggleLoader('webentity', false),
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

  [MERGE_WEBENTITY_REQUEST]: toggleLoader('webentity_merge', true),
  [MERGE_WEBENTITY_SUCCESS]: toggleLoader('webentity_merge', false),
  [MERGE_WEBENTITY_FAILURE]: toggleLoader('webentity_merge', false, {
    messageId: 'error.merge-webentity'
  }),

  [BATCH_WEBENTITY_ACTIONS_REQUEST]: toggleLoader('webentity_batch_actions', true),
  [BATCH_WEBENTITY_ACTIONS_SUCCESS]: toggleLoader('webentity_batch_actions', false),
  [BATCH_WEBENTITY_ACTIONS_FAILURE]: toggleLoader('webentity_batch_actions', false),

  [CREATE_CORPUS_FAILURE]: (state, { error }) => {
    if (error.message) {
      return {
        ...state,
        notification: {
          messageId: 'error.corpus-not-created',
          messageValues: error
        }
      }
    }
    return {
      ...state,
      notification: {
        messageId: 'error.corpus-not-created-no-resource',
      }
    }
  },
  
  [SELECT_CONTEXTUAL_LIST]: (state, { selectedContext }) => ({
    ...state,
    selectedContext
  }),

  [TOGGLE_DO_NOT_SHOW_AGAIN]: (state, { key, hide = null }) => ({
    ...state,
    doNotShow: {
      ...state.doNotShow,
      [key]: hide !== null ? hide : !state.doNotShow[key]
    }
  }),

  [TOGGLE_CONTEXT]: (state) => ({
    ...state,
    showContext: !state.showContext
  }),

  [TOGGLE_CATEGORIES]: (state) => ({
    ...state,
    showCategories: !state.showCategories
  }),

  [TOGGLE_FREETAGS]: (state) => ({
    ...state,
    showFreetags: !state.showFreetags
  })

})
