import { createAction } from 'redux-actions';

export const TOGGLE_SIDEBAR = '§_TOGGLE_SIDEBAR';
export const OPEN_TAB = '§_OPEN_TAB';
export const CLOSE_TAB = '§_CLOSE_TAB';
export const SELECT_TAB = '§_SELECT_TAB';

export const toggleSidebar = createAction(TOGGLE_SIDEBAR);
export const openTab = createAction(OPEN_TAB, (url = 'about:blank', title = 'New tab') => ({ url, title }));
export const closeTab = createAction(CLOSE_TAB, (id) => id);
export const selectTab = createAction(SELECT_TAB, (id) => id);
