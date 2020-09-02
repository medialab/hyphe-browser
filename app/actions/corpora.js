// API calls in this file :
// - list_corpus
// - get_status
// - start_corpus
// - create_corpus

import jsonrpc from '../utils/jsonrpc'
// for redirections after success / errors from server
import { push } from 'connected-react-router'

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

export const requestServerStatus = createAction(FETCH_SERVER_STATUS_REQUEST, (serverUrl) => ({ serverUrl }))
export const receiveServerStatus = createAction(FETCH_SERVER_STATUS_SUCCESS, (status) => ({ status }))
export const fetchServerStatus = (serverUrl) => (dispatch) => {
  dispatch(requestServerStatus(serverUrl))

  return jsonrpc(serverUrl)('get_status')
    .then((status) => dispatch(receiveServerStatus(status)))
    .catch((error) => dispatch({
      type: FETCH_SERVER_STATUS_FAILURE,
      payload: { error, serverUrl }
    }))
}

export const requestCorpusStatus = createAction(FETCH_CORPUS_STATUS_REQUEST, (corpus) => ({ corpus }))
export const receiveCorpusStatus = createAction(FETCH_CORPUS_STATUS_SUCCESS, (corpus, status) => ({ corpus, status }))
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

export const receiveCorpus = createAction(CREATE_CORPUS_SUCCESS, (serverUrl, corpus) => ({ serverUrl, corpus }))
export const createCorpus = ({ server, corpus, options }) => (dispatch) => {
  const serverUrl = server.url
  dispatch({
    type: CREATE_CORPUS_REQUEST,
    payload: {
      serverUrl,
      corpus,
      options
    }
  })

  // create_corpus does not return the full created corpus
  // so we must trigger a full fetch of all corpora
  return jsonrpc(serverUrl)('create_corpus', [corpus.name, corpus.password || '', options])
    .then((miniCorpus) => {
      if (miniCorpus.status === 'error') {
        return Promise.reject(miniCorpus)
      }
      else {
        dispatch(receiveCorpus(serverUrl, miniCorpus))
        return Promise.all([
          Promise.resolve(miniCorpus),
          dispatch(fetchCorpora(serverUrl))
        ])
          .then(([corpus, action]) => {
            return dispatch(selectCorpus(server, action.payload.corpora[corpus.corpus_id]))
          })
          .then(() => {
            dispatch(push('/browser'))
        }, (err) => console.error('→ browser', err)) // eslint-disable-line
      }
    })
    .catch((error) => dispatch({
      type: CREATE_CORPUS_FAILURE,
      payload: { error, corpus }
    }))
}
