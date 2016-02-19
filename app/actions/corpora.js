// API calls in this file :
// - list_corpus
// - get_status
// - start_corpus
// - create_corpus

import jsonrpc from '../utils/jsonrpc'
// for redirections after success / errors from server
import { routeActions } from 'react-router-redux'
import { addHypheTab } from './tabs'

import { createAction } from 'redux-actions'

// when clicking on the a <CorpusListItem />
export const SELECT_CORPUS = '§_SELECT_CORPUS'

// get a list of corpora from an instance
export const FETCH_CORPORA_REQUEST = '§_FETCH_CORPORA_REQUEST'
export const FETCH_CORPORA_SUCCESS = '§_FETCH_CORPORA_SUCCESS'
export const FETCH_CORPORA_FAILURE = '§_FETCH_CORPORA_FAILURE'

export const FETCH_SERVER_STATUS_REQUEST = '§_FETCH_SERVER_STATUS_REQUEST'
export const FETCH_SERVER_STATUS_SUCCESS = '§_FETCH_SERVER_STATUS_SUCCESS'
export const FETCH_SERVER_STATUS_FAILURE = '§_FETCH_SERVER_STATUS_FAILURE'

export const FETCH_CORPUS_STATUS_REQUEST = '§_FETCH_CORPUS_STATUS_REQUEST'
export const FETCH_CORPUS_STATUS_SUCCESS = '§_FETCH_CORPUS_STATUS_SUCCESS'
export const FETCH_CORPUS_STATUS_FAILURE = '§_FETCH_CORPUS_STATUS_FAILURE'

export const START_CORPUS_REQUEST = '§_START_CORPUS_REQUEST'
export const START_CORPUS_SUCCESS = '§_START_CORPUS_SUCCESS'
export const START_CORPUS_FAILURE = '§_START_CORPUS_FAILURE'

export const CREATE_CORPUS_REQUEST = '§_CREATE_CORPUS_REQUEST'
export const CREATE_CORPUS_SUCCESS = '§_CREATE_CORPUS_SUCCESS'
export const CREATE_CORPUS_FAILURE = '§_CREATE_CORPUS_FAILURE'


const _selectCorpus = createAction(SELECT_CORPUS, (corpus) => ({ corpus }))
export const selectCorpus = (server, corpus) => (dispatch) => {
  dispatch(_selectCorpus(corpus))
  dispatch(addHypheTab(server.home, corpus.get('corpus_id')))
}

export const requestCorpora = createAction(FETCH_CORPORA_REQUEST, (serverUrl) => ({ serverUrl }))
export const receiveCorpora = createAction(FETCH_CORPORA_SUCCESS, (serverUrl, corpora) => ({ serverUrl, corpora }))
export const fetchCorpora = (serverUrl) => (dispatch) => {
  dispatch(requestCorpora(serverUrl))

  return jsonrpc(serverUrl)('list_corpus')
    .then((res) => dispatch(receiveCorpora(serverUrl, res)))
    .catch((error) => dispatch({
      type: FETCH_CORPORA_FAILURE,
      payload: { error, serverUrl }
    }))
}

export const requestServerStatus = createAction(FETCH_SERVER_STATUS_REQUEST, () => {})
export const receiveServerStatus = createAction(FETCH_SERVER_STATUS_SUCCESS, (status) => ({ status }))
export const fetchServerStatus = (serverUrl) => (dispatch) => {
  dispatch(requestServerStatus())

  return jsonrpc(serverUrl)('get_status')
    .then((status) => dispatch(receiveServerStatus(status)))
    .catch((error) => dispatch({
      type: FETCH_SERVER_STATUS_FAILURE,
      payload: { error, serverUrl }
    }))
}

export const requestCorpusStatus = createAction(FETCH_CORPUS_STATUS_REQUEST, (corpusId) => ({ corpusId }))
export const receiveCorpusStatus = createAction(FETCH_CORPUS_STATUS_SUCCESS, (corpusId, status) => ({ corpusId, status }))
export const fetchCorpusStatus = (serverUrl, corpusId) => (dispatch) => {
  dispatch(requestCorpusStatus(corpusId))

  return jsonrpc(serverUrl)('get_status', [corpusId])
    .then((status) => dispatch(receiveCorpusStatus(corpusId, status)))
    .catch((error) => dispatch({
      type: FETCH_CORPUS_STATUS_FAILURE,
      payload: { error, serverUrl, corpusId }
    }))
}

export const startCorpus = (serverUrl, corpusId, password) => (dispatch) => {
  dispatch({ type: START_CORPUS_REQUEST, payload: { corpusId } })

  return jsonrpc(serverUrl)('start_corpus', [corpusId, password])
    .then(() => dispatch({ type: START_CORPUS_SUCCESS, payload: { corpusId } }))
    .catch((error) => dispatch({
      type: START_CORPUS_FAILURE,
      payload: { error, corpusId }
    }))
}

export const receiveCorpus = createAction(CREATE_CORPUS_SUCCESS, (serverUrl, corpus) => ({ serverUrl, corpus }))
export const createCorpus = (serverUrl, corpus) => (dispatch) => {
  dispatch({
    type: CREATE_CORPUS_REQUEST,
    payload: {
      serverUrl,
      corpus
    }
  })

  // create_corpus does not return the full created corpus
  // so we must trigger a full fetch of all corpora
  return jsonrpc(serverUrl)('create_corpus', [corpus.name, corpus.password])
    .then((miniCorpus) => {
      dispatch(receiveCorpus(serverUrl, miniCorpus))
      return Promise.all([
        Promise.resolve(miniCorpus),
        dispatch(fetchCorpora(serverUrl))
      ])
      .then(([corpus, action]) => {
        return dispatch(selectCorpus(serverUrl, action.payload.corpora[corpus.corpus_id]))
      })
      .then(() => {
        dispatch(routeActions.push('/browser'))
      }, (err) => console.error('→ browser', err))
    })
    .catch((error) => dispatch({
      type: CREATE_CORPUS_FAILURE,
      payload: { error, corpus }
    }))
}
