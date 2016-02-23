// API calls in this file :
// - declare_page
// - store.set_webentity_homepage
// - store.rename_webentity
// - store.declare_webentity_by_lruprefix_as_url
// - store.set_webentity_status
// - crawl_webentity (webentity_id, depth = 0, phantom_crawl = false, status = 'IN', phantom_timeouts = {}, corpus = '--hyphe--')

import jsonrpc from '../utils/jsonrpc'

import { CRAWL_DEPTH } from '../constants'
import { createAction } from 'redux-actions'

// adding a page to corpus
export const DECLARE_PAGE_REQUEST = '§_DECLARE_PAGE_REQUEST'
export const DECLARE_PAGE_SUCCESS = '§_DECLARE_PAGE_SUCCESS'
export const DECLARE_PAGE_FAILURE = '§_DECLARE_PAGE_FAILURE'

// setting webentity's homepage
export const SET_WEBENTITY_HOMEPAGE_REQUEST = '§_SET_WEBENTITY_HOMEPAGE_REQUEST'
export const SET_WEBENTITY_HOMEPAGE_SUCCESS = '§_SET_WEBENTITY_HOMEPAGE_SUCCESS'
export const SET_WEBENTITY_HOMEPAGE_FAILURE = '§_SET_WEBENTITY_HOMEPAGE_FAILURE'

// setting webentity's name
export const SET_WEBENTITY_NAME_REQUEST = '§_SET_WEBENTITY_NAME_REQUEST'
export const SET_WEBENTITY_NAME_SUCCESS = '§_SET_WEBENTITY_NAME_SUCCESS'
export const SET_WEBENTITY_NAME_FAILURE = '§_SET_WEBENTITY_NAME_FAILURE'

// setting webentity's status
export const SET_WEBENTITY_STATUS_REQUEST = '§_SET_WEBENTITY_STATUS_REQUEST'
export const SET_WEBENTITY_STATUS_SUCCESS = '§_SET_WEBENTITY_STATUS_SUCCESS'
export const SET_WEBENTITY_STATUS_FAILURE = '§_SET_WEBENTITY_STATUS_FAILURE'

// creating webentity
export const CREATE_WEBENTITY_REQUEST = '§_CREATE_WEBENTITY_REQUEST'
export const CREATE_WEBENTITY_SUCCESS = '§_CREATE_WEBENTITY_SUCCESS'
export const CREATE_WEBENTITY_FAILURE = '§_CREATE_WEBENTITY_FAILURE'

// attaching a fetched webentity to an open tab
export const SET_TAB_WEBENTITY = '§_SET_TAB_WEBENTITY'

// adjust webentity
export const ADJUST_WEBENTITY = '§_ADJUST_WEBENTITY' // false => close, true => open with defaults, object => update fields
export const SAVE_ADJUSTED_WEBENTITY_REQUEST = '§_SAVE_ADJUSTED_WEBENTITY_REQUEST'
export const SAVE_ADJUSTED_WEBENTITY_SUCCESS = '§_SAVE_ADJUSTED_WEBENTITY_SUCCESS'
export const SAVE_ADJUSTED_WEBENTITY_FAILURE = '§_SAVE_ADJUSTED_WEBENTITY_FAILURE'


export const declarePage = (serverUrl, corpusId, url, tabId = null) => (dispatch) => {
  dispatch({ type: DECLARE_PAGE_REQUEST, payload: { serverUrl, corpusId, url } })

  return jsonrpc(serverUrl)('declare_page', [url, corpusId])
    .then(({ result }) => result) // declare_page does not return webentity directly but a { result } object
    /* webentity's homepage must be set manually by user
    .then((webentity) => {
      if (!webentity.homepage) {
        // Set homepage to requested URL if not defined yet
        return setWebentityHomepage(serverUrl, corpusId, url, webentity.id).then(() => {
          webentity.homepage = url
          return webentity
        })
      } else {
        return webentity
      }
    })
    */
    .then((webentity) => {
      dispatch({ type: DECLARE_PAGE_SUCCESS, payload: { serverUrl, corpusId, url, webentity } })
      if (tabId) {
        dispatch(setTabWebentity(tabId, webentity.id))
      }
      return webentity
    })
    .catch((error) => dispatch({ type: DECLARE_PAGE_FAILURE, payload: { serverUrl, corpusId, url, error } }))
}

export const setTabWebentity = createAction(SET_TAB_WEBENTITY, (tabId, webentityId) => ({ tabId, webentityId }))

export const setWebentityHomepage = (serverUrl, corpusId, homepage, webentityId) => (dispatch) => {
  dispatch({ type: SET_WEBENTITY_HOMEPAGE_REQUEST, payload: { serverUrl, corpusId, homepage, webentityId } })

  return jsonrpc(serverUrl)('store.set_webentity_homepage', [webentityId, homepage, corpusId])
    .then(() => dispatch({ type: SET_WEBENTITY_HOMEPAGE_SUCCESS, payload: { serverUrl, corpusId, homepage, webentityId } }))
    .catch((error) => {
      dispatch({ type: SET_WEBENTITY_HOMEPAGE_FAILURE, payload: { serverUrl, corpusId, homepage, webentityId, error } })
      throw error
    })
}

