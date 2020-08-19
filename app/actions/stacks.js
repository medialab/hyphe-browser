import jsonrpc from '../utils/jsonrpc'
import { createAction } from 'redux-actions'
import { setTabUrl, openTab } from './tabs'

export const EMPTY_STACK = '§_EMPTY_STACK'
export const SELECT_STACK ='§_SELECT_STACK'

export const FETCH_STACK_REQUEST = '§_FETCH_STACK_REQUEST'
export const FETCH_STACK_SUCCESS = '§_FETCH_STACK_SUCCESS'
export const FETCH_STACK_FAILURE = '§_FETCH_STACK_FAILURE'

export const FETCH_STACK_PAGE_REQUEST = '§_FETCH_STACK_PAGE_REQUEST'
export const FETCH_STACK_PAGE_SUCCESS = '§_FETCH_STACK_PAGE_SUCCESS'

export const VIEW_WEBENTITY = '§_VIEW_WEBENTITY'
export const STOPPED_LOADING_WEBENTITY = '§_STOPPED_LOADING_WEBENTITY'

export const emptyStack = createAction(EMPTY_STACK, (stack) => ({ stack }))
export const selectStack = createAction(SELECT_STACK, (stack) => ({ stack }))

export const requestStack = createAction(FETCH_STACK_REQUEST, (serverUrl, stack, filter) => ({ serverUrl, stack, filter }))
export const receiveStack = createAction(FETCH_STACK_SUCCESS, (serverUrl, stack, webentities, filter) => ({ serverUrl, stack, filter, webentities }))
export const fetchStack = ({ serverUrl, corpusId, stack, filter }) => (dispatch) => {
  dispatch(requestStack(serverUrl, stack, filter))
  if (filter) {
    return jsonrpc(serverUrl)(
      'store.get_webentities_mistagged',
      [stack, filter === 'no-tag' ? false: true, false, 'name', stack==='DISCOVERED' ? 50: -1, 0, false, false, corpusId]
    ).then((res) => {
      if(stack === 'DISCOVERED') {
        return dispatch(receiveStack(serverUrl, stack, res, filter))
      } else {
        const webentities = {
          webentities: res,
          total_results: res.length
        }
        return dispatch(receiveStack(serverUrl, stack, webentities, filter))
      }
    }).catch((error) => dispatch({
      type: FETCH_STACK_FAILURE,
      payload: { error, serverUrl, stack }
    }))
  }
  return jsonrpc(serverUrl)(
    'store.get_webentities_by_status',
    {
      status: stack,
      sort: stack === 'DISCOVERED' ? ['-indegree', 'name'] : 'name',
      count: 50,
      page: 0,
      light: false,
      semilight: false,
      corpus: corpusId,
    }
  )
    .then((res) => {
      return dispatch(receiveStack(serverUrl, stack, res, filter))
    })
    .catch((error) => dispatch({
      type: FETCH_STACK_FAILURE,
      payload: { error, serverUrl, stack }
    }))
}

export const fetchStackPage = ({ serverUrl, corpusId, stack, token, page }) => (dispatch) => {
  dispatch({
    type: FETCH_STACK_PAGE_REQUEST
  })
  return jsonrpc(serverUrl)(
    'store.get_webentities_page',
    [token, page, false, corpusId]
  ).then((res) => {
    dispatch({
      type: FETCH_STACK_PAGE_SUCCESS,
      payload: { serverUrl, corpusId, stack, webentities: res }
    })
  }).catch((error) => dispatch({
    type: FETCH_STACK_FAILURE,
    payload: { serverUrl, corpusId, stack, token, page, error }
  }))
}

export const viewWebentity = createAction(VIEW_WEBENTITY, (webentity) => ({ webentity }))
export const stoppedLoadingWebentity = createAction(STOPPED_LOADING_WEBENTITY)

export const fetchStackAndSetTab = ({ serverUrl, corpusId, stack, filter, tabId }) => (dispatch) => {
  return dispatch(fetchStack({ serverUrl, corpusId, stack, filter }))
    .then((action) => {
      const { payload } = action
      if (payload && payload.webentities && payload.webentities.webentities[0]) {
        const webentity = payload.webentities.webentities[0]
        dispatch(viewWebentity(webentity))
        if (tabId) {
          dispatch(setTabUrl({ url: webentity.homepage, id: tabId }))
        } else {
          dispatch(openTab({ url: webentity.homepage }))
        }
      }
    })
}

