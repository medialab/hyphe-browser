import React, { PropTypes } from 'react'
import WebView from './WebView'
import networkErrors from '@naholyr/chromium-net-errors'

import { connect } from 'react-redux'
import * as tabActions from '../../actions/tabs'

const updateTabStatus = ({ setTabStatus, setTabTitle, setTabIcon, showError }) => (id, event, info) => {
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

const renderWebViews = (props) => (props.tabs.map(({ url }) => (
  <WebView url={ url } onStatusUpdate={ updateTabStatus(props) } />
)))

const renderTabs = ({ tabs, activeTab, selectTab, closeTab }) => (tabs.map(({ id, title, icon, loading }) => (
  <div key={ id } className={ 'tab-item ' + ((activeTab === id) ? ' active' : '') } onClick={ () => selectTab(id) }>
    <span className="icon icon-cancel icon-close-tab" onClick={ (e) => { e.stopPropagation(); closeTab(id) } }></span>
    { loading
      ? <span className="icon icon-dot-3" />
      : (icon
        ? <img src={ icon } width="16" height="16" className="tab-favicon" />
        : <noscript />
      )
    }
    { title }
  </div>
)))

const BrowserTabs = (props) => (
  <div>
    <div className="tab-group">
      { renderTabs(props) }
      <div className="tab-item tab-item-fixed">
        TODO Hyphe special tab
      </div>
      <div className="tab-item tab-item-fixed" onClick={ () => props.openTab() }>
        <span className="icon icon-plus"></span>
      </div>
    </div>
    { renderWebViews(props) }
  </div>
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
