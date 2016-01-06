import createReducer from '../utils/create-reducer';
import uuid from 'uuid';
import {
  OPEN_TAB, CLOSE_TAB, SELECT_TAB,
  TOGGLE_SIDEBAR,
  SET_TAB_URL, SET_TAB_TITLE, SET_TAB_ICON, SET_TAB_STATUS
} from '../actions/browser';


const initialState = {
  sidebarVisible: false,
  tabs: [], // tab: { url, id, title, icon, loading, error }
  activeTab: null, // id of active tab
};

export default createReducer(initialState, {

  [OPEN_TAB]: (state, { url, title }) => {
    const id = uuid();
    const icon = null; // TODO

    return {
      ...state,
      tabs: state.tabs.concat({ url, id, title, icon }),
      activeTab: id,
    };
  },

  [CLOSE_TAB]: (state, id) => {
    const tabs = state.tabs.filter((tab) => tab.id !== id);
    // if active tab is closed: switch to next tab (or last)
    const tabIndex = state.tabs.findIndex((tab) => tab.id === id);
    const activeTab = (id === state.activeTab) ? (tabs[tabIndex] || tabs[tabs.length - 1]).id : state.activeTab;

    return {
      ...state,
      tabs,
      activeTab,
    };
  },

  [TOGGLE_SIDEBAR]: (state) => ({
    ...state,
    sidebarVisible: !state.sidebarVisible,
  }),

  [SELECT_TAB]: (state, id) => ({
    ...state,
    activeTab: id,
  }),

  [SET_TAB_URL]: (state, { id, url }) => {
    const tabId = id || state.activeTab;
    const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
    const head = state.tabs.slice(0, tabIndex);
    const tail = state.tabs.slice(tabIndex + 1);
    const tab = { ...state.tabs[tabIndex], url };
    const tabs = head.concat([tab]).concat(tail);

    return {
      ...state,
      tabs,
    };
  },

  [SET_TAB_TITLE]: (state, { id, title }) => ({
    ...state,
    tabs: state.tabs.map((tab) => (tab.id === id) ? { ...tab, title } : tab)
  }),

  [SET_TAB_ICON]: (state, { id, icon }) => ({
    ...state,
    tabs: state.tabs.map((tab) => (tab.id === id) ? { ...tab, icon } : tab)
  }),

  [SET_TAB_STATUS]: (state, { id, loading, error, url }) => ({
    ...state,
    tabs: state.tabs.map((tab) => (tab.id === id) ? { ...tab, loading, error, url: url || tab.url } : tab)
  }),

});