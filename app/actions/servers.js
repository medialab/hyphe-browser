import jsonrpc from '../utils/jsonrpc'

export const FETCH_CORPORA_REQUEST = '§_FETCH_CORPORA_REQUEST'
export const FETCH_CORPORA_SUCCESS = '§_FETCH_CORPORA_SUCCESS'
export const FETCH_CORPORA_FAILURE = '§_FETCH_CORPORA_FAILURE'

export const requestCorpora = (serverUrl) => ({
  type: FETCH_CORPORA_REQUEST,
  payload: {
    serverUrl
  }
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
    // TODO better error handling
    .catch((err) => console.error(err))
}
