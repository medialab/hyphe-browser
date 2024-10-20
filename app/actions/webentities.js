// API calls in this file :
// - declare_page
// - store.set_webentity_homepage
// - store.rename_webentity
// - store.declare_webentity_by_lruprefix_as_url
// - store.set_webentity_status
// - store.get_webentity_mostlinked_pages
// - store.get_webentity_parentwebentities
// - store.get_webentity_subwebentities
// - crawl_webentity_with_startmode (webentity_id, depth = 0, phantom_crawl = false, status = 'IN', startmode = 'default', cookies_string = null, phantom_timeouts = {}, corpus = '--hyphe--')

import omit from 'lodash/fp/omit'

import jsonrpc from '../utils/jsonrpc'

import {
  CRAWL_DEPTH,
  NOTICE_WEBENTITY_CREATED,
  NOTICE_WEBENTITY_ADJUST_FAILURE,
  NOTICE_WEBENTITY_CRAWL_STARTED,
  NOTICE_WEBENTITY_CRAWL_CANCELED,
  NOTICE_WEBENTITY_MERGE_SUCCESSFUL,
  NOTICE_WEBENTITY_MERGE_FAILURE,
  NOTICE_WEBENTITY_INFO_TIMEOUT
} from '../constants'

import { showNotification } from './browser'
// import { fetchStack } from './stacks'
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

export const MERGE_WEBENTITY_REQUEST = '§_MERGE_WEBENTITY_REQUEST'
export const MERGE_WEBENTITY_SUCCESS = '§_MERGE_WEBENTITY_SUCCESS'
export const MERGE_WEBENTITY_FAILURE = '§_MERGE_WEBENTITY_FAILURE'
export const ADD_WEBENTITY_PREFIXES_REQUEST = '§_ADD_WEBENTITY_PREFIXES_REQUEST'
export const ADD_WEBENTITY_PREFIXES_SUCCESS = '§_ADD_WEBENTITY_PREFIXES_SUCCESS'
export const ADD_WEBENTITY_PREFIXES_FAILURE = '§_ADD_WEBENTITY_PREFIXES_FAILURE'

// canceling a webentity's crawls
export const CANCEL_WEBENTITY_CRAWLS_REQUEST = '§_CANCEL_WEBENTITY_CRAWLS_REQUEST'
export const CANCEL_WEBENTITY_CRAWLS_SUCCESS = '§_CANCEL_WEBENTITY_CRAWLS_SUCCESS'
export const CANCEL_WEBENTITY_CRAWLS_FAILURE = '§_CANCEL_WEBENTITY_CRAWLS_FAILURE'

// batch webentities actions
export const BATCH_WEBENTITY_ACTIONS_REQUEST = '§_BATCH_WEBENTITY_ACTIONS_REQUEST'
export const BATCH_WEBENTITY_ACTIONS_SUCCESS = '§_BATCH_WEBENTITY_ACTIONS_SUCCESS'
export const BATCH_WEBENTITY_ACTIONS_FAILURE = '§_BATCH_WEBENTITY_ACTIONS_FAILURE'

export const declarePage = ({ serverUrl, corpusId, url }) => (dispatch) => {
  dispatch({ type: DECLARE_PAGE_REQUEST, payload: { serverUrl, corpusId, url } })
  return jsonrpc(serverUrl)('declare_page', {url: url, corpus: corpusId})
    .then(result => result.result || result ) // declare_page used to not return webentity directly but a { result } object, keep for backcompat
    .then((webentity) => {
      dispatch({ type: DECLARE_PAGE_SUCCESS, payload: { serverUrl, corpusId, url, webentity } })
      return webentity
    })
    .catch((error) => dispatch({ type: DECLARE_PAGE_FAILURE, payload: { serverUrl, corpusId, url, error } }))
}

export const setTabWebentity = ({ tabId, webentity }) => (dispatch) => {
  dispatch({ type: SET_TAB_WEBENTITY, payload: { tabId, webentity } })
}

export const setWebentityHomepage = ({ serverUrl, corpusId, homepage, webentityId }) => (dispatch) => {
  dispatch({ type: SET_WEBENTITY_HOMEPAGE_REQUEST, payload: { serverUrl, corpusId, homepage, webentityId } })

  return jsonrpc(serverUrl)('store.set_webentity_homepage', {webentity_id: webentityId, homepage, corpus:corpusId})
    .then(() => dispatch({ type: SET_WEBENTITY_HOMEPAGE_SUCCESS, payload: { serverUrl, corpusId, homepage, webentityId } }))
    .catch((error) => {
      dispatch({ type: SET_WEBENTITY_HOMEPAGE_FAILURE, payload: { serverUrl, corpusId, homepage, webentityId, error } })
      throw error
    })
}

