import jsonrpc from '../utils/jsonrpc'
import { createAction } from 'redux-actions'
import { setTabUrl, openTab } from './tabs'


export const EMPTY_STACK = '§_EMPTY_STACK'

export const FETCH_STACK_REQUEST = '§_FETCH_STACK_REQUEST'
export const FETCH_STACK_SUCCESS = '§_FETCH_STACK_SUCCESS'
export const FETCH_STACK_FAILURE = '§_FETCH_STACK_FAILURE'
export const FETCH_STACK_ERROR = '§_FETCH_STACK_ERROR'

export const VIEW_WEBENTITY = '§_VIEW_WEBENTITY'
export const STOPPED_LOADING_WEBENTITY = '§_STOPPED_LOADING_WEBENTITY'


export const emptyStack = createAction(EMPTY_STACK, (stack) => ({ stack }))

export const requestStack = createAction(FETCH_STACK_REQUEST, (serverUrl, stack) => ({ serverUrl, stack }))
export const receiveStack = createAction(FETCH_STACK_SUCCESS, (serverUrl, stack, webentities) => ({ serverUrl, stack, webentities }))
export const fetchStack = (serverUrl, corpusId, stack) => (dispatch) => {
  dispatch(requestStack(serverUrl, stack))

  return jsonrpc(serverUrl)(stack.method, stack.args.concat(corpusId))
    // when args contains a count, metadata are attached to res,
    // meanwhile webentities are returned directly as an array if count == -1
    .then((res) => dispatch(receiveStack(serverUrl, stack, res.webentities || res)))
    .catch((error) => dispatch({
      type: FETCH_STACK_FAILURE,
      payload: { error, serverUrl, stack }
    }))
}


export const viewWebentity = createAction(VIEW_WEBENTITY, (webentity) => ({ webentity }))

export const stoppedLoadingWebentity = createAction(STOPPED_LOADING_WEBENTITY)



export const fetchStackAndSetTab = (serverUrl, corpusId, stack, tabId) => (dispatch) => {
  return dispatch(fetchStack(serverUrl, corpusId, stack))
    .then((action) => {
      if (action.payload && action.payload.webentities && action.payload.webentities[0]) {
        const webentity = action.payload.webentities[0] 
        dispatch(viewWebentity(webentity))
        if (tabId) {
          dispatch(setTabUrl(webentity.homepage, tabId))
        } else {
          dispatch(openTab(webentity.homepage))
        }
      }
    })
}

