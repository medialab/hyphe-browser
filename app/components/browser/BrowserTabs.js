import React, { PropTypes } from 'react'
import networkErrors from '@naholyr/chromium-net-errors'

import Tab from './BrowserTab'
import TabContent from './BrowserTabContent'

import { connect } from 'react-redux'
import * as tabActions from '../../actions/tabs'

const BrowserTabs = (props) => (
  <div className="browser-navigator">
    <div className="tab-group browser-tabs">
      { renderTabs(props) }
      <div className="browser-tab-hyphe tab-item tab-item-fixed">
        TODO Hyphe special tab
      </div>
      <div className="browser-tap-new tab-item tab-item-fixed" onClick={ () => props.openTab('http://google.fr') }>
        <span className="icon icon-plus"></span>
      </div>
    </div>
    { renderTabContents(props) }
  </div>
)

const updateTabStatus = ({ setTabStatus, setTabTitle, setTabIcon, showError }, id) => (event, info) => {
  switch (event) {

  case 'start':
    setTabStatus({ loading: true }, id)
    break

  case 'stop':
    setTabStatus({ loading: false, url: info }, id)
    break

  case 'title':
    setTabTitle(info, id)
    break

  case 'favicon':
    setTabIcon(info, id)
    break

  case 'error':
    const err = networkErrors.createByCode(info.errorCode)
    if (info.pageURL === info.validatedURL) {
      // Main page triggered the error, it's important
      showError({ message: err.message, fatal: false, icon: 'attention', timeout: 10000 })
      setTabStatus({ loading: false, url: info.pageURL, error: info }, id)
    }
    // Anyway, log to console
    console.error(err) // eslint-disable-line no-console
    break

  default:
    break

  }
}

const renderTabContents = (props) => (props.tabs.map((tab) => (
  <TabContent { ...tab } key={ tab.id } active={ props.activeTab === tab.id }
    onTabStatusUpdate={ updateTabStatus(props, tab.id) } notifyTab={ props.notifyTab } />
)))

const renderTabs = ({ tabs, activeTab, selectTab, closeTab }) => ((tabs.length === 0)
  ? <div className="browser-tab-emptyspace" />
  : tabs.map((tab) => (
    <Tab { ...tab } key={ tab.id }  active={ activeTab === tab.id }
      selectTab={ selectTab } closeTab={ closeTab } />
  ))
)

BrowserTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.object
  })).isRequired,
  activeTab: PropTypes.string,

  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  selectTab: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired
}

const mapStateToProps = ({ tabs }) => tabs //  { tabs, activeTab }

const mapDispatchToProps = tabActions

export default connect(mapStateToProps, mapDispatchToProps)(BrowserTabs)
