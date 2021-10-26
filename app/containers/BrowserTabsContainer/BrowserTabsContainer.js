import './BrowserTabsContainer.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer as ipc } from 'electron'
import { injectIntl } from 'react-intl'
import EventBus from 'jvent'

import {
  PAGE_HYPHE_HOME,
} from '../../constants'


import { openTab, closeTab, selectTab,
  setSearchEngine,
  selectHypheTab, selectNextTab, selectPrevTab } from '../../actions/tabs'

import BrowserTab from './BrowserTab'
import BrowserTabContent from './BrowserTabContent'

const { shortcuts } = require('../../shortcuts')
const {
  SHORTCUT_OPEN_TAB, SHORTCUT_CLOSE_TAB,
  SHORTCUT_NEXT_TAB, SHORTCUT_PREV_TAB,
  SHORTCUT_RELOAD_TAB, SHORTCUT_FULL_RELOAD_TAB
} = shortcuts
class BrowserTabsContainer extends React.Component {
  constructor (props) {
    super(props)

    // Event emitter for each tab, not a state or prop as it's not supposed
    // to trigger rerender
    this.tabEventBus = {}
  }

  componentDidMount () {
    this.ipcOpenTabHandler = () => this.props.openTab({ url: PAGE_HYPHE_HOME })
    ipc.on(SHORTCUT_OPEN_TAB, this.ipcOpenTabHandler)

    this.ipcCloseTabHandler = () =>
      this.props.tabs.length > 1 && this.props.activeTabId && this.props.closeTab(this.props.activeTabId)
    ipc.on(SHORTCUT_CLOSE_TAB, this.ipcCloseTabHandler)

    this.ipcNextTabHandler = () => this.props.selectNextTab()
    ipc.on(SHORTCUT_NEXT_TAB, this.ipcNextTabHandler)

    this.ipcPrevTabHandler = () => this.props.selectPrevTab(this.props.activeTabId)
    ipc.on(SHORTCUT_PREV_TAB, this.ipcPrevTabHandler)

    this.ipcReloadHandler = () => this.props.activeTabId && this.reloadTab(this.props.activeTabId, false)
    ipc.on(SHORTCUT_RELOAD_TAB, this.ipcReloadHandler)

    this.ipcFullReloadHandler = () => this.props.activeTabId && this.reloadTab(this.props.activeTabId, true)
    ipc.on(SHORTCUT_FULL_RELOAD_TAB, this.ipcFullReloadHandler)
  }

  componentWillUnmount () {
    ipc.removeListener(SHORTCUT_OPEN_TAB, this.ipcOpenTabHandler)
    ipc.removeListener(SHORTCUT_CLOSE_TAB, this.ipcCloseTabHandler)
    ipc.removeListener(SHORTCUT_NEXT_TAB, this.ipcNextTabHandler)
    ipc.removeListener(SHORTCUT_PREV_TAB, this.ipcPrevTabHandler)
    ipc.removeListener(SHORTCUT_RELOAD_TAB, this.ipcReloadHandler)
    ipc.removeListener(SHORTCUT_FULL_RELOAD_TAB, this.ipcFullReloadHandler)
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
      status,
      webentities,
      // actions
      openTab,
      closeTab,
      selectTab,
      setSearchEngine,
      setAsideMode,
      intl
    } = this.props

    const { formatMessage } = intl
    const handleOpenNewTab = () => openTab({ url: PAGE_HYPHE_HOME })
    const handleGetWebentity = (tabId) => webentities && webentities.webentities[webentities.tabs[tabId]]

    return (
      <div className="browser-tabs-container">
        <div className="browser-tabs">
          <div className="browser-tab-labels">
            <div className="browser-tab-labels-main">
              {
                tabs.map((tab) => {
                  const isNewTab = tab.title === null
                  const title = tab.title

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
                className="browser-tab-new"
                onClick={ handleOpenNewTab }
              >
                <span className="hint--right" aria-label={ formatMessage({ id: 'open-tab' }) }>+</span>
              </div>
            </div>
          </div>
        </div>
        {
          tabs.map((tab) => {
            const handleChangeEngine = (value) => setSearchEngine({ searchEngine: value, corpusId: corpus.corpus_id })
            return (
              <BrowserTabContent
                key={ tab.id }
                eventBus={ this.getEventBus(tab.id) }
                id={ tab.id }
                webentity={ handleGetWebentity(tab.id) }
                url={ tab.url }
                title= { tab.title }
                isEmpty={ status.traph.webentities.total === 0 }
                closable={ tabs.length > 1 }
                loading={ tab.loading || false }
                selectedEngine = { searchEngines[corpus.corpus_id] || 'google' }
                onChangeEngine = { handleChangeEngine }
                setAsideMode = { setAsideMode }
                disableWebentity={ tab.url === PAGE_HYPHE_HOME }
                disableNavigatioFn={ !tab.navigable }
              />)
          })
        }
      </div>
    )
  }
}

BrowserTabsContainer.propTypes = {
  tabs: PropTypes.array,
  activeTabId: PropTypes.string,
  corpus: PropTypes.object,
  webentities: PropTypes.object,
  instanceUrl: PropTypes.string,
  searchEngines: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,

  // props action
  setAsideMode: PropTypes.func.isRequired,

  // redux actions
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
  status: corpora.selected && corpora.status.corpus,
  webentities,
  instanceUrl: servers.selected && servers.selected.home,
  searchEngines: corpora.searchEngines,
  locale,
})

export default injectIntl(connect(mapStateToProps, {
  openTab,
  closeTab,
  selectNextTab,
  selectPrevTab,
  selectTab,
  selectHypheTab,
  setSearchEngine,
})(BrowserTabsContainer))
