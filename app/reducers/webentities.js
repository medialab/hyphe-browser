// This reducer should handle web entities status transitions, not implemented yet

import mergeWith from 'lodash/mergeWith'

import createReducer from '../utils/create-reducer'
import { VIEW_WEBENTITY } from '../actions/stacks'
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
  SET_WEBENTITY_CRAWLING_STATUS,
  SET_TAB_WEBENTITY,
  CREATE_WEBENTITY_SUCCESS,
  ADJUST_WEBENTITY,
  FETCH_MOST_LINKED_SUCCESS,
  INIT_PAGINATE_PAGES_SUCCESS,
  FETCH_PAGINATE_PAGES_SUCCESS,
  FETCH_REFERRERS_SUCCESS,
  FETCH_REFERRALS_SUCCESS,
  FETCH_PARENTS_SUCCESS,
  FETCH_SUBS_SUCCESS,
  FETCH_TLDS_SUCCESS
  // Note we don't subscribe to SAVE_ADJUSTED_WEBENTITY_* because we're already plugged to its sub-actions
} from '../actions/webentities'
import { SELECT_CORPUS } from '../actions/corpora'
import {
  ADD_TAG_SUCCESS,
  UPDATE_TAG_SUCCESS,
  REMOVE_TAG_SUCCESS,
} from '../actions/tags'

const initialState = {
  tlds: null,
  webentities: {}, // id → WebEntity
  tabs: {}, // tabId → webEntityId
  adjustments: {}, // webEntityId → adjustment { name, homepage, prefix, crawl }
  merges: {}, // tabId →  merge { mergeable, host }
  selected: null
}

export default createReducer(initialState, {

  [FETCH_TLDS_SUCCESS]: (state, { tlds }) => ({
    ...state,
    tlds
  }),

  [DECLARE_PAGE_SUCCESS]: (state, { webentity }) => {
    return {
      ...state,
      webentities: {
        ...state.webentities,
        [webentity.id]: {
          ...state.webentities[webentity.id],
          ...state.selected,
          ...webentity
        }
      }
    }
  },

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

  [SET_WEBENTITY_CRAWLING_STATUS]: updateWebentity((webentity, { crawling_status }) => ({ crawling_status })),

  [FETCH_MOST_LINKED_SUCCESS]: (state, { webentity, mostLinked }) => {
    return {
      ...state,
      webentities: {
        ...state.webentities,
        [webentity.id]: {
          ...state.webentities[webentity.id],
          mostLinked
        }
      }
    }
  },

  [INIT_PAGINATE_PAGES_SUCCESS]: (state, { webentity, pages, token }) => {
    return {
      ...state,
      webentities: {
        ...state.webentities,
        [webentity.id]: {
          ...state.webentities[webentity.id],
          paginatePages: pages,
          token
        }
      }
    }
  },

  [FETCH_PAGINATE_PAGES_SUCCESS]: (state, { webentity, pages, token }) => {
    const paginatePages = state.webentities[webentity.id].paginatePages || []
    return {
      ...state,
      webentities: {
        ...state.webentities,
        [webentity.id]: {
          ...state.webentities[webentity.id],
          paginatePages: paginatePages.concat(pages),
          token
        }
      }
    }
  },

  [FETCH_REFERRERS_SUCCESS]: (state, { webentity, referrers }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentity.id]: {
        ...state.webentities[webentity.id],
        referrers
      }
    }
  }),

  [FETCH_REFERRALS_SUCCESS]: (state, { webentity, referrals }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentity.id]: {
        ...state.webentities[webentity.id],
        referrals
      }
    }
  }),

  [FETCH_PARENTS_SUCCESS]: (state, { webentity, parents }) => {
    return ({
      ...state,
      webentities: {
        ...state.webentities,
        [webentity.id]: {
          ...state.webentities[webentity.id],
          parents
        }
      }
    })
  },

  [FETCH_SUBS_SUCCESS]: (state, { webentity, children }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentity.id]: {
        ...state.webentities[webentity.id],
        children
      }
    }
  }),


  [UPDATE_TAG_SUCCESS]: updateWebentity((webentity, { category, newValue }) => {
    return {
      ...webentity,
      tags: {
        ...webentity.tags,
        USER: {
          ...webentity.tags.USER,
          [category]: [newValue]
        }
      }
    }
  }),

  [ADD_TAG_SUCCESS]: updateWebentity(( webentity, { category, value }) => {
    return {
      ...webentity,
      tags: {
        ...webentity.tags,
        USER: {
          ...webentity.tags.USER,
          [category]: [value]
        }
      }
    }
  }),

  [REMOVE_TAG_SUCCESS]: updateWebentity((webentity, { category }) => {
    // Can't use `unset` because of `updateWebentity`'s `mergeWith`
    return {
      ...webentity,
      tags: {
        ...webentity.tags,
        USER: {
          ...webentity.tags.USER,
          [category]: []
        }
      }
    }
  }),

  [SET_TAB_WEBENTITY]: (state, { tabId, webentity }) => {
    if (webentity) {
      return {
        ...state,
        webentities: {
          ...state.webentities,
          [webentity.id]: {
            ...state.webentities[webentity.id],
            ...webentity
          }
        },
        tabs: {
          ...state.tabs,
          [tabId]: webentity.id
        }
      }
    }
    return {
      ...state,
      tabs: {
        ...state.tabs,
        [tabId]: null
      }
    }
  },

  [CREATE_WEBENTITY_SUCCESS]: (state, { webentity }) => ({
    ...state,
    webentities: {
      ...state.webentities,
      [webentity.id]: webentity
    }
  }),

  // Reset state when selecting corpus
  [SELECT_CORPUS]: () => ({ ...initialState }),

  // Keep track of current WE adjustments
  [ADJUST_WEBENTITY]: (state, { id, info }) => ({
    ...state,
    adjustments: {
      ...state.adjustments,
      [id]: (info && state.adjustments[id])
        ? { ...state.adjustments[id], ...info }
        : info
    }
  }),

  [VIEW_WEBENTITY]: (state, { webentity }) => ({
    ...state,
    selected: webentity
  })

})


function optimisticUpdateWebentity (field, request, success, failure) {
  return {
    [request]: updateWebentity((webentity, payload) => ({
      [field]: payload[field], // optimistically update field
      [field + '_prev']: webentity[field] // keep track of previous value for cancellation
    })),
    [success]: updateWebentity((webentity, payload) => ({
      [field]: payload[field], // in case we receive success with no previous request
      [field + '_prev']: null // remove track of previous value
    })),
    [failure]: updateWebentity((webentity) => ({
      [field]: webentity[field + '_prev'], // restore previous value
      [field + '_prev']: null // remove track of previous value
    }))
  }
}

function updateWebentity (updator) {
  return (state, payload) => {
    const id = payload.webentityId
    const webentity = state.webentities[id]
    if(webentity) {
      const updates = updator(webentity, payload)
      const updated = mergeWith({}, webentity, updates, (prev, next) => {
        if (Array.isArray(next)) {
          return next // override arrays instead of merging them
        }
      })
      return { ...state, webentities: { ...state.webentities, [id]: updated } }
    } else {
      return state
    }
  }
}
