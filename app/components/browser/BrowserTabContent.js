import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import WebView from './WebView'
import Button from '../Button'
import BrowserTabUrlField from './BrowserTabUrlField'
import SideBar from './sidebar/SideBar'
import SplitPane from 'react-split-pane'
import BrowserTabWebentityNameField from './BrowserTabWebentityNameField'
import PageHypheHome from './PageHypheHome'

import { intlShape } from 'react-intl'

import { PAGE_HYPHE_HOME } from '../../constants'

import { showError, hideError } from '../../actions/browser'
import {
  setTabUrl, setTabStatus, setTabTitle, setTabIcon,
  openTab, closeTab
} from '../../actions/tabs'
import {
  declarePage, setTabWebentity, setWebentityHomepage, setWebentityName, createWebentity,
  setAdjustWebentity, saveAdjustedWebentity, showAdjustWebentity, hideAdjustWebentity
} from '../../actions/webentities'

import networkErrors from '@naholyr/chromium-net-errors'
import { getSearchUrl } from '../../utils/search-web'

class TabContent extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      disableBack: true,
      disableForward: true
    }
    this.doNotRedirectToSearchOnNextDNSError = false // internal property, should never trigger update
    this.doNotDeclarePageOnStop = false // idem
    this.navigationActions = {} // Mutated by WebView
  }

  updateTabStatus (event, info) {
    const { id, setTabStatus, setTabTitle, setTabUrl, setTabIcon, openTab, closeTab,
      showError, declarePage, setTabWebentity, serverUrl, corpusId,
      disableWebentity } = this.props

    if (this.navigationActions.canGoBack && this.navigationActions.canGoForward) {
      this.setState({
        disableBack: !this.navigationActions.canGoBack(),
        disableForward: !this.navigationActions.canGoForward()
      })
    }

    switch (event) {
    case 'start':
      setTabStatus({ loading: true, url: info }, id)
      if (!disableWebentity) {
        setTabWebentity(id, null)
      }
      break
    case 'stop':
      setTabStatus({ loading: false, url: info }, id)
      if (!disableWebentity) {
        if (!this.doNotDeclarePageOnStop) {
          setTabUrl(info, id)
          declarePage(serverUrl, corpusId, info, id)
        } else {
          this.doNotDeclarePageOnStop = false
        }
      }
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
    case 'close': // from context menu
      closeTab(id)
      break
    case 'error': {
      const err = networkErrors.createByCode(info.errorCode)
      if (err.name === 'NameNotResolvedError' && !this.doNotRedirectToSearchOnNextDNSError) {
        // DNS error: let's search instead
        this.doNotDeclarePageOnStop = true
        this.doNotRedirectToSearchOnNextDNSError = true
        const term = info.pageURL.replace(/^.+:\/\/(.+?)\/?$/, '$1')
        setTabUrl(getSearchUrl(term), id)
        // Still show a dedicated error messag
        showError({ messageId: 'error.dns-error-search', fatal: false, icon: 'attention', timeout: 3000 })
      } else if (info.pageURL === info.validatedURL) {
        // Main page triggered the error, it's important
        this.doNotDeclarePageOnStop = true
        showError({ messageId: 'error.network-error', messageValues: { error: err.message }, fatal: false, icon: 'attention', timeout: 10000 })
        setTabStatus({ loading: false, url: info.pageURL, error: info }, id)
      }
      // Anyway, log to console
      if (process.env.NODE_ENV === 'development') {
        console.debug(info) // eslint-disable-line no-console
        console.error(err) // eslint-disable-line no-console
      }
      break
    }
    default:
      break
    }
  }

  saveAdjustChanges () {
    const { saveAdjustedWebentity, hideAdjustWebentity, serverUrl, corpusId,
      webentity, adjusting, hideError, showError, id, disableWebentity } = this.props

    if (disableWebentity) {
      return
    }

    saveAdjustedWebentity(serverUrl, corpusId, webentity, adjusting, id)
      .then(() => {
        hideError()
        hideAdjustWebentity(webentity.id)
      })
      .catch((err) => {
        showError({ messageId: 'error.save-webentity', messageValues: { error: err.message }, fatal: false })
      })
  }

  renderHomeButton () {
    const { adjusting, setAdjustWebentity, webentity, setTabUrl, url, id } = this.props
    const { formatMessage } = this.context.intl

    if (adjusting) {
      return <Button size="large" icon="home" title={ formatMessage({ id: 'set-homepage' }, { url: url }) }
        disabled={ !webentity }
        onClick={ () => setAdjustWebentity(webentity.id, { homepage: url }) } />
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
    const { adjusting, showAdjustWebentity, hideAdjustWebentity, webentity } = this.props
    const { formatMessage } = this.context.intl

    if (adjusting) {
      return [
        <Button key="cancel-adjust" size="large" icon="cancel" title={ formatMessage({ id: 'cancel' }) }
          onClick={ () => hideAdjustWebentity(webentity.id) } />,
        <Button key="apply-adjust" size="large" icon="check" title={ formatMessage({ id: adjusting.crawl ? 'save-and-crawl' : 'save' }) }
          onClick={ () => { this.saveAdjustChanges() } } />
      ]
    } else {
      return <Button size="large" icon="pencil" title={ formatMessage({ id: 'adjust' }) } disabled={ !this.props.webentity }
        onClick={ () => showAdjustWebentity(webentity.id) } />
    }
  }

  renderWebentityToolbar () {
    const { url, webentity, adjusting, setAdjustWebentity, disableWebentity } = this.props

    if (disableWebentity) {
      return <noscript />
    }

    return (
      <div className="btn-group tab-toolbar-webentity">
        { this.renderHomeButton () }
        <BrowserTabWebentityNameField
          initialValue={ webentity && webentity.name }
          disabled={ url === PAGE_HYPHE_HOME }
          editable={ !!adjusting }
          onChange={ (name) => setAdjustWebentity(webentity.id, { name }) } />
        { this.renderAdjustButton() }
      </div>
    )
  }

  renderNavigationToolbar () {
    const { adjusting, disableNavigation } = this.props
    const { formatMessage } = this.context.intl

    if (disableNavigation) {
      return <noscript />
    }

    return (
      <div className="btn-group tab-toolbar-navigation">
        <Button title={ formatMessage({ id: 'browse-back' }) } size="large" icon="left-open" disabled={ !!adjusting || this.state.disableBack }
          onClick={ () => this.navigationActions.back() } />
        <Button title={ formatMessage({ id: 'browse-forward' }) } size="large" icon="right-open" disabled={ !!adjusting || this.state.disableForward }
          onClick={ () => this.navigationActions.forward() } />
        <Button title={ formatMessage({ id: 'browse-reload' }) } size="large" icon="ccw" disabled={ !!adjusting }
          onClick={ () => this.navigationActions.reload() } />
      </div>
    )
  }

  renderUrlField () {
    const { id, url, loading, webentity, setTabUrl, adjusting, setAdjustWebentity, disableWebentity, disableNavigation } = this.props
    const ready = (url === PAGE_HYPHE_HOME) || (!loading && (disableWebentity || !!webentity))

    if (disableNavigation) {
      return <noscript />
    }

    return (
      <div className="btn-group tab-toolbar-url">
        <BrowserTabUrlField
          loading={ !ready }
          initialUrl={ url === PAGE_HYPHE_HOME ? '' : url }
          lruPrefixes={ webentity && webentity.lru_prefixes }
          onSubmit={ (url) => setTabUrl(url, id) }
          prefixSelector={ !!adjusting }
          onSelectPrefix={ (url, modified) => setAdjustWebentity(webentity.id, { prefix: modified ? url : null }) } />
      </div>
    )
  }

  renderToolbar () {
    const { disableWebentity, disableNavigation } = this.props

    if (disableNavigation && disableWebentity) {
      return <noscript />
    }

    return (
        <div className="toolbar toolbar-header">
          <div className="toolbar-actions">
            { this.renderNavigationToolbar() }
            { this.renderUrlField() }
            { this.renderWebentityToolbar() }
          </div>
        </div>
    )
  }

  renderSplitPane () {
    const { id, url, webentity, setTabUrl, serverUrl, corpusId, openTab } = this.props

    return (
      <SplitPane split="vertical" minSize="130" defaultSize="200">
        { webentity ? <SideBar webentity={ webentity } serverUrl={ serverUrl } corpusId={ corpusId } /> : <noscript /> }
        { url === PAGE_HYPHE_HOME
          ? <PageHypheHome onSubmit={ (url) => setTabUrl(url, id) } />
          : <WebView id={ id } url={ url }
              onStatusUpdate={ (e, i) => this.updateTabStatus(e, i) }
              onNavigationActionsReady={ (actions) => Object.assign(this.navigationActions, actions) }
              openTab={ openTab } />
        }
      </SplitPane>
    )
  }

  render () {
    const { active, id } = this.props

    return (
      <div key={ id } className="browser-tab-content" style={ active ? {} : { display: 'none' } }>
        { this.renderToolbar() }
        { this.renderSplitPane() }
      </div>
    )
  }
}

