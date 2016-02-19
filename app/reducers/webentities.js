import { Set, Map, fromJS } from 'immutable'
import createReducer from '../utils/create-reducer'
import {
  DECLARE_PAGE_SUCCESS,
  SET_WEBENTITY_HOMEPAGE_REQUEST,
  SET_WEBENTITY_HOMEPAGE_SUCCESS,
  SET_WEBENTITY_HOMEPAGE_FAILURE,
  SET_WEBENTITY_NAME_REQUEST,
  SET_WEBENTITY_NAME_SUCCESS,
  SET_WEBENTITY_NAME_FAILURE,
  SET_WEBENTITY_STATUS_REQUEST,
  SET_WEBENTITY_STATUS_SUCCESS,
  SET_WEBENTITY_STATUS_FAILURE,
  SET_TAB_WEBENTITY,
  CREATE_WEBENTITY_SUCCESS,
  ADJUST_WEBENTITY
  // Note we don't subscribe to SAVE_ADJUSTED_WEBENTITY_* because we're already plugged to its sub-actions
} from '../actions/webentities'
import { SELECT_CORPUS } from '../actions/corpora'
import {
  ADD_TAG_REQUEST,
  ADD_TAG_SUCCESS,
  ADD_TAG_FAILURE,
  REMOVE_TAG_REQUEST,
  REMOVE_TAG_SUCCESS,
  REMOVE_TAG_FAILURE
} from '../actions/tags'

const initialState = Map({
  webentities: Map(), // id → WebEntity
  tabs: Map(), // tabId → webEntityId
  adjustments: Map() // webEntityId → adjustment { name, homepage, prefix, crawl }
})


export default createReducer(initialState, {

  [DECLARE_PAGE_SUCCESS]: (state, { webentity }) => state.setIn(['webentities', webentity.id], immutableWebentity(webentity)),

  ...optimisticUpdateWebentity(
    'homepage',
    SET_WEBENTITY_HOMEPAGE_REQUEST,
    SET_WEBENTITY_HOMEPAGE_SUCCESS,
    SET_WEBENTITY_HOMEPAGE_FAILURE
  ),

  ...optimisticUpdateWebentity(
    'name',
    SET_WEBENTITY_NAME_REQUEST,
    SET_WEBENTITY_NAME_SUCCESS,
    SET_WEBENTITY_NAME_FAILURE
  ),

  ...optimisticUpdateWebentity(
    'status',
    SET_WEBENTITY_STATUS_REQUEST,
    SET_WEBENTITY_STATUS_SUCCESS,
    SET_WEBENTITY_STATUS_FAILURE
  ),

  // (Optimistically) add tag
  [ADD_TAG_REQUEST]: updateWebentity((webentity, { category, value, updatedValue }) => {
    const oldTags = webentity.getIn(['tags', 'USER', category]) || Set()
    const newTags = oldTags.withMutations((tags) => tags.remove(updatedValue).add(value))
    return Map().withMutations((m) => m
      .set('tags_' + category + '_prev', oldTags)
      .setIn(['tags', 'USER', category], newTags)
    )
  }),
  [ADD_TAG_SUCCESS]: updateWebentity((webentity, { category }) => Map().asMutable()
    .set('tags_' + category + '_prev', null)
    .asImmutable()
  ),
  [ADD_TAG_FAILURE]: updateWebentity((webentity, { category }) => Map().withMutations((m) => m
    .set('tags_' + category + '_prev', null)
    .setIn(['tags', 'USER', category], webentity.get('tags_' + category + '_prev'))
  )),

  // (Optimistically) remove tag
  [REMOVE_TAG_REQUEST]: updateWebentity((webentity, { category, value }) => Map().withMutations((m) => m
    .set('tags_' + category + '_prev', webentity.getIn(['tags', 'USER', category]))
    .updateIn(['tags', 'USER', category], (tags) => (tags && tags.remove(value)))
  )),
  [REMOVE_TAG_SUCCESS]: updateWebentity((webentity, { category }) => Map().asMutable()
    .set('tags_' + category + '_prev', null)
    .asImmutable()
  ),
  [REMOVE_TAG_FAILURE]: updateWebentity((webentity, { category }) => Map().withMutations((m) => m
    .set('tags_' + category + '_prev', null)
    .setIn(['tags', 'USER', category], webentity.get('tags_' + category + '_prev'))
  )),

  [SET_TAB_WEBENTITY]: (state, { tabId, webentityId }) => state.setIn(['tabs', tabId], webentityId),

  [CREATE_WEBENTITY_SUCCESS]: (state, { webentity }) => state.setIn(['webentities', webentity.id], immutableWebentity(webentity)),

  // Reset state when selecting corpus
  [SELECT_CORPUS]: () => initialState,

  // Keep track of current WE adjustments
  [ADJUST_WEBENTITY]: (state, { id, info }) => state.mergeIn(['adjustments', id], info)
})


function optimisticUpdateWebentity (field, request, success, failure) {
  return {
    [request]: updateWebentity((webentity, payload) => Map().withMutations((m) => m
      .set(field, payload[field]) // optimistically update field
      .set(field + '_prev', webentity.get(field)) // keep track of previous value for cancellation
    )),
    [success]: updateWebentity((webentity, payload) => Map().withMutations((m) => m
      .set(field, payload[field]) // in case we receive success with no previous request
      .set(field + '_prev', null) // remove track of previous value
    )),
    [failure]: updateWebentity((webentity) => Map().withMutations((m) => m
      .set(field, webentity.get(field + '_prev')) // restore previous value
      .set(field + '_prev', null) // remove track of previous value
    ))
  }
}

function updateWebentity (updator) {
  return (state, payload) => {
    const webentity = state.getIn(['webentities', payload.webentityId])
    if (!webentity) {
      return state
    }

    const updates = updator(webentity, payload)
    return state.setIn(['webentities', payload.webentityId], webentity.mergeDeep(updates))
  }
}

function immutableWebentity (js) {
  return fromJS(js)
    // convert tags from lists to sets
    .update('tags', (m) => m.map((cats) => cats.map(Set)))
}
