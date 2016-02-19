import { Iterable, Map, OrderedSet, fromJS } from 'immutable'
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
  ADD_TAGS_CATEGORY_SUCCESS
} from '../actions/tags'


const initialTagsCategories = OrderedSet(['FREETAGS'])

const emptyCorporaList = Map()

const initialState = Map({
  // TODO: transform it in a array here?
  list: emptyCorporaList, // [corpusId]: corpus
  selected: null,
  status: null // current status of selected corpus
})


export default createReducer(initialState, {
  [FETCH_CORPORA_REQUEST]: (state) => state.asMutable()
    .set('selected', null)
    .set('list', emptyCorporaList)
    .asImmutable(),
  [FETCH_CORPORA_SUCCESS]: (state, { corpora }) => state.asMutable()
    .set('selected', null)
    // tagsCategories is maintained internally, it does not come from API,
    // we initialize it to 'FREETAGS' but the full list will come from a call to fetchTagsCategories
    .set('list', fromJS(corpora).map(initializeCorpus))
    .asImmutable(),

  [FETCH_SERVER_STATUS_SUCCESS]: (state, { status }) => state.set('status', fromJS(status)),

  [FETCH_CORPUS_STATUS_SUCCESS]: (state, { status }) => state.update('status', s => (s || Map()).merge(status)),

  [SELECT_CORPUS]: (state, { corpus }) => state.set('selected', initializeCorpus(corpus)),

  [FETCH_TAGS_CATEGORIES_SUCCESS]: (state, { corpusId, categories }) =>
    updateCorpus(state, corpusId, (corpus) => corpus.set('tagsCategories', OrderedSet(['FREETAGS'].concat(categories)))),

  [ADD_TAGS_CATEGORY_SUCCESS]: (state, { corpusId, category }) =>
    updateCorpus(state, corpusId, (corpus) => corpus.update('tagsCategories', cats => cats.add(category)))
})

function updateCorpus (state, corpusId, update) {
  return state.withMutations(state => {
    const original = state.getIn(['list', corpusId])
    const updated = update(original)
    state.setIn(['list', corpusId], updated)
    if (original === state.get('selected')) {
      state.set('selected', updated)
    }
  })
}

function initializeCorpus (corpus) {
  if (!Iterable.isIterable(corpus)) {
    return initializeCorpus(fromJS(corpus))
  }

  return corpus.has('tagsCategories')
    ? corpus
    : fromJS(corpus).set('tagsCategories', initialTagsCategories)
}
