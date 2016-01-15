// API calls in this file :
// - declare_page
// - store.set_webentity_homepage

import jsonrpc from '../utils/jsonrpc'

import { createAction } from 'redux-actions'

// adding a page to corpus
export const DECLARE_PAGE = '§_DECLARE_PAGE'
export const DECLARE_PAGE_REQUEST = '§_DECLARE_PAGE_REQUEST'
export const DECLARE_PAGE_SUCCESS = '§_DECLARE_PAGE_SUCCESS'
export const DECLARE_PAGE_FAILURE = '§_DECLARE_PAGE_FAILURE'

// attaching a fetched webentity to an open tab
export const SET_TAB_WEBENTITY = '§_SET_TAB_WEBENTITY'

export const declarePage = (serverUrl, corpusId, url, tabId = null) => (dispatch) => {
  dispatch({ type: DECLARE_PAGE_REQUEST, payload: { serverUrl, corpusId, url } })

  return jsonrpc(serverUrl)('declare_page', [url, corpusId])
    .then(({ result }) => result)
    .then((webentity) => {
      if (!webentity.homepage) {
        // Set homepage to requested URL if not defined yet
        return jsonrpc(serverUrl)('store.set_webentity_homepage', [webentity.id, url, corpusId]).then(() => {
          webentity.homepage = url
          return webentity
        })
      } else {
        return webentity
      }
    })
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
