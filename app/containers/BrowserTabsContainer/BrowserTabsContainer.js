import './BrowserTabsContainer.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer as ipc } from 'electron'
import { intlShape } from 'react-intl'
import EventBus from 'jvent'

import {
  PAGE_HYPHE_HOME,
  HYPHE_TAB_ID,
  SHORTCUT_OPEN_TAB, SHORTCUT_CLOSE_TAB,
  SHORTCUT_NEXT_TAB, SHORTCUT_PREV_TAB,
  SHORTCUT_RELOAD_TAB, SHORTCUT_FULL_RELOAD_TAB
} from '../../constants'

import { openTab, closeTab, selectTab, 
  setSearchEngine,
  selectHypheTab, selectNextTab, selectPrevTab } from '../../actions/tabs'

import BrowserTab from './BrowserTab'
import BrowserTabContent from './BrowserTabContent'


class BrowserTabsContainer extends React.Component {
  constructor (props) {
    super(props)

    // Event emitter for each tab, not a state or prop as it's not supposed
    // to trigger rerender
    this.tabEventBus = {}
  }

  componentDidMount () {
    this.ipcOpenTabHandler = () => this.props.openTab(PAGE_HYPHE_HOME)
    ipc.on(`shortcut-${SHORTCUT_OPEN_TAB}`, this.ipcOpenTabHandler)
    ipc.send('registerShortcut', SHORTCUT_OPEN_TAB)

    this.ipcCloseTabHandler = () =>
      this.props.tabs.length > 2 && this.props.activeTabId && this.props.closeTab(this.props.activeTabId)
    ipc.on(`shortcut-${SHORTCUT_CLOSE_TAB}`, this.ipcCloseTabHandler)
    ipc.send('registerShortcut', SHORTCUT_CLOSE_TAB)

    this.ipcNextTabHandler = () => this.props.selectNextTab()
    ipc.on(`shortcut-${SHORTCUT_NEXT_TAB}`, this.ipcNextTabHandler)
    ipc.send('registerShortcut', SHORTCUT_NEXT_TAB)

    this.ipcPrevTabHandler = () => this.props.selectPrevTab(this.props.activeTabId)
    ipc.on(`shortcut-${SHORTCUT_PREV_TAB}`, this.ipcPrevTabHandler)
    ipc.send('registerShortcut', SHORTCUT_PREV_TAB)

    this.ipcReloadHandler = () => this.props.activeTabId && this.reloadTab(this.props.activeTabId, false)
    ipc.on(`shortcut-${SHORTCUT_RELOAD_TAB}`, this.ipcReloadHandler)
    ipc.send('registerShortcut', SHORTCUT_RELOAD_TAB)

    this.ipcFullReloadHandler = () => this.props.activeTabId && this.reloadTab(this.props.activeTabId, true)
    ipc.on(`shortcut-${SHORTCUT_FULL_RELOAD_TAB}`, this.ipcFullReloadHandler)
    ipc.send('registerShortcut', SHORTCUT_FULL_RELOAD_TAB)
  }

  componentWillUnmount () {
    ipc.send('unregisterShortcut', SHORTCUT_OPEN_TAB)
    ipc.send('unregisterShortcut', SHORTCUT_CLOSE_TAB)
    ipc.send('unregisterShortcut', SHORTCUT_NEXT_TAB)
    ipc.send('unregisterShortcut', SHORTCUT_PREV_TAB)
    ipc.send('unregisterShortcut', SHORTCUT_RELOAD_TAB)
    ipc.send('unregisterShortcut', SHORTCUT_FULL_RELOAD_TAB)

    ipc.removeListener(`shortcut-${SHORTCUT_OPEN_TAB}`, this.ipcOpenTabHandler)
    ipc.removeListener(`shortcut-${SHORTCUT_CLOSE_TAB}`, this.ipcCloseTabHandler)
    ipc.removeListener(`shortcut-${SHORTCUT_NEXT_TAB}`, this.ipcNextTabHandler)
    ipc.removeListener(`shortcut-${SHORTCUT_PREV_TAB}`, this.ipcPrevTabHandler)
    ipc.removeListener(`shortcut-${SHORTCUT_RELOAD_TAB}`, this.ipcReloadHandler)
    ipc.removeListener(`shortcut-${SHORTCUT_FULL_RELOAD_TAB}`, this.ipcFullReloadHandler)
  }

