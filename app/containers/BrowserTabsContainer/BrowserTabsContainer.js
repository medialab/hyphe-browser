import './BrowserTabsContainer.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { intlShape } from 'react-intl'

import {
  PAGE_HYPHE_HOME,
  HYPHE_TAB_ID,
  SHORTCUT_OPEN_TAB, SHORTCUT_CLOSE_TAB,
  SHORTCUT_NEXT_TAB, SHORTCUT_PREV_TAB,
  SHORTCUT_RELOAD_TAB, SHORTCUT_FULL_RELOAD_TAB
} from '../../constants'

import { openTab, closeTab, selectTab, 
  setTabUrl, setSearchEngine,
  selectHypheTab, selectNextTab, selectPrevTab } from '../../actions/tabs'
import BrowserTab from './BrowserTab'
import BrowserBar from '../../components/BrowserBar'
// import BrowserTabContent from './BrowserTabContent'
import NewTabContent from '../../components/NewTabContent'

const BrowserTabsContainer = ({
  tabs,
  activeTabId,
  searchEngines,
  corpus,
  // actions
  openTab,
  closeTab,
  selectTab,
  setTabUrl,
  setSearchEngine
}, { intl }) => {
  const { formatMessage } = intl
  const { total_webentities } = corpus

  const handleOpenTab = () => openTab(PAGE_HYPHE_HOME)
  
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
                    // webentity={ this.getWebentity(tab.id) }
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
              onClick={ handleOpenTab }
            />
          </div>
        </div>
      </div>
      <BrowserBar isLanding={ true } displayAddButton={ status === 'in' } />
      {
        tabs.map((tab) => {
          const handleSetTabUrl = (value) => setTabUrl(value, tab.id)
          const handleChangeEngine = (value) => setSearchEngine(value, corpus.corpus_id)
          return (tab.url === PAGE_HYPHE_HOME) ?
            <NewTabContent 
              isEmpty={ total_webentities===0 }
              selectedEngine = { searchEngines[corpus.corpus_id] || 'google' }
              onChangeEngine = { handleChangeEngine }
              onSetTabUrl={ handleSetTabUrl } 
            /> : null
          // return(
          //   <BrowserTabContent
          //     key={ tab.id }
          //     eventBus={ this.getEventBus(tab.id) }
          //     id={ tab.id }
          //      ebentity={ this.getWebentity(tab.id) }
          //     url={ tab.url }
          //     isEmpty={total_webentities === 0}
          //     closable={ tabs.length > 1 }
          //     loading={ tab.loading || false }
          //     disableWebentity={ tab.id === HYPHE_TAB_ID || tab.url === PAGE_HYPHE_HOME }
          //     disableNavigation={ !tab.navigable }
          //   />)
        })
      }
    </div>
  )
}

BrowserTabsContainer.contextTypes = {
  intl: intlShape
}

BrowserTabsContainer.propTypes = {
  tabs: PropTypes.array,
  activeTabId: PropTypes.string,
  corpus: PropTypes.object,
  instanceUrl: PropTypes.string,
  searchEngines: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,

  // actions
  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  selectNextTab: PropTypes.func.isRequired,
  selectPrevTab: PropTypes.func.isRequired,
  selectTab: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  setSearchEngine: PropTypes.func.isRequired
}

const mapStateToProps = ({ tabs, corpora, intl: { locale }, servers }) => ({
  tabs: tabs.tabs,
  activeTabId: tabs.activeTab && tabs.activeTab.id,
  corpus: corpora.selected && corpora.selected,
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
  setTabUrl
})(BrowserTabsContainer)