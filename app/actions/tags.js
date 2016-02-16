// API calls in this file:
// - delete tag: store.rm_webentity_tag_value(webentity_id, "USER", category, value, corpusId)
// - add tag: store.add_webentity_tag_value(webentity_id, "USER", category, value, corpusId)
// - autocomplete : store.get_tag_values("USER", category, corpusId)
// - categories: store.get_tag_categories("USER", corpusId)

import jsonrpc from '../utils/jsonrpc'

// get list of tag categories for a given corpusId
export const FETCH_TAGS_CATEGORIES_REQUEST = '§_FETCH_TAGS_CATEGORIES_REQUEST'
export const FETCH_TAGS_CATEGORIES_SUCCESS = '§_FETCH_TAGS_CATEGORIES_SUCCESS'
export const FETCH_TAGS_CATEGORIES_FAILURE = '§_FETCH_TAGS_CATEGORIES_FAILURE'

// get list of tags for a given webentity
export const FETCH_TAGS_REQUEST = '§_FETCH_TAGS_REQUEST'
export const FETCH_TAGS_SUCCESS = '§_FETCH_TAGS_SUCCESS'
export const FETCH_TAGS_FAILURE = '§_FETCH_TAGS_FAILURE'

// add a category
export const ADD_TAGS_CATEGORY_REQUEST = '§_ADD_TAGS_CATEGORY_REQUEST'
export const ADD_TAGS_CATEGORY_SUCCESS = '§_ADD_TAGS_CATEGORY_SUCCESS'
export const ADD_TAGS_CATEGORY_FAILURE = '§_ADD_TAGS_CATEGORY_FAILURE'

// add a tag
export const ADD_TAG_REQUEST = '§_ADD_TAG_REQUEST'
export const ADD_TAG_SUCCESS = '§_ADD_TAG_SUCCESS'
export const ADD_TAG_FAILURE = '§_ADD_TAG_FAILURE'

// remove a tag
export const REMOVE_TAG_REQUEST = '§_REMOVE_TAG_REQUEST'
export const REMOVE_TAG_SUCCESS = '§_REMOVE_TAG_SUCCESS'
export const REMOVE_TAG_FAILURE = '§_REMOVE_TAG_FAILURE'


export const fetchTagsCategories = (serverUrl, corpusId) => (dispatch) => {
  dispatch({ type: FETCH_TAGS_CATEGORIES_REQUEST, payload: { serverUrl, corpusId } })
  return jsonrpc(serverUrl)('store.get_tag_categories', ['USER', corpusId])
    .then((categories) => {
      dispatch({ type: FETCH_TAGS_CATEGORIES_SUCCESS, payload: { serverUrl, corpusId, categories } })
      return categories
    })
    .catch((error) => {
      dispatch({ type: FETCH_TAGS_CATEGORIES_FAILURE, payload: { serverUrl, corpusId, error } })
    })
}

export const fetchTags = (serverUrl, corpusId, category) => (dispatch) => {
  dispatch({ type: FETCH_TAGS_REQUEST, payload: { serverUrl, corpusId, category } })
  return jsonrpc(serverUrl)('store.get_tag_values', ['USER', category, corpusId])
    .then((res) => {
      console.log('fetchTags', res)
      dispatch({ type: FETCH_TAGS_SUCCESS, payload: { serverUrl, corpusId, category, res } })
      return res
    })
    .catch((error) => dispatch({ type: FETCH_TAGS_FAILURE, payload: { serverUrl, corpusId, category, error } }))
}

export const addTagsCategory = (serverUrl, corpusId, category) => (dispatch) => {
  // This is not a real async action as we don't have a backend service, but let's simulate it is
  // I guess an API should arise soon
  dispatch({ type: ADD_TAGS_CATEGORY_REQUEST, payload: { serverUrl, corpusId, category } })
  return Promise.resolve()
    .then(() => dispatch({ type: ADD_TAGS_CATEGORY_SUCCESS, payload: { serverUrl, corpusId, category } }))
    .catch((error) => dispatch({ type: ADD_TAGS_CATEGORY_FAILURE, payload: { serverUrl, corpusId, category, error } }))
}

export const addTag = (serverUrl, corpusId, category, webentityId, value) => (dispatch) => {
  dispatch({ type: ADD_TAG_REQUEST, payload: { serverUrl, corpusId, category, webentityId, value } })
  return jsonrpc(serverUrl)('store.add_webentity_tag_value', [webentityId, 'USER', category, value, corpusId])
    .then(() => dispatch({ type: ADD_TAG_SUCCESS, payload: { serverUrl, corpusId, category, webentityId, value } }))
    .catch((error) => dispatch({ type: ADD_TAG_FAILURE, payload: { serverUrl, corpusId, category, webentityId, value, error } }))
}

export const removeTag = (serverUrl, corpusId, category, webentityId, value) => (dispatch) => {
  dispatch({ type: REMOVE_TAG_REQUEST, payload: { serverUrl, corpusId, category, webentityId, value } })
  return jsonrpc(serverUrl)('store.rm_webentity_tag_value', [webentityId, 'USER', category, value, corpusId])
    .then(() => dispatch({ type: REMOVE_TAG_SUCCESS, payload: { serverUrl, corpusId, category, webentityId, value } }))
    .catch((error) => dispatch({ type: REMOVE_TAG_FAILURE, payload: { serverUrl, corpusId, category, webentityId, value, error } }))
}
