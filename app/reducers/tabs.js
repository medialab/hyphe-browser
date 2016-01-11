import createReducer from '../utils/create-reducer'
import uuid from 'uuid'
import {
  OPEN_TAB, CLOSE_TAB, SELECT_TAB
} from '../actions/tabs'


const initialState = {
  tabs: [], // tab: { url, id, title, icon, loading, error }
  activeTab: null // id of active tab
}

export default createReducer(initialState, {

  [OPEN_TAB]: (state, { url, title }) => {
    const id = uuid()
    const icon = null // TODO

    return {
      ...state,
      tabs: state.tabs.concat({ url, id, title, icon }),
      activeTab: id
    }
  },

  [CLOSE_TAB]: (state, id) => {
    const tabs = state.tabs.filter((tab) => tab.id !== id)
    // if active tab is closed: switch to next tab (or last)
    const tabIndex = state.tabs.findIndex((tab) => tab.id === id)
    const activeTab = (id === state.activeTab) ? (tabs[tabIndex] || tabs[tabs.length - 1]).id : state.activeTab

    return {
      ...state,
      tabs,
      activeTab
    }
  },

  [SELECT_TAB]: (state, id) => ({
    ...state,
    activeTab: id
  })

})
