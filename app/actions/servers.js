// create an entry in the localStorage
export const CREATE_SERVER = '§_CREATE_SERVER'
export const UPDATE_SERVER = '§_UPDATE_SERVER'
export const DELETE_SERVER = '§_DELETE_SERVER'

// to clear the localStorage
export const RESET_SERVERS = '§_RESET_SERVERS'


export const createServer = (server) => ({
  type: CREATE_SERVER,
  payload: { server }
})

export const updateServer = (server) => ({
  type: UPDATE_SERVER,
  payload: { server }
})

export const deleteServer = (server) => ({
  type: DELETE_SERVER,
  payload: { server }
})

export const resetServers = () => ({ type: RESET_SERVERS })