export const setWebentityName = ({ serverUrl, corpusId, name, webentityId }) => (dispatch) => {
  dispatch({ type: SET_WEBENTITY_NAME_REQUEST, payload: { serverUrl, corpusId, name, webentityId } })

  return jsonrpc(serverUrl)('store.rename_webentity', {webentity_id: webentityId, new_name: name, corpus: corpusId})
    .then(() => dispatch({ type: SET_WEBENTITY_NAME_SUCCESS, payload: { serverUrl, corpusId, name, webentityId } }))
    .catch((error) => {
      dispatch({ type: SET_WEBENTITY_NAME_FAILURE, payload: { serverUrl, corpusId, name, webentityId, error } })
      throw error
    })
}

export const setWebentityStatus = ({ serverUrl, corpusId, status, prevStatus,  webentityId }) => (dispatch) => {
  dispatch({ type: SET_WEBENTITY_STATUS_REQUEST, payload: { serverUrl, corpusId, prevStatus, status, webentityId } })

  return jsonrpc(serverUrl)('store.set_webentity_status', {webentity_id: webentityId, status, corpus: corpusId})
    .then(() => dispatch({ type: SET_WEBENTITY_STATUS_SUCCESS, payload: { serverUrl, corpusId, prevStatus, status, webentityId } }))
    .catch((error) => {
      dispatch({ type: SET_WEBENTITY_STATUS_FAILURE, payload: { serverUrl, corpusId, prevStatus, status, webentityId, error } })
      throw error
    })
}

export const addWebentityPrefixes = ({ serverUrl, corpusId, webentityId, prefixes }) => (dispatch) => {
  dispatch({ type: ADD_WEBENTITY_PREFIXES_REQUEST, payload: { serverUrl, corpusId, webentityId, prefixes } })

  return jsonrpc(serverUrl)('store.add_webentity_lruprefixes', {webentity_id: webentityId, lru_prefixes: prefixes, corpus: corpusId})
    .then((res) => {
      dispatch({ type: ADD_WEBENTITY_PREFIXES_SUCCESS, payload: { serverUrl, corpusId, webentityId, prefixes } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_MERGE_SUCCESSFUL, messageId: 'webentity-info-merge-successful-notification', timeout: NOTICE_WEBENTITY_INFO_TIMEOUT }))
      return res
    })
    .catch((error) => {
      dispatch({ type: ADD_WEBENTITY_PREFIXES_FAILURE, payload: { serverUrl, corpusId, webentityId, prefixes, error } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_MERGE_FAILURE, messageId: 'webentity-info-merge-failure-notification', type: 'warning' }))
      throw error
    })
}

export const createWebentity = ({ serverUrl, corpusId, prefixUrl, name = null, homepage = null, tabId = null }) => (dispatch) => {
  dispatch({ type: CREATE_WEBENTITY_REQUEST, payload: { serverUrl, corpusId, name, prefixUrl } })
  return jsonrpc(serverUrl)('store.declare_webentity_by_lruprefix_as_url', {url: prefixUrl, name, status: null, startpages: null, lruVariations: true, corpus: corpusId})
    .then((webentity) => {
      dispatch({ type: CREATE_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, webentity } })
      if (tabId) {
        dispatch(setTabWebentity({ tabId, webentity }))
      }
      return webentity
    })
    .then((webentity) => {
      if (homepage) {
        return dispatch(setWebentityHomepage({ serverUrl, corpusId, homepage, webentityId: webentity.id })).then(() => Object.assign(webentity, { homepage }))
      } else {
        return webentity
      }
    })
    .catch((error) => {
      dispatch({ type: CREATE_WEBENTITY_FAILURE, payload: { serverUrl, corpusId, name, prefixUrl, error: error.toString() } })
      throw error
    })
}

