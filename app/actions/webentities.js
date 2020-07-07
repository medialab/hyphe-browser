// API calls in this file :
// - declare_page
// - store.set_webentity_homepage
// - store.rename_webentity
// - store.declare_webentity_by_lruprefix_as_url
// - store.set_webentity_status
// - store.get_webentity_mostlinked_pages
// - store.get_webentity_parentwebentities
// - store.get_webentity_subwebentities
// - crawl_webentity (webentity_id, depth = 0, phantom_crawl = false, status = 'IN', phantom_timeouts = {}, corpus = '--hyphe--')

import omit from 'lodash/fp/omit'

import jsonrpc from '../utils/jsonrpc'

import {
  CRAWL_DEPTH,
  USED_STACKS,
  NOTICE_WEBENTITY_CREATED,
  NOTICE_WEBENTITY_ADJUST_FAILURE,
  NOTICE_WEBENTITY_CRAWL_STARTED,
  NOTICE_WEBENTITY_CRAWL_CANCELED,
  NOTICE_WEBENTITY_MERGE_SUCCESSFUL,
  NOTICE_WEBENTITY_MERGE_FAILURE,
  NOTICE_WEBENTITY_INFO_TIMEOUT
} from '../constants'

import { showNotification } from './browser'
import { fetchStack } from './stacks'
import { addTag } from './tags'
import { lruToUrl } from '../utils/lru'

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

export const SET_WEBENTITY_CRAWLING_STATUS = '§_SET_WEBENTITY_CRAWLING_STATUS'

// creating webentity
export const CREATE_WEBENTITY_REQUEST = '§_CREATE_WEBENTITY_REQUEST'
export const CREATE_WEBENTITY_SUCCESS = '§_CREATE_WEBENTITY_SUCCESS'
export const CREATE_WEBENTITY_FAILURE = '§_CREATE_WEBENTITY_FAILURE'

// fetching webentity's context
export const FETCH_MOST_LINKED_REQUEST = '§_FETCH_MOST_LINKED_REQUEST'
export const FETCH_MOST_LINKED_SUCCESS = '§_FETCH_MOST_LINKED_SUCCESS'
export const FETCH_MOST_LINKED_FAILURE = '§_FETCH_MOST_LINKED_FAILURE'

export const FETCH_PAGINATE_PAGES_REQUEST = '§_FETCH_PAGINATE_PAGES_REQUEST'
export const FETCH_PAGINATE_PAGES_SUCCESS = '§_FETCH_PAGINATE_PAGES_SUCCESS'
export const INIT_PAGINATE_PAGES_SUCCESS = '§_INIT_PAGINATE_PAGES_SUCCESS'
export const FETCH_PAGINATE_PAGES_FAILURE = '§_FETCH_PAGINATE_PAGES_FAILURE'

export const FETCH_REFERRERS_REQUEST = '§_FETCH_REFERRERS_REQUEST'
export const FETCH_REFERRERS_SUCCESS = '§_FETCH_REFERRERS_SUCCESS'
export const FETCH_REFERRERS_FAILURE = '§_FETCH_REFERRERS_FAILURE'


export const FETCH_REFERRALS_REQUEST = '§_FETCH_REFERRALS_REQUEST'
export const FETCH_REFERRALS_SUCCESS = '§_FETCH_REFERRALS_SUCCESS'
export const FETCH_REFERRALS_FAILURE = '§_FETCH_REFERRALS_FAILURE'

export const FETCH_PARENTS_REQUEST = '§_FETCH_PARENTS_REQUEST'
export const FETCH_PARENTS_SUCCESS = '§_FETCH_PARENTS_SUCCESS'
export const FETCH_PARENTS_FAILURE = '§_FETCH_PARENTS_FAILURE'

export const FETCH_SUBS_REQUEST = '§_FETCH_SUBS_REQUEST'
export const FETCH_SUBS_SUCCESS = '§_FETCH_SUBS_SUCCESS'
export const FETCH_SUBS_FAILURE = '§_FETCH_SUBS_FAILURE'

// fetching TLDs
export const FETCH_TLDS_REQUEST = '§_FETCH_TLDS_REQUEST'
export const FETCH_TLDS_SUCCESS = '§_FETCH_TLDS_SUCCESS'
export const FETCH_TLDS_FAILURE = '§_FETCH_TLDS_FAILURE'

