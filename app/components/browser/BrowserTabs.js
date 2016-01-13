import React, { PropTypes } from 'react'
import networkErrors from '@naholyr/chromium-net-errors'

import Tab from './BrowserTab'
import TabContent from './BrowserTabContent'

import { connect } from 'react-redux'
import { showError } from '../../actions/browser'
import * as tabActions from '../../actions/tabs'

class BrowserTabs extends React.Component {

  updateTabStatus (id, event, info) {
    switch (event) {
    case 'start':
      this.props.setTabStatus({ loading: true }, id)
      break
    case 'stop':
      this.props.setTabStatus({ loading: false, url: info }, id)
      break
    case 'title':
      this.props.setTabTitle(info, id)
      break
    case 'favicon':
      this.props.setTabIcon(info, id)
      break
    case 'error':
      const err = networkErrors.createByCode(info.errorCode)
      if (info.pageURL === info.validatedURL) {
        // Main page triggered the error, it's important
        this.props.showError({ message: err.message, fatal: false, icon: 'attention', timeout: 10000 })
        this.props.setTabStatus({ loading: false, url: info.pageURL, error: info }, id)
      }
      // Anyway, log to console
      console.error(err) // eslint-disable-line no-console
      break
    default:
      break
    }
  }

  renderTabContents () {
    return this.props.tabs.map((tab) => (
      <TabContent { ...tab } key={ tab.id } active={ this.props.activeTab === tab.id }
        onTabStatusUpdate={ (e, info) => this.updateTabStatus(tab.id, e, info) } />
    ))
  }

  renderTabs () {
    if (this.props.tabs.length === 0) {
      return <div className="browser-tab-emptyspace" />
    }

    return this.props.tabs.map((tab) => (
      <Tab { ...tab } key={ tab.id }  active={ this.props.activeTab === tab.id }
        selectTab={ this.props.selectTab } closeTab={ this.props.closeTab } />
    ))
  }

  render () {
    return (
      <div className="browser-navigator">
        <div className="tab-group browser-tabs">
          { this.renderTabs() }
          <div className="browser-tab-hyphe tab-item tab-item-fixed">
            TODO Hyphe special tab
          </div>
          <div className="browser-tap-new tab-item tab-item-fixed" onClick={ () => this.props.openTab('http://google.fr') }>
            <span className="icon icon-plus"></span>
          </div>
        </div>
        { this.renderTabContents() }
      </div>
    )
  }
}

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

  showError: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  selectTab: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired
}

const mapStateToProps = ({ tabs }) => tabs //  { tabs, activeTab }

const mapDispatchToProps = { showError, ...tabActions }

export default connect(mapStateToProps, mapDispatchToProps)(BrowserTabs)
