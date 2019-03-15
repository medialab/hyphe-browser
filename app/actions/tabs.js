import { createAction } from 'redux-actions'

export const OPEN_TAB = '§_OPEN_TAB'
export const CLOSE_TAB = '§_CLOSE_TAB'
export const SELECT_NEXT_TAB = '§_SELECT_NEXT_TAB'
export const SELECT_PREV_TAB = '§_SELECT_PREV_TAB'
export const SELECT_TAB = '§_SELECT_TAB'
export const SET_TAB_URL = '§_SET_TAB_URL'
export const SET_TAB_TITLE = '§_SET_TAB_TITLE'
export const SET_TAB_ICON = '§_SET_TAB_ICON'
export const SET_TAB_STATUS = '§_SET_TAB_STATUS'
export const ADD_HYPHE_TAB = '§_SELECT_HYPHE_TAB'
export const SET_SEARCH_ENGINE = '§_SET_SEARCH_ENGINE'
export const ADD_NAVIGATION_HISTORY = '§_ADD_NAVIGATION_HISTORY'

export const openTab = createAction(OPEN_TAB, (url = 'about:blank', title = null) => ({ url, title }))
export const closeTab = createAction(CLOSE_TAB, (id) => id)
export const selectNextTab = createAction(SELECT_NEXT_TAB)
export const selectPrevTab = createAction(SELECT_PREV_TAB)
export const selectTab = createAction(SELECT_TAB, (id) => id)
export const setTabUrl = createAction(SET_TAB_URL, (url, id) => ({ id, url }))
export const setTabIcon = createAction(SET_TAB_ICON, (icon, id) => ({ id, icon }))
export const setTabTitle = createAction(SET_TAB_TITLE, (title, id) => ({ id, title }))
export const setTabStatus = createAction(SET_TAB_STATUS, ({ loading, error, url }, id) => ({ id, loading, error, url }))
export const addHypheTab = createAction(ADD_HYPHE_TAB, (instanceUrl, corpusId) => ({ instanceUrl, corpusId }))
export const setSearchEngine = createAction(SET_SEARCH_ENGINE, (value) => ({ value }))
export const addNavigationHistory = createAction(ADD_NAVIGATION_HISTORY, (url, corpusId) => ({url, corpusId}))
