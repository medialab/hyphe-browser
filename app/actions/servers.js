import jsonrpc from '../utils/jsonrpc'

export const FETCH_CORPORA_REQUEST = '§_FETCH_CORPORA_REQUEST'
export const FETCH_CORPORA_SUCCESS = '§_FETCH_CORPORA_SUCCESS'
export const FETCH_CORPORA_FAILURE = '§_FETCH_CORPORA_FAILURE'

export const CREATE_SERVER = '§_CREATE_SERVER'
export const DELETE_SERVER = '§_DELETE_SERVER'

// to clear the localStorage
export const RESET_SERVERS = '§_RESET_SERVERS'

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

export const createServer = (server) => ({
  type: CREATE_SERVER,
  payload: { server }
})

export const deleteServer = (server) => ({
  type: DELETE_SERVER,
  payload: { server }
})

export const resetServers = () => ({ type: RESET_SERVERS })
