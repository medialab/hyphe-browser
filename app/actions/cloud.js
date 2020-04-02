import { createAction } from 'redux-actions'

// manage cloud servers in the localStorage
export const CREATE_CLOUD_SERVER = '§_CREATE_CLOUD_SERVER'
export const UPDATE_CLOUD_SERVER = '§_UPDATE_CLOUD_SERVER'
export const DELETE_CLOUD_SERVER = '§_DELETE_CLOUD_SERVER'

// manage OpenStack credentials per host in the localStorage
export const SAVE_CREDENTIALS = '§_SAVE_CREDENTIALS'
export const DELETE_CREDENTIALS = '§_DELETE_CREDENTIALS'
export const CLEAR_CREDENTIALS = '§_CLEAR_CREDENTIALS'

// to clear the localStorage
export const RESET_ALL_CLOUD_DATA = '§_RESET_CLOUD_DATA'

export const createCloudServer = createAction(CREATE_CLOUD_SERVER, cloudServer => ({ cloudServer }))
export const updateCloudServer = createAction(UPDATE_CLOUD_SERVER, cloudServer => ({ cloudServer }))
export const deleteCloudServer = createAction(DELETE_CLOUD_SERVER, cloudServer => ({ cloudServer }))
export const saveCredentials = createAction(SAVE_CREDENTIALS, (host, credentials) => ({ host, credentials }))
export const deleteCredentials = createAction(DELETE_CREDENTIALS, host => ({ host }))
export const clearCredentials = createAction(CLEAR_CREDENTIALS)
export const resetAllCloudData = createAction(RESET_ALL_CLOUD_DATA)
