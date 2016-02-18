import createReducer from '../utils/create-reducer'
import uuid from 'uuid'

import { PAGE_HYPHE_HOME } from '../constants'
import {
  OPEN_TAB, CLOSE_TAB, SELECT_TAB,
  SET_TAB_URL, SET_TAB_TITLE, SET_TAB_ICON, SET_TAB_STATUS
} from '../actions/tabs'
import { SELECT_CORPUS } from '../actions/corpora'

const pageHypheHome = {
  url: PAGE_HYPHE_HOME,
  id: uuid(),
  title: null,
  icon: null,
  loading: false,
  error: null
}

const initialState = {
  tabs: [pageHypheHome], // tab: { url, id, title, icon, loading, error }
  activeTab: pageHypheHome // reference to active tab
}

export default createReducer(initialState, {

  [OPEN_TAB]: (state, { url, title }) => {
    const id = uuid()
    const icon = null // TODO default icon
    const tab = { url, id, title, icon }

    return {
      ...state,
      tabs: state.tabs.concat(tab),
      activeTab: tab
    }
  },

  [CLOSE_TAB]: (state, id) => {
    const tabs = state.tabs.filter((tab) => tab.id !== id)
    // if active tab is closed: switch to next tab (or last)
    const tabIndex = state.tabs.findIndex((tab) => tab.id === id)
    const nextTab = tabs[tabIndex] || tabs[tabs.length - 1] || null
    const activeTab = (id === state.activeTab) ? nextTab : state.activeTab

    return {
      ...state,
      tabs,
      activeTab
    }
  },

  [SELECT_TAB]: (state, id) => ({
    ...state,
    activeTab: state.tabs.find((tab) => tab.id === id)
  }),

  [SET_TAB_URL]: (state, { id, url }) => updateTab(state, id, () => ({ url })),
  [SET_TAB_TITLE]: (state, { id, title }) => updateTab(state, id, () => ({ title })),
  [SET_TAB_ICON]: (state, { id, icon }) => updateTab(state, id, () => ({ icon })),
  [SET_TAB_STATUS]: (state, { id, loading, error, url }) => updateTab(state, id, (tab) => ({ loading, error, url: url || tab.url })),

  // Reset state when selecting corpus
  [SELECT_CORPUS]: () => ({ ...initialState })

})


function updateTab (state, id, updates) {
  const foundTab = state.tabs.find((tab) => tab.id === id)
  const updatedTab = { ...foundTab, ...updates(foundTab) }
  const tabs = state.tabs.map((tab) => (tab.id === id) ? updatedTab : tab)
  const activeTab = (state.activeTab && state.activeTab.id === id) ? updatedTab : state.activeTab

  return { ...state, tabs, activeTab }
}
