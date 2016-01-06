import { createAction } from 'redux-actions';

export const TOGGLE_SIDEBAR = '§_TOGGLE_SIDEBAR';
export const OPEN_TAB = '§_OPEN_TAB';
export const CLOSE_TAB = '§_CLOSE_TAB';
export const SELECT_TAB = '§_SELECT_TAB';
export const SET_TAB_URL = '§_SET_TAB_URL';
export const SET_TAB_TITLE = '§_SET_TAB_TITLE';
export const SET_TAB_ICON = '§_SET_TAB_ICON';
export const SET_TAB_STATUS = '§_SET_TAB_STATUS';

export const toggleSidebar = createAction(TOGGLE_SIDEBAR);
export const openTab = createAction(OPEN_TAB, (url = 'about:blank', title = 'New tab') => ({ url, title }));
export const closeTab = createAction(CLOSE_TAB, (id) => id);
export const selectTab = createAction(SELECT_TAB, (id) => id);
export const setTabUrl = createAction(SET_TAB_URL, (url, id) => ({ id, url }));
export const setTabIcon = createAction(SET_TAB_ICON, (icon, id) => ({ id, icon }));
export const setTabTitle = createAction(SET_TAB_TITLE, (title, id) => ({ id, title }));
export const setTabStatus = createAction(SET_TAB_STATUS, ({ loading, error, url }, id) => ({ id, loading, error, url }));