export const setWebentityName = (serverUrl, corpusId, name, webentityId) => (dispatch) => {
  dispatch({ type: SET_WEBENTITY_NAME_REQUEST, payload: { serverUrl, corpusId, name, webentityId } })

  return jsonrpc(serverUrl)('store.rename_webentity', [webentityId, name, corpusId])
    .then(() => dispatch({ type: SET_WEBENTITY_NAME_SUCCESS, payload: { serverUrl, corpusId, name, webentityId } }))
    .catch((error) => {
      dispatch({ type: SET_WEBENTITY_NAME_FAILURE, payload: { serverUrl, corpusId, name, webentityId, error } })
      throw error
    })
}

export const setWebentityStatus = (serverUrl, corpusId, status, webentityId) => (dispatch) => {
  dispatch({ type: SET_WEBENTITY_STATUS_REQUEST, payload: { serverUrl, corpusId, status, webentityId } })

  return jsonrpc(serverUrl)('store.set_webentity_status', [webentityId, status, corpusId])
    .then(() => dispatch({ type: SET_WEBENTITY_STATUS_SUCCESS, payload: { serverUrl, corpusId, status, webentityId } }))
    .catch((error) => {
      dispatch({ type: SET_WEBENTITY_STATUS_FAILURE, payload: { serverUrl, corpusId, status, webentityId, error } })
      throw error
    })
}

export const createWebentity = (serverUrl, corpusId, prefixUrl, name = null, homepage = null, tabId = null) => (dispatch) => {
  dispatch({ type: CREATE_WEBENTITY_REQUEST, payload: { serverUrl, corpusId, name, prefixUrl } })

  return jsonrpc(serverUrl)('store.declare_webentity_by_lruprefix_as_url', [prefixUrl, name, null, null, corpusId])
    .then((webentity) => {
      dispatch({ type: CREATE_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, webentity } })
      if (tabId) {
        dispatch(setTabWebentity(tabId, webentity.id))
      }
      return webentity
    })
    .then((webentity) => {
      if (homepage) {
        return dispatch(setWebentityHomepage(serverUrl, corpusId, homepage, webentity.id)).then(() => Object.assign(webentity, { homepage }))
      } else {
        return webentity
      }
    })
    .catch((error) => {
      dispatch({ type: CREATE_WEBENTITY_FAILURE, payload: { serverUrl, corpusId, name, prefixUrl, error } })
      throw error
    })
}

export const setAdjustWebentity = (webentityId, info) => ({ type: ADJUST_WEBENTITY, payload: { id: webentityId, info } })
export const showAdjustWebentity = (webentityId, crawl = false) => setAdjustWebentity(webentityId, { name: null, homepage: null, prefix: null, crawl })
export const hideAdjustWebentity = (webentityId) => setAdjustWebentity(webentityId, null)

export const saveAdjustedWebentity = (serverUrl, corpusId, webentity, adjust, tabId) => (dispatch) => {
  dispatch({ type: SAVE_ADJUSTED_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, adjust, webentity } })

  const { prefix, homepage, name, crawl } = adjust
  var operations = []

  if (prefix) {
    // Create a new web entity
    // Set its name and homepage at the same time + refresh tab by passing tab id
    operations.push(createWebentity(serverUrl, corpusId, prefix, name, homepage, tabId)(dispatch))
  } else {
    if (homepage && homepage !== webentity.homepage) {
      operations.push(setWebentityHomepage(serverUrl, corpusId, homepage, webentity.id)(dispatch))
    }
    if (name && name !== webentity.name) {
      operations.push(setWebentityName(serverUrl, corpusId, name, webentity.id)(dispatch))
    }
  }

  return Promise.all(operations)
    .then(([head]) => {
      if (crawl) {
        // if prefix, then webentity just been created, and we want this id, not the old one
        const id = prefix ? head.id : webentity.id
        const depth = CRAWL_DEPTH
        return jsonrpc(serverUrl)('crawl_webentity', [id, depth, false, 'IN', {}, corpusId])
          .then(() => {
            // Broadcast the information that webentity's status has been updated
            dispatch({ type: SET_WEBENTITY_STATUS_SUCCESS, payload: { serverUrl, corpusId, status: 'IN', webentityId: id } })
          })
      }
    })
    .then(() => dispatch({ type: SAVE_ADJUSTED_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, adjust, webentity } }))
    .catch((error) => {
      dispatch({ type: SAVE_ADJUSTED_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, adjust, webentity, error } })
      throw error
    })
}
