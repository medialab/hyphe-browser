import { omit } from 'lodash'

import createReducer from '../utils/create-reducer'
import {
  SAVE_CREDENTIALS,
  DELETE_CREDENTIALS,
  CLEAR_CREDENTIALS,
  RESET_ALL_CLOUD_DATA
} from '../actions/cloud'

const initialState = {
  credentials: {}
}

export default createReducer(initialState, {
  // the user has used new OpenStack credentials for a given host when creating a cloud server
  [SAVE_CREDENTIALS]: (state, { host, credentials }) => ({
    ...state,
    credentials: {
      ...state.credentials,
      [host]: credentials
    }
  }),

  // the user has chosen to forget his OpenStack credentials for a given host
  [DELETE_CREDENTIALS]: (state, { host }) => ({
    ...state,
    credentials: omit(state.credentials, [host])
  }),

  // the user has chosen to forget all his OpenStack credentials
  [CLEAR_CREDENTIALS]: (state) => ({
    ...state,
    credentials: {}
  }),

  // the user has chosen to forget every cloud related data
  [RESET_ALL_CLOUD_DATA]: () => initialState,
})
