import createReducer from '../utils/create-reducer'
import uuid from 'uuid'

import { PAGE_HYPHE_HOME, HYPHE_TAB_ID } from '../constants'
import {
  OPEN_TAB, CLOSE_TAB, SELECT_TAB,
  SET_TAB_URL, SET_TAB_TITLE, SET_TAB_ICON, SET_TAB_STATUS,
  ADD_HYPHE_TAB
} from '../actions/tabs'
import { SELECT_CORPUS } from '../actions/corpora'

const defaultTab = {
  title: null, // title === null is a specific case handled later
  icon: null, // TODO default icon?
  loading: false,
  error: null,
  fixed: false,
  navigable: true
}

const pageHypheHome = {
  ...defaultTab,
  url: PAGE_HYPHE_HOME,
  id: uuid()
}

const hypheTab = {
  ...defaultTab,
  url: '{INSTANCE_HOME}/#/project/{CORPUS_ID}/network', // defined dynamically
  id: HYPHE_TAB_ID,
  fixed: true,
  navigable: false
}

const initialState = {
  tabs: [pageHypheHome], // tab: { url, id, title, icon, loading, error }
  activeTab: pageHypheHome // reference to active tab
}

export default createReducer(initialState, {

  [OPEN_TAB]: (state, { url, title }) => {
    const tab = {
      ...defaultTab,
      id: uuid(),
      url,
      title
    }

    return {
      ...state,
      tabs: state.tabs.concat(tab),
      activeTab: tab
    }
  },

  [CLOSE_TAB]: (state, id) => {
    const tab = state.tabs.find((tab) => tab.id === id)
    if (tab.fixed) {
      // Fixed tabs cannot be closed
      return state
    }

    // Remove tab from the list
    const tabs = state.tabs.filter((tab) => tab.id !== id)

    // if active tab is closed: switch to next tab (or last)
    let activeTab = state.activeTab
    if (activeTab && activeTab.id === id) {
      // Set to the one on the left
      activeTab = state.tabs[state.tabs.findIndex((tab) => tab.id === id) - 1]
      if (!activeTab) {
        // No tab on the left? Set to last tab
        activeTab = state.tabs[state.tabs.length - 1]
        if (activeTab && activeTab.id === id) {
          // Ooops, closed tab was already the last one, okay, set to previous one then
          activeTab = state.tabs[state.tabs.length - 2]
        }
      }
    }

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

  [ADD_HYPHE_TAB]: (state, { instanceUrl, corpusId }) => ({
    ...state,
    tabs: state.tabs.concat([{
      ...hypheTab,
      url: hypheTab.url
        .replace(/\{INSTANCE_HOME\}/g, instanceUrl)
        .replace(/\{CORPUS_ID\}/g, corpusId)
    }])
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
