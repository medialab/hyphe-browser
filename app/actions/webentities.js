// API calls in this file :
// - declare_page
// - set_webentity_homepage

import jsonrpc from '../utils/jsonrpc'

// when opening a page
export const DECLARE_PAGE = '§_DECLARE_PAGE'
export const DECLARE_PAGE_REQUEST = '§_DECLARE_PAGE_REQUEST'
export const DECLARE_PAGE_SUCCESS = '§_DECLARE_PAGE_SUCCESS'
export const DECLARE_PAGE_FAILURE = '§_DECLARE_PAGE_FAILURE'


export const declarePage = (serverUrl, corpusId, url) => (dispatch) => {
  dispatch({ type: DECLARE_PAGE_REQUEST, payload: { serverUrl, corpusId, url } })

  return jsonrpc(serverUrl)('declare_page', [url, corpusId])
    /*.then((res) => {
      if (!res.homepage) {
        // Set homepage to requested URL
        return jsonrpc(serverUrl)('set_webentity_homepage', [res.id, url, corpusId]).then(() => res)
      }
    })*/
    .then((res) => dispatch({ type: DECLARE_PAGE_SUCCESS, payload: { serverUrl, corpusId, url, webentity: res.result } }))
    .catch((error) => dispatch({ type: DECLARE_PAGE_FAILURE, payload: { serverUrl, corpusId, url, error } }))
}