// attaching a fetched webentity to an open tab
export const SET_TAB_WEBENTITY = '§_SET_TAB_WEBENTITY'

// adjust webentity
export const ADJUST_WEBENTITY = '§_ADJUST_WEBENTITY' // false => close, true => open with defaults, object => update fields
export const SAVE_ADJUSTED_WEBENTITY_REQUEST = '§_SAVE_ADJUSTED_WEBENTITY_REQUEST'
export const SAVE_ADJUSTED_WEBENTITY_SUCCESS = '§_SAVE_ADJUSTED_WEBENTITY_SUCCESS'
export const SAVE_ADJUSTED_WEBENTITY_FAILURE = '§_SAVE_ADJUSTED_WEBENTITY_FAILURE'

export const MERGE_WEBENTITY = '§_MERGE_WEBENTITY'
export const STOP_MERGE_WEBENTITY = '§_STOP_MERGE_WEBENTITY'
export const MERGE_WEBENTITY_REQUEST = '§_MERGE_WEBENTITY_REQUEST'
export const MERGE_WEBENTITY_SUCCESS = '§_MERGE_WEBENTITY_SUCCESS'
export const MERGE_WEBENTITY_FAILURE = '§_MERGE_WEBENTITY_FAILURE'

// canceling a webentity's crawls
export const CANCEL_WEBENTITY_CRAWLS_REQUEST = '§_CANCEL_WEBENTITY_CRAWLS_REQUEST'
export const CANCEL_WEBENTITY_CRAWLS_SUCCESS = '§_CANCEL_WEBENTITY_CRAWLS_SUCCESS'
export const CANCEL_WEBENTITY_CRAWLS_FAILURE = '§_CANCEL_WEBENTITY_CRAWLS_FAILURE'

// batch webentities actions
export const BATCH_WEBENTITY_ACTIONS_REQUEST = '§_BATCH_WEBENTITY_ACTIONS_REQUEST'
export const BATCH_WEBENTITY_ACTIONS_SUCCESS = '§_BATCH_WEBENTITY_ACTIONS_SUCCESS'
export const BATCH_WEBENTITY_ACTIONS_FAILURE = '§_BATCH_WEBENTITY_ACTIONS_FAILURE'

export const declarePage = (serverUrl, corpusId, url, tabId = null) => (dispatch, getState) => {
  dispatch({ type: DECLARE_PAGE_REQUEST, payload: { serverUrl, corpusId, url } })
  return jsonrpc(serverUrl)('declare_page', [url, corpusId])
    .then(result => result.result || result ) // declare_page used to not return webentity directly but a { result } object, keep for backcompat
    .then((webentity) => {
      dispatch({ type: DECLARE_PAGE_SUCCESS, payload: { serverUrl, corpusId, url, webentity } })
      if (tabId) {
        dispatch(setTabWebentity(tabId, webentity))
        const state = getState()
        if (state.webentities.merges[tabId] && state.webentities.merges[tabId].mergeable) {
          dispatch(setMergeWebentity(tabId, state.webentities.merges[tabId].mergeable, webentity, 'redirect'))
        }
      }
      return webentity
    })
    .catch((error) => dispatch({ type: DECLARE_PAGE_FAILURE, payload: { serverUrl, corpusId, url, error } }))
}

export const setTabWebentity = (tabId, webentity) => (dispatch) => {
  dispatch({ type: SET_TAB_WEBENTITY, payload: { tabId, webentity } })
}

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
  return jsonrpc(serverUrl)('store.declare_webentity_by_lruprefix_as_url', [prefixUrl, name, null, null, true, corpusId])
    .then((webentity) => {
      dispatch({ type: CREATE_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, webentity } })
      if (tabId) {
        dispatch(setTabWebentity(tabId, webentity))
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
      dispatch({ type: CREATE_WEBENTITY_FAILURE, payload: { serverUrl, corpusId, name, prefixUrl, error: error.toString() } })
      throw error
    })
}

