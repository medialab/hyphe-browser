import React, { PropTypes } from 'react'
import WebView from './WebView'
import Button from '../Button'
import BrowserTabUrlField from './BrowserTabUrlField'

import { connect } from 'react-redux'
import { showError } from '../../actions/browser'
import { setTabUrl, setTabStatus, setTabTitle, setTabIcon, openTab } from '../../actions/tabs'
import { declarePage } from '../../actions/webentities'

import networkErrors from '@naholyr/chromium-net-errors'

class TabContent extends React.Component {

  constructor (props) {
    super(props)
    this.state = { webentity: null, disableBack: true, disableForward: true }
    this.navigationActions = {} // Mutated by WebView
  }

  updateTabStatus (event, info) {
    const { id, setTabStatus, setTabTitle, setTabUrl, openTab, setTabIcon, showError, declarePage, serverUrl, corpusId } = this.props

    if (this.navigationActions.canGoBack && this.navigationActions.canGoForward) {
      this.setState({
        disableBack: !this.navigationActions.canGoBack(),
        disableForward: !this.navigationActions.canGoForward()
      })
    }

    switch (event) {
    case 'start':
      setTabStatus({ loading: true, url: info }, id)
      this.setState({ webentity: null }) // TODO Use an action & reducer
      break
    case 'stop':
      setTabStatus({ loading: false, url: info }, id)
      setTabUrl(info, id) // Trigger declare_page here
      declarePage(serverUrl, corpusId, info).then(({ payload: { webentity } }) => {
        // Interesting fields:
        /*
        created: true
        crawling_status: "UNCRAWLED"
        creation_date: "1452529632"
        homepage: null FIXME never defined, is it really required on crawl?
        id: "b3766d21-56fa-424f-916a-413fdf04e1b8"
        indexing_status: "UNINDEXED"
        last_modification_date: "1452529632"
        lru_prefixes: Array
        name: "Google"
        startpages: Array
        status: "DISCOVERED"
        */
        console.debug('Web Entity', webentity)
        this.setState({ webentity: webentity }) // TODO Use an action & reducer
      })
      break
    case 'title':
      setTabTitle(info, id)
      break
    case 'favicon':
      setTabIcon(info, id)
      break
    case 'open': // link in new tab
      openTab(info)
      break
    case 'error':
      const err = networkErrors.createByCode(info.errorCode)
      if (info.pageURL === info.validatedURL) {
        // Main page triggered the error, it's important
        showError({ message: err.message, fatal: false, icon: 'attention', timeout: 10000 })
        setTabStatus({ loading: false, url: info.pageURL, error: info }, id)
      }
      // Anyway, log to console
      if (process.env.NODE_ENV === 'development') {
        console.debug(info) // eslint-disable-line no-console
      }
      console.error(err) // eslint-disable-line no-console
      break
    default:
      break
    }
  }

  render () {
    const { active, id, url, setTabUrl } = this.props

    return (
      <div key={ id } className="browser-tab-content" style={ active ? {} : { display: 'none' } }>
        <div className="toolbar toolbar-header">
          <div className="toolbar-actions">
            <div className="btn-group tab-toolbar-navigation">
              <Button size="large" icon="left-open" disabled={ this.state.disableBack } onClick={ () => this.navigationActions.back() } />
              <Button size="large" icon="right-open" disabled={ this.state.disableForward } onClick={ () => this.navigationActions.forward() } />
              <Button size="large" icon="ccw" onClick={ () => this.navigationActions.reload() } />
            </div>
            <div className="btn-group tab-toolbar-url">
              <BrowserTabUrlField initialUrl={ url } onSubmit={ (url) => setTabUrl(url, id) } />
            </div>
            <div className="btn-group tab-toolbar-webentity">
              <Button size="large" icon="home" disabled={ !this.state.webentity || !this.state.webentity.homepage } onClick={ () => setTabUrl(this.state.webentity.homepage, id) } />
              <input className="btn btn-large" type="text" value={ this.state.webentity ? this.state.webentity.name : '…' } readOnly />
              <Button size="large" icon="pencil" disabled={ !this.state.webentity } onClick={ () => this.navigationActions.reload() } />
            </div>
          </div>
        </div>
        <WebView id={ id } url={ url }
          onStatusUpdate={ (e, i) => this.updateTabStatus(e, i) }
          onNavigationActionsReady={ (actions) => Object.assign(this.navigationActions, actions) } />
      </div>
    )
  }
}

TabContent.propTypes = {
  id: PropTypes.string.isRequired,

  active: PropTypes.bool.isRequired,
  url: PropTypes.string.isRequired,
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,

  showError: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired,
  declarePage: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, servers, tabs }, { id }) => {
  const tab = tabs.tabs.find((tab) => tab.id === id)
  return {
    id,
    active: tab.id === tabs.activeTab,
    url: tab.url,
    serverUrl: servers.selected.url,
    corpusId: corpora.selected.corpus_id
  }
}

const mapDispatchToProps = { showError, setTabUrl, openTab ,setTabStatus, setTabTitle, setTabIcon, declarePage }

export default connect(mapStateToProps, mapDispatchToProps)(TabContent)