TabContent.propTypes = {
  id: PropTypes.string.isRequired, // Tab's id (≠ webentity.id)
  disableWebentity: PropTypes.bool,
  disableNavigation: PropTypes.bool,

  active: PropTypes.bool.isRequired,
  url: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object,
  adjusting: PropTypes.object,

  showError: PropTypes.func.isRequired,
  hideError: PropTypes.func.isRequired,

  setTabUrl: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,

  declarePage: PropTypes.func.isRequired,
  setTabWebentity: PropTypes.func.isRequired,
  setWebentityHomepage: PropTypes.func.isRequired,
  setWebentityName: PropTypes.func.isRequired,
  createWebentity: PropTypes.func.isRequired,
  saveAdjustedWebentity: PropTypes.func.isRequired,
  setAdjustWebentity: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired,
  hideAdjustWebentity: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, servers, tabs, webentities }, { id, url, loading, disableWebentity, disableNavigation }) => {
  const webentity = webentities.webentities[webentities.tabs[id]]
  return {
    id,
    active: tabs.activeTab && tabs.activeTab.id === id,
    url,
    loading,
    serverUrl: servers.selected.url,
    corpusId: corpora.selected.corpus_id,
    webentity: webentity,
    adjusting: webentity && webentities.adjustments[webentity.id],
    disableWebentity,
    disableNavigation
  }
}

const mapDispatchToProps = {
  showError, hideError,
  setTabUrl, setTabStatus, setTabTitle, setTabIcon, openTab , closeTab,
  declarePage, setTabWebentity, setWebentityHomepage, setWebentityName, createWebentity,
  setAdjustWebentity, showAdjustWebentity, hideAdjustWebentity, saveAdjustedWebentity
}

TabContent.contextTypes = {
  intl: intlShape
}

export default connect(mapStateToProps, mapDispatchToProps)(TabContent)