export const fetchMostLinked = (serverUrl, corpusId, webentity) => dispatch => {
  dispatch({ type: FETCH_MOST_LINKED_REQUEST, payload: { serverUrl, corpusId, webentity } })
  const params = {
    webentity_id: webentity.id,
    corpus: corpusId,
    npages: 20,
  }
  return jsonrpc(serverUrl)('store.get_webentity_mostlinked_pages', params)
    .then(mostLinked => dispatch({ type: FETCH_MOST_LINKED_SUCCESS, payload: { serverUrl, corpusId, webentity, mostLinked } }))
    .catch(error => {
      dispatch({ type: FETCH_MOST_LINKED_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchPaginatePages = ({ serverUrl, corpusId, webentity, token }) => dispatch => {
  dispatch({ type: FETCH_PAGINATE_PAGES_REQUEST, payload: { serverUrl, corpusId, webentity } })
  const params = {
    webentity_id: webentity.id,
    corpus: corpusId,
    pagination_token: token,
    count: 200
  }
  return jsonrpc(serverUrl)(
    'store.paginate_webentity_pages',
    params
  ).then((res) => {
    if (token) {
      dispatch({
        type: FETCH_PAGINATE_PAGES_SUCCESS,
        payload: { serverUrl, corpusId, webentity, pages: res.pages, token: res.token }
      })
    } else {
      dispatch({
        type: INIT_PAGINATE_PAGES_SUCCESS,
        payload: { serverUrl, corpusId, webentity, pages: res.pages, token: res.token }
      })
    }
  }).catch((error) => dispatch({
    type: FETCH_PAGINATE_PAGES_FAILURE,
    payload: { serverUrl, corpusId, webentity, token, error }
  }))
}


export const fetchReferrers = (serverUrl, corpusId, webentity) => dispatch => {
  dispatch({ type: FETCH_REFERRERS_REQUEST, payload: { serverUrl, corpusId, webentity } })

  return jsonrpc(serverUrl)('store.get_webentity_referrers', [webentity.id, -1, 0, false, false, corpusId])
    .then(referrers => dispatch({ type: FETCH_REFERRERS_SUCCESS, payload: { serverUrl, corpusId, webentity, referrers } }))
    .catch(error => {
      dispatch({ type: FETCH_REFERRERS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchReferrals = (serverUrl, corpusId, webentity) => dispatch => {
  dispatch({ type: FETCH_REFERRALS_REQUEST, payload: { serverUrl, corpusId, webentity } })

  return jsonrpc(serverUrl)('store.get_webentity_referrals', [webentity.id, -1, 0, false, false, corpusId])
    .then(referrals => dispatch({ type: FETCH_REFERRALS_SUCCESS, payload: { serverUrl, corpusId, webentity, referrals } }))
    .catch(error => {
      dispatch({ type: FETCH_REFERRALS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchParents = (serverUrl, corpusId, webentity) => dispatch => {
  dispatch({ type: FETCH_PARENTS_REQUEST, payload: { serverUrl, corpusId, webentity } })

  return jsonrpc(serverUrl)('store.get_webentity_parentwebentities', [webentity.id, false, corpusId])
    .then(parents => dispatch({ type: FETCH_PARENTS_SUCCESS, payload: { serverUrl, corpusId, webentity, parents } }))
    .catch(error => {
      dispatch({ type: FETCH_PARENTS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchChildren = (serverUrl, corpusId, webentity) => dispatch => {
  dispatch({ type: FETCH_SUBS_REQUEST, payload: { serverUrl, corpusId, webentity } })

  return jsonrpc(serverUrl)('store.get_webentity_subwebentities', [webentity.id, false, corpusId])
    .then(children => dispatch({ type: FETCH_SUBS_SUCCESS, payload: { serverUrl, corpusId, webentity, children } }))
    .catch(error => {
      dispatch({ type: FETCH_SUBS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchTLDs = (serverUrl, corpusId) => dispatch => {
  dispatch({ type: FETCH_TLDS_REQUEST, payload: { serverUrl, corpusId } })

  return jsonrpc(serverUrl)('get_corpus_tlds', [corpusId])
    .then(tlds => dispatch({ type: FETCH_TLDS_SUCCESS, payload: { serverUrl, corpusId, tlds } }))
    .catch(error => {
      dispatch({ type: FETCH_TLDS_FAILURE, payload: { serverUrl, corpusId, error } })
      throw error
    })
}

export const setAdjustWebentity = (webentityId, info) => ({ type: ADJUST_WEBENTITY, payload: { id: webentityId, info } })
export const showAdjustWebentity = (webentityId, crawl = false, createNewEntity = true) => setAdjustWebentity(webentityId, { name: null, homepage: null, prefix: null, crawl, createNewEntity })
export const hideAdjustWebentity = (webentityId) => setAdjustWebentity(webentityId, null)

export const saveAdjustedWebentity = (serverUrl, corpusId, webentity, adjust, tabId) => (dispatch) => {
  dispatch({ type: SAVE_ADJUSTED_WEBENTITY_REQUEST, payload: { serverUrl, corpusId, adjust, webentity } })

  const { prefix, homepage, name, crawl } = adjust
  const operations = []
  const prefixChanged = prefix && !webentity.prefixes.some(p => prefix === p)

  if (prefixChanged) {
    // Create a new web entity
    // Set its name and homepage at the same time + refresh tab by passing tab id
    // Note: since https://trello.com/c/74rYBHON/130-urlbar-creer-une-nouvelle-webentite-pour-un-prefixe
    // name and homepage are not set here (but where?)
    const createWebentityPromise = createWebentity(serverUrl, corpusId, lruToUrl(prefix), name, homepage, tabId)(dispatch)
    operations.push(createWebentityPromise)
    if (adjust.copy.tags || adjust.copy.notes) {
      // Ca devrais fonctionner mais non
      // const saveTags = createWebentityPromise.then(newWebentity =>
      //   transform(webentity.tags.USER, (sequentiel, tags, category) =>
      //     transform(tags, (sequentiel, tag) => sequentiel.then(() =>
      //       addTag(serverUrl, corpusId, category, newWebentity.id, tag)(dispatch)
      //     ), sequentiel),
      //   Promise.resolve())
      // )
      let filteredTags = webentity.tags.USER
      if (adjust.copy.tags === false) {
        filteredTags = { FREETAGS: webentity.tags.USER.FREETAGS }
      }
      if (adjust.copy.notes === false) {
        filteredTags = omit('FREETAGS', webentity.tags.USER)
      }
      const categories = Object.entries(filteredTags)
      const saveTags = createWebentityPromise.then(newWebentity => {
        let sequentiel = Promise.resolve()
        for (let index = 0; index < categories.length; index++) {
          const [category, tags] = categories[index]
          for (let k = 0; k < tags.length; k++) {
            const tag = tags[k]
            sequentiel = sequentiel.then(() =>
              addTag(serverUrl, corpusId, category, newWebentity.id, tag)(dispatch)
            )
          }
        }
        return sequentiel
      })
      operations.push(saveTags)
    }
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
      if (prefixChanged && head.created) {
        dispatch(showNotification({ id: NOTICE_WEBENTITY_CREATED, messageId: 'webentity-info-created-notification', timeout: NOTICE_WEBENTITY_INFO_TIMEOUT }))
      }
      if (crawl) {
        // if prefixChanged, then webentity just been created, and we want this id, not the old one
        const id = prefixChanged ? head.id : webentity.id
        const depth = CRAWL_DEPTH
        return jsonrpc(serverUrl)('crawl_webentity', [id, depth, false, 'IN', {}, corpusId])
          .then(() => {
            // Broadcast the information that webentity's status has been updated
            dispatch({ type: SET_WEBENTITY_STATUS_SUCCESS, payload: { serverUrl, corpusId, status: 'IN', webentityId: id } })
            dispatch({ type: SET_WEBENTITY_CRAWLING_STATUS, payload: { crawling_status: 'PENDING', webentityId: id } })
            dispatch(showNotification({ id: NOTICE_WEBENTITY_CRAWL_STARTED, messageId: 'webentity-info-crawl-started-notification', timeout: NOTICE_WEBENTITY_INFO_TIMEOUT }))
          })
      }
    })
    .then(() => dispatch({ type: SAVE_ADJUSTED_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, adjust, webentity } }))
    .catch((error) => {
      dispatch({ type: SAVE_ADJUSTED_WEBENTITY_FAILURE, payload: { serverUrl, corpusId, adjust, webentity, error: error.toString() } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_ADJUST_FAILURE, messageId: 'webentity-info-adjust-failure-notification', type: 'warning' }))
      throw error
    })
}

export const setMergeWebentity = (tabId, mergeable, host, type = 'redirect') => ({ type: MERGE_WEBENTITY, payload: { tabId, mergeable, host, type } })
export const unsetMergeWebentity = (tabId) => ({ type: STOP_MERGE_WEBENTITY, payload: { tabId } })

export const mergeWebentities = (serverUrl, corpusId, tabId, mergeableId, webentity, type) => (dispatch) => {
  const { id: hostId } = webentity
  dispatch({ type: MERGE_WEBENTITY_REQUEST, payload: { serverUrl, corpusId, mergeableId, hostId } })
  return jsonrpc(serverUrl)('store.merge_webentity_into_another', [mergeableId, hostId, true, false, false, corpusId])
    .then(() => {
      dispatch({ type: MERGE_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, mergeableId, hostId } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_MERGE_SUCCESSFUL, messageId: 'webentity-info-merge-successful-notification', timeout: NOTICE_WEBENTITY_INFO_TIMEOUT }))
      if (type === 'referrers') {
        dispatch(fetchReferrers(serverUrl, corpusId, webentity))
      }
      if (type === 'referrals') {
        dispatch(fetchReferrals(serverUrl, corpusId, webentity))
      }
      dispatch(unsetMergeWebentity(tabId))
      //TODO : apply to stack merged webentity the attributes of the host
    })
    .catch((error) => {
      dispatch({ type: MERGE_WEBENTITY_FAILURE, payload: { serverUrl, corpusId, mergeableId, hostId, error } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_MERGE_FAILURE, messageId: 'webentity-info-merge-failure-notification', type: 'warning' }))
      throw error
    })
}

export const cancelWebentityCrawls = (serverUrl, corpusId, webentityId) => (dispatch) => {
  dispatch({ type: CANCEL_WEBENTITY_CRAWLS_REQUEST, payload: { serverUrl, corpusId, webentityId } })

  return jsonrpc(serverUrl)('cancel_webentity_jobs', [webentityId, corpusId])
    .then(() => {
      dispatch({ type: CANCEL_WEBENTITY_CRAWLS_SUCCESS, payload: { serverUrl, corpusId, webentityId } })
      dispatch({ type: SET_WEBENTITY_CRAWLING_STATUS, payload: { crawling_status: 'CANCELED', webentityId } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_CRAWL_CANCELED, messageId: 'webentity-info-crawl-canceled-notification', timeout: NOTICE_WEBENTITY_INFO_TIMEOUT }))
    })
    .catch((error) => {
      dispatch({ type: CANCEL_WEBENTITY_CRAWLS_FAILURE, payload: { serverUrl, corpusId, webentityId, error } })
      throw error
    })
}

export const batchWebentityActions = ({ actions, serverUrl, corpusId, webentity, selectedList }) => (dispatch) => {
  dispatch({ type: BATCH_WEBENTITY_ACTIONS_REQUEST, payload: { actions, serverUrl, corpusId, webentity } })
  const requestActions = actions.map((action) => {
    if (action.type === 'MERGE') {
      return jsonrpc(serverUrl)('store.merge_webentity_into_another', [action.id, webentity.id, true, false, false, corpusId])
    } else {
      return jsonrpc(serverUrl)('store.set_webentity_status', [action.id, action.type, corpusId])
    }
  })
  return Promise.all(requestActions)
    .then(() => {
      const findStack = USED_STACKS.find((stack) => stack.id === selectedList)
      if (findStack) {
        return dispatch(fetchStack(serverUrl, corpusId, selectedList))
      }
      if (selectedList === 'referrers') {
        return dispatch(fetchReferrers(serverUrl, corpusId, webentity))
      }
      if (selectedList === 'referrals') {
        return dispatch(fetchReferrals(serverUrl, corpusId, webentity))
      }
    })
    .then(() => {
      dispatch({ type: BATCH_WEBENTITY_ACTIONS_SUCCESS, payload: { actions, serverUrl, corpusId, webentity } })
    })
    .catch((error) => {
      dispatch({ type: BATCH_WEBENTITY_ACTIONS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
    })
}
