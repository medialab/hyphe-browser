import jsonrpc from '../utils/jsonrpc'

export const FETCH_CORPORA_REQUEST = '§_FETCH_CORPORA_REQUEST'
export const FETCH_CORPORA_SUCCESS = '§_FETCH_CORPORA_SUCCESS'
export const FETCH_CORPORA_FAILURE = '§_FETCH_CORPORA_FAILURE'

// this aims the localStorage for now which should be async (localForage)
export const CREATE_SERVER_REQUEST = '§_CREATE_SERVER_REQUEST'
export const CREATE_SERVER_SUCCESS = '§_CREATE_SERVER_SUCCESS'
export const CREATE_SERVER_FAILURE = '§_CREATE_SERVER_FAILURE'

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

export const createServer = (server) => (dispatch) => {
  dispatch({
    type: CREATE_SERVER_REQUEST,
    payload: { server }
  })

  return Promise.resolve(localStorage.getItem('servers'))
    .then((res) => res ? JSON.parse(res) : [])
    .then((servers) => {
      servers.push(server)
      localStorage.setItem('servers', servers)
      return servers
    })
    .then(() => {
      dispatch({
        type: CREATE_SERVER_SUCCESS,
        payload: { server }
      })
    })
    .catch((error) => dispatch({
      type: CREATE_SERVER_FAILURE,
      payload: { error, server }
    }))
}
