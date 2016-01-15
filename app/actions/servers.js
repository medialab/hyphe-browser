import { createAction } from 'redux-actions'

// create an entry in the localStorage
export const CREATE_SERVER = '§_CREATE_SERVER'
export const UPDATE_SERVER = '§_UPDATE_SERVER'
export const DELETE_SERVER = '§_DELETE_SERVER'

// to clear the localStorage
export const RESET_SERVERS = '§_RESET_SERVERS'

export const createServer = createAction(CREATE_SERVER, (server) => ({ server }))
export const updateServer = createAction(UPDATE_SERVER, (server) => ({ server }))
export const deleteServer = createAction(DELETE_SERVER, (server) => ({ server }))
export const resetServers = createAction(RESET_SERVERS)
