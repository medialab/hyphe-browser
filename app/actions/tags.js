// API calls in this file:
// - delete tag: store.rm_webentity_tag_value(webentity_id, "USER", category, value, corpusId)
// - add tag: store.add_webentity_tag_value(webentity_id, "USER", category, value, corpusId)
// - autocomplete : store.get_tag_values("USER", category, corpusId)
// - categories: store.get_tag_categories("USER", corpusId)

import jsonrpc from '../utils/jsonrpc'

import { TAGS_NS } from '../constants'

// get list of tag categories for a given corpusId
export const FETCH_TAGS_CATEGORIES_REQUEST = '§_FETCH_TAGS_CATEGORIES_REQUEST'
export const FETCH_TAGS_CATEGORIES_SUCCESS = '§_FETCH_TAGS_CATEGORIES_SUCCESS'
export const FETCH_TAGS_CATEGORIES_FAILURE = '§_FETCH_TAGS_CATEGORIES_FAILURE'

// get list of tags for a given webentity
export const FETCH_TAGS_REQUEST = '§_FETCH_TAGS_REQUEST'
export const FETCH_TAGS_SUCCESS = '§_FETCH_TAGS_SUCCESS'
export const FETCH_TAGS_FAILURE = '§_FETCH_TAGS_FAILURE'

// add a category
export const ADD_TAGS_CATEGORY = '§_ADD_TAGS_CATEGORY'

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
  return jsonrpc(serverUrl)('store.get_tag_categories', [TAGS_NS, corpusId])
    .then((categories) => {
      dispatch({ type: FETCH_TAGS_CATEGORIES_SUCCESS, payload: { serverUrl, corpusId, categories } })
      return categories
    })
    .catch((error) => { dispatch({ type: FETCH_TAGS_CATEGORIES_FAILURE, payload: { serverUrl, corpusId, error } }) })
}

export const fetchTags = (serverUrl, corpusId) => (dispatch) => {
  dispatch({ type: FETCH_TAGS_REQUEST, payload: { serverUrl, corpusId} })
  return jsonrpc(serverUrl)('store.get_tags', [TAGS_NS, corpusId])
    .then((values) => {
      dispatch({ type: FETCH_TAGS_SUCCESS, payload: { serverUrl, corpusId, values } })
      return values
    })
    .catch((error) => dispatch({ type: FETCH_TAGS_FAILURE, payload: { serverUrl, corpusId, error } }))
}

export const addTagsCategory = (serverUrl, corpusId, webentityId, category) => (dispatch) => {
  dispatch({ type: ADD_TAGS_CATEGORY, payload: { serverUrl, corpusId, category } })
}

export const addTag = (serverUrl, corpusId, category, webentityId, value, updatedValue) => (dispatch) => {
  dispatch({ type: ADD_TAG_REQUEST, payload: { serverUrl, corpusId, category, webentityId, value, updatedValue } })
  return jsonrpc(serverUrl)('store.add_webentity_tag_value', [webentityId, TAGS_NS, category, value, corpusId])
    .then(() => dispatch({ type: ADD_TAG_SUCCESS, payload: { serverUrl, corpusId, category, webentityId, value, updatedValue } }))
    .catch((error) => dispatch({ type: ADD_TAG_FAILURE, payload: { serverUrl, corpusId, category, webentityId, value, updatedValue, error } }))
}

export const removeTag = (serverUrl, corpusId, category, webentityId, value) => (dispatch) => {
  dispatch({ type: REMOVE_TAG_REQUEST, payload: { serverUrl, corpusId, category, webentityId, value } })
  return jsonrpc(serverUrl)('store.rm_webentity_tag_value', [webentityId, TAGS_NS, category, value, corpusId])
    .then(() => dispatch({ type: REMOVE_TAG_SUCCESS, payload: { serverUrl, corpusId, category, webentityId, value } }))
    .catch((error) => dispatch({ type: REMOVE_TAG_FAILURE, payload: { serverUrl, corpusId, category, webentityId, value, error } }))
}
