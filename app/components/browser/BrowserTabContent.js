import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import WebView from './WebView'
import Button from '../Button'
import BrowserTabUrlField from './BrowserTabUrlField'
import BrowserSideBar from './BrowserSideBar'
import SplitPane from 'react-split-pane'
import BrowserTabWebentityNameField from './BrowserTabWebentityNameField'

import { showError } from '../../actions/browser'
import { setTabUrl, setTabStatus, setTabTitle, setTabIcon, openTab } from '../../actions/tabs'
import { declarePage, setTabWebentity, setWebentityHomepage, setWebentityName } from '../../actions/webentities'

import networkErrors from '@naholyr/chromium-net-errors'

class TabContent extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      disableBack: true, disableForward: true,
      adjust: false,
      adjustHomepage: null, adjustName: null
    }
    this.navigationActions = {} // Mutated by WebView
  }

  updateTabStatus (event, info) {
    const { id, setTabStatus, setTabTitle, setTabUrl, openTab, setTabIcon, showError, declarePage, setTabWebentity, serverUrl, corpusId } = this.props

    if (this.navigationActions.canGoBack && this.navigationActions.canGoForward) {
      this.setState({
        disableBack: !this.navigationActions.canGoBack(),
        disableForward: !this.navigationActions.canGoForward()
      })
    }

    switch (event) {
    case 'start':
      setTabStatus({ loading: true, url: info }, id)
      setTabWebentity(id, null)
      break
    case 'stop':
      setTabStatus({ loading: false, url: info }, id)
      setTabUrl(info, id)
      declarePage(serverUrl, corpusId, info, id)
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

  saveAdjustChanges () {
    const { serverUrl, corpusId, webentity, setWebentityHomepage, setWebentityName } = this.props

    if (this.state.adjustHomepage) {
      setWebentityHomepage(serverUrl, corpusId, this.state.adjustHomepage, webentity.id)
      this.setState({ adjustHomepage: null })
    }

    if (this.state.adjustName !== webentity.name) {
      setWebentityName(serverUrl, corpusId, this.state.adjustName, webentity.id)
    }

    this.setState({ adjust: false })
  }

  renderHomeButton () {
    const { webentity, setTabUrl, url, id } = this.props

    if (this.state.adjust) {
      return <Button size="large" icon="home" title="Set homepage"
        disabled={ !webentity }
        onClick={ () => this.setState({ adjustHomepage: url }) } />
    } else if (webentity && webentity.homepage) {
      return <Button size="large" icon="home" title={ 'Go to homepage (' + webentity.homepage + ')' }
        disabled={ !webentity || webentity.homepage === url }
        onClick={ () => setTabUrl(webentity.homepage, id) } />
    } else {
      return <Button size="large" icon="home" title="No homepage set"
        disabled={ true }
        onClick={ () => {} } />
    }
  }

  renderAdjustButton () {
    if (this.state.adjust) {
      return <Button size="large" icon="check" title="Save changes"
        disabled={ false }
        onClick={ () => { this.saveAdjustChanges() } } />
    } else {
      return <Button size="large" icon="pencil" title="Adjust"
        disabled={ !this.props.webentity }
        onClick={ () => this.setState({ adjust: true }) } />
    }
  }

  render () {
    const { active, id, url, webentity, setTabUrl } = this.props

    return (
      <div key={ id } className="browser-tab-content" style={ active ? {} : { display: 'none' } }>
        <div className="toolbar toolbar-header">
          <div className="toolbar-actions">
            <div className="btn-group tab-toolbar-navigation">
              <Button size="large" icon="left-open" disabled={ this.state.adjust || this.state.disableBack } onClick={ () => this.navigationActions.back() } />
              <Button size="large" icon="right-open" disabled={ this.state.adjust || this.state.disableForward } onClick={ () => this.navigationActions.forward() } />
              <Button size="large" icon="ccw" disabled={ this.state.adjust } onClick={ () => this.navigationActions.reload() } />
            </div>
            <div className="btn-group tab-toolbar-url">
              <BrowserTabUrlField initialUrl={ url } onSubmit={ (url) => setTabUrl(url, id) } adjust={ this.state.adjust } />
              { id } → { webentity && webentity.id }
            </div>
            <div className="btn-group tab-toolbar-webentity">
              { this.renderHomeButton () }
              <BrowserTabWebentityNameField initialValue={ webentity && webentity.name } editable={ this.state.adjust } onChange={ (name) => this.setState({ adjustName: name }) } />
              { this.renderAdjustButton() }
            </div>
          </div>
        </div>
        <SplitPane split="vertical" minSize="100" defaultSize="150">
          <BrowserSideBar />
          <WebView id={ id } url={ url }
            onStatusUpdate={ (e, i) => this.updateTabStatus(e, i) }
            onNavigationActionsReady={ (actions) => Object.assign(this.navigationActions, actions) } />
        </SplitPane>
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
  webentity: PropTypes.object,

  showError: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired,
  declarePage: PropTypes.func.isRequired,
  setTabWebentity: PropTypes.func.isRequired,
  setWebentityHomepage: PropTypes.func.isRequired,
  setWebentityName: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, servers, tabs, webentities }, { id }) => {
  const tab = tabs.tabs.find((tab) => tab.id === id)
  return {
    id,
    active: id === tabs.activeTab,
    url: tab.url,
    serverUrl: servers.selected.url,
    corpusId: corpora.selected.corpus_id,
    webentity: webentities.webentities[webentities.tabs[id]]
  }
}

const mapDispatchToProps = {
  showError,
  setTabUrl, openTab ,setTabStatus, setTabTitle, setTabIcon,
  declarePage, setTabWebentity, setWebentityHomepage, setWebentityName
}

export default connect(mapStateToProps, mapDispatchToProps)(TabContent)
