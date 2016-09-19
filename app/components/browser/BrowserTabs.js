import '../../css/browser/browser-tabs'

import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import cx from 'classnames'
import { ipcRenderer as ipc } from 'electron'
import { intlShape } from 'react-intl'
import EventBus from 'jvent'

import Tab from './BrowserTab'
import TabContent from './BrowserTabContent'
import { tabShape } from '../../types'

import { openTab, closeTab, selectTab, selectHypheTab, selectNextTab, selectPrevTab } from '../../actions/tabs'
import {
  PAGE_HYPHE_HOME,
  HYPHE_TAB_ID,
  SHORTCUT_OPEN_TAB, SHORTCUT_CLOSE_TAB,
  SHORTCUT_NEXT_TAB, SHORTCUT_PREV_TAB,
  SHORTCUT_RELOAD_TAB, SHORTCUT_FULL_RELOAD_TAB
} from '../../constants'

class BrowserTabs extends React.Component {
  constructor (props) {
    super(props)

    // Event emitter for each tab, not a state or prop as it's not supposed
    // to trigger rerender
    this.tabEventBus = {}
  }

  componentDidMount () {
    const node = findDOMNode(this)
    this.tabsNode = node.querySelector('.browser-tabs-group-main')

    // Listen for resize
    // window.addEventListener('resize', this.onResize)

    this.ipcOpenTabHandler = () => this.props.openTab(PAGE_HYPHE_HOME)
    ipc.on(`shortcut-${SHORTCUT_OPEN_TAB}`, this.ipcOpenTabHandler)
    ipc.send('registerShortcut', SHORTCUT_OPEN_TAB)

    this.ipcCloseTabHandler = () => this.props.activeTabId && this.props.closeTab(this.props.activeTabId)
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
    // window.removeEventListener('resize', this.onResize)

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

  componentDidUpdate () {
    // this.updateTabsOverflow()
  }

  reloadTab (id, ignoreCache) {
    this.getEventBus(id).emit('reload', ignoreCache)
  }

  getEventBus (tabId) {
    return this.tabEventBus[tabId] || (this.tabEventBus[tabId] = new EventBus())
  }

  getWebentity (tabId) {
    const { webentities } = this.props
    return webentities && webentities.webentities[webentities.tabs[tabId]]
  }

  renderTabContents () {
    return this.props.tabs.map((tab) => (
      <TabContent key={ tab.id }
        eventBus={ this.getEventBus(tab.id) }
        id={ tab.id }
        webentity={ this.getWebentity(tab.id) }
        url={ tab.url }
        loading={ tab.loading || false }
        disableWebentity={ tab.id === HYPHE_TAB_ID || tab.url === PAGE_HYPHE_HOME }
        disableNavigation={ !tab.navigable }
      />
    ))
  }

  renderTabs (fixed) {
    const { formatMessage } = this.context.intl
    const tabs = this.props.tabs.filter((tab) => !!tab.fixed === fixed)

    return tabs.map((tab) => {
      const isNewTab = tab.id !== HYPHE_TAB_ID && tab.title === null
      const title = tab.id === HYPHE_TAB_ID ? formatMessage({ id: 'hyphe-tab-title' }) : tab.title

      return (
        <Tab key={ tab.id }
          { ...tab }
          closable={ tabs.length !== 1 }
          title={ title }
          webentity={ this.getWebentity(tab.id) }
          newTab={ isNewTab }
          active={ this.props.activeTabId === tab.id }
          selectTab={ this.props.selectTab }
          openTab={ this.props.openTab }
          closeTab={ this.props.closeTab }
        />
      )
    })
  }

  render () {
    return (
      <div className="browser-tabs">
        <div className="browser-tabs-group">
          <div className="browser-tabs-group-edge">
            { this.renderTabs(true) }
          </div>
          <div className="browser-tabs-group-main">
            { this.renderTabs(false) }
            <div className="browser-tab-new"
              onClick={ () => this.props.openTab(PAGE_HYPHE_HOME) }>
            </div>
          </div>
        </div>
        { this.renderTabContents() }
      </div>
    )
  }
}

BrowserTabs.contextTypes = {
  intl: intlShape
}

BrowserTabs.propTypes = {
  tabs: PropTypes.arrayOf(tabShape).isRequired,
  activeTabId: PropTypes.string,

  corpusId: PropTypes.string,
  instanceUrl: PropTypes.string,

  webentities: PropTypes.object,

  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  selectNextTab: PropTypes.func.isRequired,
  selectPrevTab: PropTypes.func.isRequired,
  selectTab: PropTypes.func.isRequired
}

const mapStateToProps = ({ tabs, corpora, servers, webentities }) => ({
  tabs: tabs.tabs,
  activeTabId: tabs.activeTab && tabs.activeTab.id,
  corpusId: corpora.selected && corpora.selected.corpus_id,
  instanceUrl: servers.selected && servers.selected.home,
  webentities: webentities
})

const mapDispatchToProps = {
  openTab,
  closeTab,
  selectNextTab,
  selectPrevTab,
  selectTab,
  selectHypheTab
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserTabs)
