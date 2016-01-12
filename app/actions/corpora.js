import jsonrpc from '../utils/jsonrpc'
import { pushPath } from 'redux-simple-router'

export const SELECT_CORPUS = '§_SELECT_CORPUS'
export const FETCH_CORPUS_STATUS_REQUEST = '§_FETCH_CORPUS_STATUS_REQUEST'
export const FETCH_CORPUS_STATUS_SUCCESS = '§_FETCH_CORPUS_STATUS_SUCCESS'
export const FETCH_CORPUS_STATUS_FAILURE = '§_FETCH_CORPUS_STATUS_FAILURE'

export const selectCorpus = (corpus) => (dispatch) => {
  dispatch({
    type: SELECT_CORPUS,
    payload: {
      corpus
    }
  })

  dispatch(pushPath('/browser'))
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
    .catch((err) => dispatch({
      type: FETCH_CORPUS_STATUS_FAILURE,
      payload: err
    }))
}
