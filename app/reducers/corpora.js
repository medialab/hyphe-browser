import mapValues from 'lodash.mapvalues'
import createReducer from '../utils/create-reducer'
import {
  SELECT_CORPUS,
  FETCH_CORPORA_REQUEST,
  FETCH_CORPORA_SUCCESS,
  FETCH_SERVER_STATUS_SUCCESS,
  FETCH_CORPUS_STATUS_SUCCESS
} from '../actions/corpora'
import {
  FETCH_TAGS_CATEGORIES_SUCCESS,
  FETCH_TAGS_SUCCESS,
  ADD_TAGS_CATEGORY,
} from '../actions/tags'

import {
  ADD_NAVIGATION_HISTORY
} from '../actions/tabs'

const initialState = {
  // TODO: transform it in a array here?
  list: {}, // [corpusId]: corpus
  selected: null,
  status: null, // status of selected corpus
  tagsSuggestions: {},
  navigationHistory: {}
}

export default createReducer(initialState, {
  [FETCH_CORPORA_REQUEST]: (state) => ({
    ...state,
    list: {},
    selected: null
  }),
  [FETCH_CORPORA_SUCCESS]: (state, { corpora }) => ({
    ...state,
    // tagsCategories is maintained internally, it does not come from API,
    // we initialize it to 'FREETAGS' but the full list will come from a call to fetchTagsCategories in <CorpusStatusWatcher />
    list: mapValues(corpora, (c) => ({ ...c, tagsCategories: ['FREETAGS'] })),
    selected: null
  }),

  [FETCH_SERVER_STATUS_SUCCESS]: (state, { status }) => ({
    ...state,
    status
  }),

  [FETCH_CORPUS_STATUS_SUCCESS]: (state, { corpus, status }) => ({
    ...state,
    selected: corpus,
    status
  }),

  [SELECT_CORPUS]: (state, { corpus }) => ({
    ...state,
    selected: corpus
  }),

  [FETCH_TAGS_CATEGORIES_SUCCESS]: updateTagsCategories((state, { corpusId, categories }) => {
    const originalCategories = (state.list[corpusId] || {}).tagsCategories || []
    if (categories.join(',') === originalCategories.join(',')) {
      return false
    }

    return ['FREETAGS'].concat(categories.filter((c) => c !== 'FREETAGS'))
  }),

  [FETCH_TAGS_SUCCESS]: (state, { corpusId, values }) => ({
    ...state,
    tagsSuggestions: {
      ...state.tagsSuggestions,
      [corpusId]: values
    }
  }),

  [ADD_NAVIGATION_HISTORY]: (state, { url, corpusId }) => {
    let history = state.navigationHistory[corpusId] || []
    history.push({
      url,
      visitedAt: new Date().getTime()
    })
    return {
      ...state,
      navigationHistory: {
        ...state.navigationHistory,
        [corpusId]: history
      }
    }
  },
 
  [ADD_TAGS_CATEGORY]: updateTagsCategories((state, { corpusId, category }) => {
    const originalCategories = (state.list[corpusId] || {}).tagsCategories || []
    if (originalCategories.includes(category)) {
      return state
    }

    return originalCategories.concat([category])
  })
})

function updateTagsCategories (getTagsCategories) {
  return (state, payload) => {
    const tagsCategories = getTagsCategories(state, payload)
    if (!tagsCategories) {
      return state
    }

    const { corpusId } = payload
    const selected = (state.selected && state.selected.corpus_id === corpusId)
      ? { ...state.selected, tagsCategories }
      : state.selected
    const list = state.list[corpusId]
      ? { ...state.list, [corpusId]: { ...state.list[corpusId], tagsCategories } }
      : state.list

    return {
      ...state,
      selected,
      list
    }
  }
}