  reloadTab (id, ignoreCache) {
    this.getEventBus(id).emit('reload', ignoreCache)
  }

  getEventBus (tabId) {
    return this.tabEventBus[tabId] || (this.tabEventBus[tabId] = new EventBus())
  }

  render () {
    const {
      tabs,
      activeTabId,
      searchEngines,
      corpus,
      webentities,
      // actions
      openTab,
      closeTab,
      selectTab,
      setSearchEngine
    } = this.props

    const { intl } = this.context
    const { formatMessage } = intl
    const { total_webentities } = corpus


    const handleOpenNewTab = () => openTab(PAGE_HYPHE_HOME)
    const handleGetWebentity = (tabId) => webentities && webentities.webentities[webentities.tabs[tabId]]

    return (
      <div>
        <div className="browser-tabs">
          <div className="browser-tab-labels">
            <div className="browser-tab-labels-main">
              {
                tabs.map((tab) => {
                  const isNewTab = tab.id !== HYPHE_TAB_ID && tab.title === null
                  const title = tab.id === HYPHE_TAB_ID ? formatMessage({ id: 'hyphe-tab-title' }) : tab.title
            
                  const handleSelectTab = () => {
                    if (activeTabId === tab.id) return
                    selectTab(tab.id)
                  }
                  return (
                    <BrowserTab
                      key={ tab.id }
                      { ...tab }
                      closable={ tabs.length !== 1 }
                      title={ title }
                      webentity={ handleGetWebentity(tab.id) }
                      newTab={ isNewTab }
                      active={ activeTabId === tab.id }
                      selectTab={ handleSelectTab }
                      openTab={ openTab }
                      closeTab={ closeTab }
                    />
                  )
                })
              }
              <div
                className="browser-tab-new" title={ formatMessage({ id: 'open-tab' }) }
                onClick={ handleOpenNewTab }
              />
            </div>
          </div>
        </div>
        {
          tabs.map((tab) => {

            const handleChangeEngine = (value) => setSearchEngine(value, corpus.corpus_id)
            return (
              <BrowserTabContent
                key={ tab.id }
                eventBus={ this.getEventBus(tab.id) }
                id={ tab.id }
                webentity={ handleGetWebentity(tab.id) }
                url={ tab.url }
                title= { tab.title }
                isEmpty={ total_webentities === 0 }
                closable={ tabs.length > 1 }
                loading={ tab.loading || false }
                selectedEngine = { searchEngines[corpus.corpus_id] || 'google' }
                onChangeEngine = { handleChangeEngine }
                disableWebentity={ tab.id === HYPHE_TAB_ID || tab.url === PAGE_HYPHE_HOME }
                disableNavigatioFn={ !tab.navigable } />)
          })
        }
      </div>
    )
  }
}

BrowserTabsContainer.contextTypes = {
  intl: intlShape
}

BrowserTabsContainer.propTypes = {
  tabs: PropTypes.array,
  activeTabId: PropTypes.string,
  corpus: PropTypes.object,
  webentities: PropTypes.array,
  instanceUrl: PropTypes.string,
  searchEngines: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,

  // actions
  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  selectNextTab: PropTypes.func.isRequired,
  selectPrevTab: PropTypes.func.isRequired,
  selectTab: PropTypes.func.isRequired,
  setSearchEngine: PropTypes.func.isRequired
}

const mapStateToProps = ({ tabs, corpora, webentities, intl: { locale }, servers }) => ({
  tabs: tabs.tabs,
  activeTabId: tabs.activeTab && tabs.activeTab.id,
  corpus: corpora.selected && corpora.selected,
  webentities,
  instanceUrl: servers.selected && servers.selected.home,
  searchEngines: corpora.searchEngines,
  locale,
})

export default connect(mapStateToProps, {
  openTab,
  closeTab,
  selectNextTab,
  selectPrevTab,
  selectTab,
  selectHypheTab,
  setSearchEngine,
})(BrowserTabsContainer)