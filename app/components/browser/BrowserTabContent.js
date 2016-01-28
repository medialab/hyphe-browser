import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import WebView from './WebView'
import Button from '../Button'
import BrowserTabUrlField from './BrowserTabUrlField'
import BrowserSideBar from './BrowserSideBar'
import SplitPane from 'react-split-pane'
import BrowserTabWebentityNameField from './BrowserTabWebentityNameField'

import { intlShape } from 'react-intl'

import { showError, hideError } from '../../actions/browser'
import { setTabUrl, setTabStatus, setTabTitle, setTabIcon, openTab } from '../../actions/tabs'
import { declarePage, setTabWebentity, setWebentityHomepage, setWebentityName, createWebentity } from '../../actions/webentities'

import networkErrors from '@naholyr/chromium-net-errors'

class TabContent extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      disableBack: true, disableForward: true,
      adjust: false,
      adjustHomepage: null, adjustName: null, adjustPrefix: null
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
        showError({ messageId: 'error.network-error', messageValues: { error: err.message }, fatal: false, icon: 'attention', timeout: 10000 })
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
    const {
      id, serverUrl, corpusId, webentity,
      setWebentityHomepage, setWebentityName, createWebentity,
      showError, hideError } = this.props

    var operations = []

    if (this.state.adjustPrefix) {
      // Create a new web entity
      // Set its name and homepage at the same time + refresh tab by passing tab id
      operations.push(createWebentity(serverUrl, corpusId, this.state.adjustPrefix, this.state.adjustName, this.state.adjustHomepage, id))
    } else {
      if (this.state.adjustHomepage && this.state.adjustHomepage !== webentity.homepage) {
        operations.push(setWebentityHomepage(serverUrl, corpusId, this.state.adjustHomepage, webentity.id))
      }
      if (this.state.adjustName && this.state.adjustName !== webentity.name) {
        operations.push(setWebentityName(serverUrl, corpusId, this.state.adjustName, webentity.id))
      }
    }

    Promise.all(operations).then(() => {
      hideError()
      this.setState({ adjust: false, adjustHomepage: null, adjustName: null, adjustPrefix: null })
    }).catch((err) => {
      showError({ messageId: 'error.save-webentity', messageValues: { error: err.message }, fatal: false })
    })
  }

  renderHomeButton () {
    const { webentity, setTabUrl, url, id } = this.props
    const { formatMessage } = this.context.intl

    if (this.state.adjust) {
      return <Button size="large" icon="home" title={ formatMessage({ id: 'set-homepage' }, { url: url }) }
        disabled={ !webentity }
        onClick={ () => this.setState({ adjustHomepage: url }) } />
    } else if (webentity && webentity.homepage) {
      return <Button size="large" icon="home" title={ formatMessage({ id: 'goto-homepage' }, { url: webentity.homepage }) }
        disabled={ !webentity || webentity.homepage === url }
        onClick={ () => setTabUrl(webentity.homepage, id) } />
    } else {
      return <Button size="large" icon="home" title={ formatMessage({ id: 'no-homepage' }) }
        disabled={ true }
        onClick={ () => {} } />
    }
  }

  renderAdjustButton () {
    const { formatMessage } = this.context.intl

    if (this.state.adjust) {
      return [
        <Button key="cancel-adjust" size="large" icon="cancel" title={ formatMessage({ id: 'cancel' }) }
          onClick={ () => this.setState({ adjust: false, adjustHomepage: null, adjustName: null, adjustPrefix: null }) } />,
        <Button key="apply-adjust" size="large" icon="check" title={ formatMessage({ id: 'save' }) }
          onClick={ () => { this.saveAdjustChanges() } } />
      ]
    } else {
      return <Button size="large" icon="pencil" title={ formatMessage({ id: 'adjust' }) } disabled={ !this.props.webentity }
        onClick={ () => this.setState({ adjust: true, adjustHomepage: null, adjustName: null, adjustPrefix: null }) } />
    }
  }

  render () {
    const { active, id, url, webentity, setTabUrl, serverUrl, corpusId } = this.props
    const { formatMessage } = this.context.intl

    return (
      <div key={ id } className="browser-tab-content" style={ active ? {} : { display: 'none' } }>
        <div className="toolbar toolbar-header">
          <div className="toolbar-actions">
            <div className="btn-group tab-toolbar-navigation">
              <Button title={ formatMessage({ id: 'browse-back' }) } size="large" icon="left-open" disabled={ this.state.adjust || this.state.disableBack }
                onClick={ () => this.navigationActions.back() } />
              <Button title={ formatMessage({ id: 'browse-forward' }) } size="large" icon="right-open" disabled={ this.state.adjust || this.state.disableForward }
                onClick={ () => this.navigationActions.forward() } />
              <Button title={ formatMessage({ id: 'browse-reload' }) } size="large" icon="ccw" disabled={ this.state.adjust }
                onClick={ () => this.navigationActions.reload() } />
            </div>
            <div className="btn-group tab-toolbar-url">
              <BrowserTabUrlField initialUrl={ url } lruPrefixes={ webentity && webentity.lru_prefixes }
                onSubmit={ (url) => setTabUrl(url, id) }
                prefixSelector={ this.state.adjust } onSelectPrefix={ (url, modified) => this.setState({ adjustPrefix: modified ? url : null }) } />
            </div>
            <div className="btn-group tab-toolbar-webentity">
              { this.renderHomeButton () }
              <BrowserTabWebentityNameField initialValue={ webentity && webentity.name } editable={ this.state.adjust } onChange={ (name) => this.setState({ adjustName: name }) } />
              { this.renderAdjustButton() }
            </div>
          </div>
        </div>
        <SplitPane split="vertical" minSize="100" defaultSize="150">
          { webentity ? <BrowserSideBar webentity={ webentity } serverUrl={ serverUrl } corpusId={ corpusId } /> : <noscript /> }
          <WebView id={ id } url={ url }
            onStatusUpdate={ (e, i) => this.updateTabStatus(e, i) }
            onNavigationActionsReady={ (actions) => Object.assign(this.navigationActions, actions) } />
        </SplitPane>
      </div>
    )
  }
}

TabContent.propTypes = {
  id: PropTypes.string.isRequired, // Tab's id (≠ webentity.id)

  active: PropTypes.bool.isRequired,
  url: PropTypes.string.isRequired,
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object,

  showError: PropTypes.func.isRequired,
  hideError: PropTypes.func.isRequired,
  setTabUrl: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired,
  declarePage: PropTypes.func.isRequired,
  setTabWebentity: PropTypes.func.isRequired,
  setWebentityHomepage: PropTypes.func.isRequired,
  setWebentityName: PropTypes.func.isRequired,
  createWebentity: PropTypes.func.isRequired
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
  showError, hideError,
  setTabUrl, openTab ,setTabStatus, setTabTitle, setTabIcon,
  declarePage, setTabWebentity, setWebentityHomepage, setWebentityName, createWebentity
}

TabContent.contextTypes = {
  intl: intlShape
}

export default connect(mapStateToProps, mapDispatchToProps)(TabContent)
