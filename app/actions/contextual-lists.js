// actions dedicated to populate lists at the bottom of the sidebar

import jsonrpc from '../utils/jsonrpc'

export const FETCH_MOST_LINKED_REQUEST = '§_FETCH_MOST_LINKED_REQUEST'
export const FETCH_MOST_LINKED_SUCCESS = '§_FETCH_MOST_LINKED_SUCCESS'
export const FETCH_MOST_LINKED_FAILURE = '§_FETCH_MOST_LINKED_FAILURE'

export const FETCH_PARENTS_REQUEST = '§_FETCH_PARENTS_REQUEST'
export const FETCH_PARENTS_SUCCESS = '§_FETCH_PARENTS_SUCCESS'
export const FETCH_PARENTS_FAILURE = '§_FETCH_PARENTS_FAILURE'

export const FETCH_SUBS_REQUEST = '§_FETCH_SUBS_REQUEST'
export const FETCH_SUBS_SUCCESS = '§_FETCH_SUBS_SUCCESS'
export const FETCH_SUBS_FAILURE = '§_FETCH_SUBS_FAILURE'

export const SELECT_CONTEXTUAL_LIST = '§_SELECT_CONTEXTUAL_LIST'


export const fetchMostLinked = (serverUrl, corpusId, webentityId) => dispatch => {
  dispatch({ type: FETCH_MOST_LINKED_REQUEST, payload: { serverUrl, corpusId, webentityId } })

  return jsonrpc(serverUrl)('store.get_webentity_mostlinked_pages', [webentityId, 20, corpusId])
    .then(links => dispatch({ type: FETCH_MOST_LINKED_SUCCESS, payload: { serverUrl, corpusId, links } }))
    .catch(error => {
      dispatch({ type: FETCH_MOST_LINKED_FAILURE, payload: { serverUrl, corpusId, error } })
      throw error
    })
}

export const fetchParents = (serverUrl, corpusId, webentityId) => dispatch => {
  dispatch({ type: FETCH_PARENTS_REQUEST, payload: { serverUrl, corpusId, webentityId } })

  return jsonrpc(serverUrl)('store.get_webentity_parentwebentities', [webentityId, corpusId])
    .then(links => dispatch({ type: FETCH_PARENTS_SUCCESS, payload: { serverUrl, corpusId, links } }))
    .catch(error => {
      dispatch({ type: FETCH_PARENTS_FAILURE, payload: { serverUrl, corpusId, error } })
      throw error
    })
}

export const fetchSubs = (serverUrl, corpusId, webentityId) => dispatch => {
  dispatch({ type: FETCH_SUBS_REQUEST, payload: { serverUrl, corpusId, webentityId } })

  return jsonrpc(serverUrl)('store.get_webentity_subwebentities', [webentityId, corpusId])
    .then(links => dispatch({ type: FETCH_SUBS_SUCCESS, payload: { serverUrl, corpusId, links } }))
    .catch(error => {
      dispatch({ type: FETCH_SUBS_FAILURE, payload: { serverUrl, corpusId, error } })
      throw error
    })
}

export const selectContextualList = (selected) => ({ type: SELECT_CONTEXTUAL_LIST, payload: { selected } })