export const fetchMostLinked = ({ serverUrl, corpusId, webentity }) => dispatch => {
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

const STATUSES_ORDER = {
  'IN': 0,
  'UNDECIDED': 1,
  'DISCOVERED': 2,
  'OUT': 3
}

function sortEntitiesByStatusAndName (a, b) {
  if (a.status !== b.status) {
    return STATUSES_ORDER[a.status] - STATUSES_ORDER[b.status]
  }
  const aName = a.name.toLowerCase(),
    bName = b.name.toLowerCase()
  if (aName > bName) {
    return 1
  } else if (aName < bName) {
    return -1
  }
  return 0
}

export const fetchReferrers = ({ serverUrl, corpusId, webentity }) => dispatch => {
  dispatch({ type: FETCH_REFERRERS_REQUEST, payload: { serverUrl, corpusId, webentity } })

  return jsonrpc(serverUrl)('store.get_webentity_referrers', {webentity_id: webentity.id, count: -1, page: 0, light: false, semilight: false, corpus: corpusId})
    .then(refs => {
      const referrers = refs.sort(sortEntitiesByStatusAndName)
      dispatch({ type: FETCH_REFERRERS_SUCCESS, payload: { serverUrl, corpusId, webentity, referrers } })
      dispatch(declarePage({ serverUrl, corpusId, url: webentity.homepage }))
    })
    .catch(error => {
      dispatch({ type: FETCH_REFERRERS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchReferrals = ({ serverUrl, corpusId, webentity }) => dispatch => {
  dispatch({ type: FETCH_REFERRALS_REQUEST, payload: { serverUrl, corpusId, webentity } })

  return jsonrpc(serverUrl)('store.get_webentity_referrals', {webentity_id: webentity.id, count: -1, page: 0, light: false, semilight: false, corpus: corpusId})
    .then(refs => {
      const referrals = refs.sort(sortEntitiesByStatusAndName)
      dispatch({ type: FETCH_REFERRALS_SUCCESS, payload: { serverUrl, corpusId, webentity, referrals } })
      dispatch(declarePage({ serverUrl, corpusId, url: webentity.homepage }))
    })
    .catch(error => {
      dispatch({ type: FETCH_REFERRALS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchParents = ({ serverUrl, corpusId, webentity }) => dispatch => {
  dispatch({ type: FETCH_PARENTS_REQUEST, payload: { serverUrl, corpusId, webentity } })

  return jsonrpc(serverUrl)('store.get_webentity_parentwebentities', {webentity_id: webentity.id, light: false, corpus: corpusId})
    .then(parents => dispatch({ type: FETCH_PARENTS_SUCCESS, payload: { serverUrl, corpusId, webentity, parents } }))
    .catch(error => {
      dispatch({ type: FETCH_PARENTS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchChildren = ({ serverUrl, corpusId, webentity }) => dispatch => {
  dispatch({ type: FETCH_SUBS_REQUEST, payload: { serverUrl, corpusId, webentity } })

  return jsonrpc(serverUrl)('store.get_webentity_subwebentities', {webentity_id: webentity.id, light: false, corpus: corpusId})
    .then(children => dispatch({ type: FETCH_SUBS_SUCCESS, payload: { serverUrl, corpusId, webentity, children } }))
    .catch(error => {
      dispatch({ type: FETCH_SUBS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      throw error
    })
}

export const fetchTLDs = ({ serverUrl, corpusId }) => dispatch => {
  dispatch({ type: FETCH_TLDS_REQUEST, payload: { serverUrl, corpusId } })

  return jsonrpc(serverUrl)('get_corpus_tlds', {corpus: corpusId})
    .then(tlds => dispatch({ type: FETCH_TLDS_SUCCESS, payload: { serverUrl, corpusId, tlds } }))
    .catch(error => {
      dispatch({ type: FETCH_TLDS_FAILURE, payload: { serverUrl, corpusId, error } })
      throw error
    })
}

export const setAdjustWebentity = ({ webentityId, info }) => ({ type: ADJUST_WEBENTITY, payload: { id: webentityId, info } })
export const showAdjustWebentity = ({ webentityId, crawl = false, createNewEntity = true }) => setAdjustWebentity({ webentityId, info:{ name: null, homepage: null, prefix: null, crawl, createNewEntity } })
export const hideAdjustWebentity = (webentityId) => setAdjustWebentity({ webentityId, info: null })

export const saveAdjustedWebentity = ({ serverUrl, corpusId, webentity, adjust, tabId }) => (dispatch, getState) => {
  dispatch({ type: SAVE_ADJUSTED_WEBENTITY_REQUEST, payload: { serverUrl, corpusId, adjust, webentity } })

  const { prefix, homepage, name, crawl } = adjust
  const operations = []
  const prefixChanged = prefix && !webentity.prefixes.some(p => prefix === p)

  if (prefixChanged) {
    // Create a new web entity
    // Set its name and homepage at the same time + refresh tab by passing tab id
    // Note: since https://trello.com/c/74rYBHON/130-urlbar-creer-une-nouvelle-webentite-pour-un-prefixe
    // name and homepage are not set here (but where?)
    const createWebentityPromise = createWebentity({ serverUrl, corpusId, prefixUrl: lruToUrl(prefix), name, homepage, tabId })(dispatch)
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
      operations.push(setWebentityHomepage({ serverUrl, corpusId, homepage,webentityId: webentity.id })(dispatch))
    }
    if (name && name !== webentity.name) {
      operations.push(setWebentityName({ serverUrl, corpusId, name,webentityId: webentity.id })(dispatch))
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
        const { options } = getState().corpora.status.corpus
        const depth = options && options.depthHypheBro !== undefined ? options.depthHypheBro : CRAWL_DEPTH
        const cookies = (getState().tabs.activeTab.cookies || []).map(c => c.name + '=' + c.value).join('; ') || null

        return jsonrpc(serverUrl)('crawl_webentity_with_startmode', {webentity_id: id, depth, phantom_crawl: false, status: 'IN', startmode: 'default', cookies_string: cookies, phantom_timeouts: {}, save_startpages: true, corpus: corpusId})
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

export const mergeWebentities = ({ serverUrl, corpusId, webentityId, redirectWebentity, type }) => (dispatch) => {
  const { id: redirectWebentityId } = redirectWebentity
  dispatch({ type: MERGE_WEBENTITY_REQUEST, payload: { serverUrl, corpusId, webentityId, redirectWebentityId } })
  return jsonrpc(serverUrl)('store.merge_webentity_into_another', {old_webentity_id: webentityId, good_webentity_id: redirectWebentityId, include_tags: true, include_home_and_startpages_as_startpages: false, include_name_and_status: false, corpus: corpusId})
    .then(() => {
      dispatch({ type: MERGE_WEBENTITY_SUCCESS, payload: { serverUrl, corpusId, webentityId, redirectWebentityId } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_MERGE_SUCCESSFUL, messageId: 'webentity-info-merge-successful-notification', timeout: NOTICE_WEBENTITY_INFO_TIMEOUT }))
      if (type === 'referrers') {
        dispatch(fetchReferrers({ serverUrl, corpusId, webentity: redirectWebentity }))
      }
      if (type === 'referrals') {
        dispatch(fetchReferrals({ serverUrl, corpusId, webentity: redirectWebentity }))
      }
      //TODO : apply to stack merged webentity the attributes of the host
    })
    .catch((error) => {
      dispatch({ type: MERGE_WEBENTITY_FAILURE, payload: { serverUrl, corpusId, webentityId, redirectWebentityId, error } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_MERGE_FAILURE, messageId: 'webentity-info-merge-failure-notification', type: 'warning' }))
      throw error
    })
}

export const cancelWebentityCrawls = ({ serverUrl, corpusId, webentityId }) => (dispatch) => {
  dispatch({ type: CANCEL_WEBENTITY_CRAWLS_REQUEST, payload: { serverUrl, corpusId, webentityId } })

  return jsonrpc(serverUrl)('cancel_webentity_jobs', {webentity_id: webentityId, corpus: corpusId})
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
  dispatch({ type: BATCH_WEBENTITY_ACTIONS_REQUEST, payload: { actions, serverUrl, corpusId, webentity, selectedList } })
  const requestActions = actions.map((action) => {
    if (action.type === 'MERGE') {
      // return jsonrpc(serverUrl)('store.merge_webentity_into_another', {old_webentity_id: action.id, good_webentity_id: webentity.id, include_tags: true, include_home_and_startpages_as_startpages: false, include_name_and_status: false, corpus: corpusId})
      jsonrpc(serverUrl)('store.add_webentity_lruprefixes', {webentity_id: webentity.id, lru_prefixes: action.prefixes, corpus: corpusId})
    } else {
      return dispatch(setWebentityStatus({ serverUrl, corpusId, prevStatus: action.prevStatus, status: action.type, webentityId: action.id }))
    }
  })
  return Promise.all(requestActions)
    .then(() => {
      dispatch({ type: BATCH_WEBENTITY_ACTIONS_SUCCESS, payload: { actions, serverUrl, corpusId, webentity } })
      if (actions[0].type === 'MERGE') {
        dispatch(showNotification({
          id: NOTICE_WEBENTITY_MERGE_SUCCESSFUL,
          messageId: 'batch-merge-successful-notification',
          messageValues: { count: actions.length },
          timeout: NOTICE_WEBENTITY_INFO_TIMEOUT
        }))
      }
    })
    .catch((error) => {
      dispatch({ type: BATCH_WEBENTITY_ACTIONS_FAILURE, payload: { serverUrl, corpusId, webentity, error } })
      dispatch(showNotification({ id: NOTICE_WEBENTITY_MERGE_FAILURE, messageId: 'webentity-info-merge-failure-notification', type: 'warning' }))
    })
}
