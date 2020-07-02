import { createAction } from 'redux-actions'
import {
  getOpenStackClientPromise,
  performActionOnServerPromise
} from '../utils/cloud-helpers'
import {
  SERVER_STATUS_ACTIVE,
  SERVER_STATUS_SHUTOFF,
  SERVER_STATUS_PROCESSING
} from '../constants'
import { identity } from 'lodash'

// create an entry in the localStorage
export const CREATE_SERVER = '§_CREATE_SERVER'
export const UPDATE_SERVER = '§_UPDATE_SERVER'
export const DELETE_SERVER = '§_DELETE_SERVER'
export const SELECT_SERVER = '§_SELECT_SERVER'
export const DESELECT_SERVER = '§_DESELECT_SERVER'

// to clear the localStorage
export const RESET_SERVERS = '§_RESET_SERVERS'

export const createServer = createAction(CREATE_SERVER, (server) => ({ server }))
export const updateServer = createAction(UPDATE_SERVER, (server) => ({ server }))
export const deleteServer = createAction(DELETE_SERVER, (server) => ({ server }))
export const resetServers = createAction(RESET_SERVERS)
export const selectServer = createAction(SELECT_SERVER, (server) => ({ server }))
export const deselectServer = createAction(DESELECT_SERVER)

// cloud servers only
export const FETCH_CLOUD_SERVER_STATUS_REQUEST = '§_FETCH_CLOUD_SERVER_STATUS_REQUEST'
export const FETCH_CLOUD_SERVER_STATUS_FAILURE = '§_FETCH_CLOUD_SERVER_STATUS_FAILURE'
export const FETCH_CLOUD_SERVER_STATUS_SUCCESS = '§_FETCH_CLOUD_SERVER_STATUS_SUCCESS'
export const fetchCloudServerStatus = (server) => (dispatch) => {
  if (!server || !server.cloud) return

  dispatch({
    type: FETCH_CLOUD_SERVER_STATUS_REQUEST,
    payload: { server }
  })

  const { region, id } = server.cloud.server

  return getOpenStackClientPromise(server)
    .then(client => client.getComputeServer(region, id))
    .then(fullServerData => {
      const tasksKeys = Object.keys(fullServerData).filter(key => key.match(/task_state$/))
      const tasks = tasksKeys.map(key => fullServerData[key]).filter(identity)
      const hasTaskRunning = !!tasks.length

      // Choose proper status:
      let status
      if (hasTaskRunning) status = SERVER_STATUS_PROCESSING
      else if (fullServerData.status === 'ACTIVE') status = SERVER_STATUS_ACTIVE
      else status = SERVER_STATUS_SHUTOFF

      // Notify loading successful
      dispatch({
        type: FETCH_CLOUD_SERVER_STATUS_SUCCESS,
        payload: { server }
      })

      // Update server state
      return dispatch(updateServer({
        ...server,
        cloud: {
          ...server.cloud,
          status,
          tasks: tasks.length ? tasks : null
        }
      }))
    })
    .catch(error => dispatch({
      type: FETCH_CLOUD_SERVER_STATUS_FAILURE,
      payload: { server, error: error || true }
    }))
}

/**
 * Helper to deal with the similar following actions. Will perform the action on
 * the server, then check the server status.
 *
 * Returns a promise, in case there are other things to do on success.
 */
function _performActionOnCloudServer (server, dispatch, action, events) {
  if (!server || !server.cloud) return

  dispatch({
    type: events.request,
    payload: { server }
  })

  return performActionOnServerPromise(server, action)
    .then(() => dispatch(fetchCloudServerStatus(server)))
    .then(() => dispatch({
      type: events.success,
      payload: { server }
    }))
    .catch(error => dispatch({
      type: events.failure,
      payload: { error, server }
    }))
}

export const STOP_CLOUD_SERVER_REQUEST = '§_STOP_CLOUD_SERVER_REQUEST'
export const STOP_CLOUD_SERVER_SUCCESS = '§_STOP_CLOUD_SERVER_SUCCESS'
export const STOP_CLOUD_SERVER_FAILURE = '§_STOP_CLOUD_SERVER_FAILURE'
export const stopCloudServer = (server) => (dispatch) => {
  _performActionOnCloudServer(
    server,
    dispatch,
    'os-stop',
    {
      request: STOP_CLOUD_SERVER_REQUEST,
      success: STOP_CLOUD_SERVER_SUCCESS,
      failure: STOP_CLOUD_SERVER_FAILURE,
    })
}

export const START_CLOUD_SERVER_REQUEST = '§_START_CLOUD_SERVER_REQUEST'
export const START_CLOUD_SERVER_SUCCESS = '§_START_CLOUD_SERVER_SUCCESS'
export const START_CLOUD_SERVER_FAILURE = '§_START_CLOUD_SERVER_FAILURE'
export const startCloudServer = (server) => (dispatch) => {
  _performActionOnCloudServer(
    server,
    dispatch,
    'os-start',
    {
      request: START_CLOUD_SERVER_REQUEST,
      success: START_CLOUD_SERVER_SUCCESS,
      failure: START_CLOUD_SERVER_FAILURE,
    })
}

export const DELETE_CLOUD_SERVER_REQUEST = '§_DELETE_CLOUD_SERVER_REQUEST'
export const DELETE_CLOUD_SERVER_SUCCESS = '§_DELETE_CLOUD_SERVER_SUCCESS'
export const DELETE_CLOUD_SERVER_FAILURE = '§_DELETE_CLOUD_SERVER_FAILURE'
export const deleteCloudServer = (server) => (dispatch) => {
  if (!server || !server.cloud) return

  dispatch({
    type: DELETE_CLOUD_SERVER_REQUEST,
    payload: { server }
  })

  const { region, id } = server.cloud.server

  return (
    getOpenStackClientPromise(server)
      .then(client => client.deleteComputeServer(
        region,
        id
      ))
      .then(() => {
        dispatch({
          type: DELETE_CLOUD_SERVER_SUCCESS,
          payload: { server }
        })
        dispatch(deleteServer(server))
      })
      .catch(error => dispatch({
        type: DELETE_CLOUD_SERVER_FAILURE,
        payload: { error, server }
      }))
  )
}
