import { createAction } from 'redux-actions'

// manage OpenStack credentials per host in the localStorage
export const SAVE_CREDENTIALS = '§_SAVE_CREDENTIALS'
export const DELETE_CREDENTIALS = '§_DELETE_CREDENTIALS'
export const CLEAR_CREDENTIALS = '§_CLEAR_CREDENTIALS'
export const RESET_ALL_CLOUD_DATA = '§_RESET_CLOUD_DATA'

export const saveCredentials = createAction(SAVE_CREDENTIALS, (host, credentials) => ({ host, credentials }))
export const deleteCredentials = createAction(DELETE_CREDENTIALS, host => ({ host }))
export const clearCredentials = createAction(CLEAR_CREDENTIALS)
export const resetAllCloudData = createAction(RESET_ALL_CLOUD_DATA)
