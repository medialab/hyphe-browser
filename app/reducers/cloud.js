import { omit } from 'lodash'

import createReducer from '../utils/create-reducer'
import {
  CREATE_CLOUD_SERVER,
  UPDATE_CLOUD_SERVER,
  DELETE_CLOUD_SERVER,
  SAVE_CREDENTIALS,
  DELETE_CREDENTIALS,
  CLEAR_CREDENTIALS,
  RESET_ALL_CLOUD_DATA
} from '../actions/cloud'

const initialState = {
  credentials: {},
  serversList: []
}

export default createReducer(initialState, {
  // a server has been created from the "Create cloud server" form
  [CREATE_CLOUD_SERVER]: (state, { cloudServer }) => ({
    ...state,
    serversList: state.serversList.concat([cloudServer])
  }),

  // a server has been updated from the cloud servers administration page (TODO)
  [UPDATE_CLOUD_SERVER]: (state, { cloudServer }) => ({
    ...state,
    serversList: state.serversList.map(server => {
      return server.id === cloudServer.id ? cloudServer : server
    })
  }),

  // a server has been deleted from the cloud servers administration page (TODO)
  [DELETE_CLOUD_SERVER]: (state, { cloudServer }) => ({
    ...state,
    serversList: state.serversList.filter(server => server.id !== cloudServer.id)

  }),

  // the user has used new OpenStack credentials for a given host when creating a cloud server
  [SAVE_CREDENTIALS]: (state, { host, credentials }) => ({
    ...state,
    credentials: {
      ...state.credentials,
      [host]: credentials
    }
  }),

  // the user has chosen to forget his OpenStack credentials for a given host (TODO)
  [DELETE_CREDENTIALS]: (state, { host }) => ({
    ...state,
    credentials: omit(state.credentials, [host])
  }),

  // the user has chosen to forget all his OpenStack credentials (TODO)
  [CLEAR_CREDENTIALS]: (state) => ({
    ...state,
    credentials: {}
  }),

  // the user has chosen to forget every cloud related data (TODO)
  [RESET_ALL_CLOUD_DATA]: () => initialState,
})
