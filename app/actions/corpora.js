// API calls in this file :
// - list_corpus
// - get_status
// - start_corpus
// - create_corpus

import jsonrpc from '../utils/jsonrpc'

// when clicking on the a <CorpusListItem />
export const SELECT_CORPUS = '§_SELECT_CORPUS'

// get a list of corpora from an instance
export const FETCH_CORPORA_REQUEST = '§_FETCH_CORPORA_REQUEST'
export const FETCH_CORPORA_SUCCESS = '§_FETCH_CORPORA_SUCCESS'
export const FETCH_CORPORA_FAILURE = '§_FETCH_CORPORA_FAILURE'

export const FETCH_CORPUS_STATUS_REQUEST = '§_FETCH_CORPUS_STATUS_REQUEST'
export const FETCH_CORPUS_STATUS_SUCCESS = '§_FETCH_CORPUS_STATUS_SUCCESS'
export const FETCH_CORPUS_STATUS_FAILURE = '§_FETCH_CORPUS_STATUS_FAILURE'

export const START_CORPUS_REQUEST = '§_START_CORPUS_REQUEST'
export const START_CORPUS_SUCCESS = '§_START_CORPUS_SUCCESS'
export const START_CORPUS_FAILURE = '§_START_CORPUS_FAILURE'

export const CREATE_CORPUS_REQUEST = '§_CREATE_CORPUS_REQUEST'
export const CREATE_CORPUS_SUCCESS = '§_CREATE_CORPUS_SUCCESS'
export const CREATE_CORPUS_FAILURE = '§_CREATE_CORPUS_FAILURE'


export const selectCorpus = (corpus) => ({
  type: SELECT_CORPUS,
  payload: { corpus }
})

export const requestCorpora = (serverUrl) => ({
  type: FETCH_CORPORA_REQUEST,
  payload: { serverUrl }
})

export const receiveCorpora = (serverUrl, corpora) => ({
  type: FETCH_CORPORA_SUCCESS,
  payload: {
    serverUrl,
    corpora
  }
})

export const fetchCorpora = (serverUrl) => (dispatch) => {
  dispatch(requestCorpora(serverUrl))

  return jsonrpc(serverUrl)('list_corpus')
    .then((res) => dispatch(receiveCorpora(serverUrl, res)))
    .catch((error) => dispatch({
      type: FETCH_CORPORA_FAILURE,
      payload: { error, serverUrl }
    }))
}

export const requestCorpusStatus = (corpus) => ({
  type: FETCH_CORPUS_STATUS_REQUEST,
  payload: { corpus }
})

export const receiveCorpusStatus = (corpus, status) => ({
  type: FETCH_CORPUS_STATUS_SUCCESS,
  payload: {
    corpus,
    status
  }
})

export const fetchCorpusStatus = (serverUrl, corpus) => (dispatch) => {
  dispatch(requestCorpusStatus(corpus))

  return jsonrpc(serverUrl)('get_status', [corpus.corpus_id])
    .then((status) => dispatch(receiveCorpusStatus(corpus, status)))
    .catch((error) => dispatch({
      type: FETCH_CORPUS_STATUS_FAILURE,
      payload: { error, serverUrl, corpus }
    }))
}

export const startCorpus = (serverUrl, corpus, password) => (dispatch) => {
  dispatch({ type: START_CORPUS_REQUEST, payload: { corpus } })

  return jsonrpc(serverUrl)('start_corpus', [corpus.corpus_id, password])
    .then(() => dispatch({ type: START_CORPUS_SUCCESS, payload: { corpus } }))
    .catch((error) => dispatch({
      type: START_CORPUS_FAILURE,
      payload: { error, corpus }
    }))
}

export const receiveCorpus = (serverUrl, corpus) => ({
  type: CREATE_CORPUS_SUCCESS,
  payload: {
    serverUrl,
    corpus
  }
})

export const createCorpus = (serverUrl, corpus) => (dispatch) => {
  dispatch({
    type: CREATE_CORPUS_REQUEST,
    payload: {
      serverUrl,
      corpus
    }
  })

  return jsonrpc(serverUrl)('create_corpus', [corpus.name, corpus.password])
    .then((res) => dispatch(receiveCorpus(serverUrl, res)))
    .catch((error) => dispatch({
      type: CREATE_CORPUS_FAILURE,
      payload: { error, corpus }
    }))
}
