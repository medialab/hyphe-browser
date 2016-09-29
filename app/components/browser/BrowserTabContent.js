import '../../css/browser/browser-tab-content'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'
import cx from 'classnames'
import networkErrors from '@naholyr/chromium-net-errors'

import WebView from './WebView'
import Button from '../Button'
import BrowserTabUrlField from './BrowserTabUrlField'
import SideBar from './sidebar/SideBar'
import BrowserTabWebentityNameField from './BrowserTabWebentityNameField'
import PageHypheHome from './PageHypheHome'
import HypheFooter from './../HypheFooter'

import { eventBusShape } from '../../types'
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
  }

  componentDidMount () {
    const { eventBus, openTab, closeTab, id } = this.props
    // Listen for webview navigability changes
    this.navCanGoBackHandler = (able) => this.setState({ disableBack: !able })
    eventBus.on('canGoBack', this.navCanGoBackHandler)
    this.navCanGoForwardHandler = (able) => this.setState({ disableForward: !able })
    eventBus.on('canGoForward', this.navCanGoForwardHandler)
    this.navStatusHandler = (what, info) => this.updateTabStatus(what, info)
    eventBus.on('status', this.navStatusHandler)
    this.navCloseHandler = () => closeTab(id)
    eventBus.on('close', this.navCloseHandler)
    this.navOpenHandler = (url) => openTab(url)
    eventBus.on('open', this.navOpenHandler)
  }

  componentWillUnmount () {
    const { eventBus } = this.props
    eventBus.off('canGoBack', this.navCanGoBackHandler)
    eventBus.off('canGoForward', this.navCanGoForwardHandler)
    eventBus.off('status', this.navStatusHandler)
  }

  updateTabStatus (event, info) {
    const { id, setTabStatus, setTabTitle, setTabUrl, setTabIcon,
      showError, hideError, declarePage, setTabWebentity, serverUrl,
      corpusId, disableWebentity } = this.props

    switch (event) {
    case 'start':
      hideError()
      setTabStatus({ loading: true, url: info }, id)
      if (!disableWebentity) {
        setTabWebentity(id, null)
      }
      break
    case 'stop':
      setTabStatus({ loading: false, url: info }, id)
      this.doNotRedirectToSearchOnNextDNSError = false
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
    case 'error': {
      const err = networkErrors.createByCode(info.errorCode)
      if (err.name === 'NameNotResolvedError' && !this.doNotRedirectToSearchOnNextDNSError) {
        // DNS error: let's search instead
        this.doNotDeclarePageOnStop = false
        this.doNotRedirectToSearchOnNextDNSError = true
        const term = info.pageURL.replace(/^.+:\/\/(.+?)\/?$/, '$1')
        setTabUrl(getSearchUrl(term), id)
        // Still show a dedicated error messag
        showError({ messageId: 'error.dns-error-search' })
      } else if (info.pageURL === info.validatedURL) {
        // Main page triggered the error, it's important
        this.doNotDeclarePageOnStop = true
        showError({ messageId: 'error.network-error', messageValues: { error: err.message } })
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

  renderAdjustButton () {
    const { adjusting, showAdjustWebentity, hideAdjustWebentity, webentity } = this.props
    const { formatMessage } = this.context.intl

    if (adjusting) {
      return [
        <Button key="cancel-adjust" icon="close" title={ formatMessage({ id: 'cancel' }) }
          onClick={ () => hideAdjustWebentity(webentity.id) } />,
        <Button key="apply-adjust" icon="check" title={ formatMessage({ id: adjusting.crawl ? 'save-and-crawl' : 'save' }) }
          onClick={ () => { this.saveAdjustChanges() } } />
      ]
    } else {
      return <Button icon="pencil" title={ formatMessage({ id: 'adjust' }) } disabled={ !this.props.webentity }
        onClick={ () => showAdjustWebentity(webentity.id) } />
    }
  }

  renderWebentityToolbar () {
    const { url, webentity, adjusting, setAdjustWebentity, disableWebentity } = this.props

    if (disableWebentity) {
      return null
    }

    return (
      <div className={ cx('browser-tab-toolbar-webentity over-overlay', { adjusting }) }>
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
    const { formatMessage } = this.context.intl
    const { adjusting, disableNavigation } = this.props

    if (disableNavigation) {
      return null
    }

    return (
      <div className="browser-tab-toolbar-navigation">
        <Button title={ formatMessage({ id: 'browse-reload' }) } icon="reload" disabled={ !!adjusting }
          onClick={ (e) => this.props.eventBus.emit('reload', e.ctrlKey || e.shiftKey) } />
        <Button title={ formatMessage({ id: 'browse-back' }) } icon="angle-left" disabled={ !!adjusting || this.state.disableBack }
          onClick={ () => this.props.eventBus.emit('goBack') } />
        <Button title={ formatMessage({ id: 'browse-forward' }) } icon="angle-right" disabled={ !!adjusting || this.state.disableForward }
          onClick={ () => this.props.eventBus.emit('goForward') } />
      </div>
    )
  }

  renderUrlField () {
    const { id, url, loading, webentity, setTabUrl, adjusting, setAdjustWebentity, disableWebentity, disableNavigation, tlds } = this.props
    const ready = (url === PAGE_HYPHE_HOME) || (!loading && (disableWebentity || !!webentity))

    if (disableNavigation) {
      return null
    }

    return (
      <div className="browser-tab-toolbar-url">
        <BrowserTabUrlField
          loading={ !ready }
          initialUrl={ url === PAGE_HYPHE_HOME ? '' : url }
          lruPrefixes={ webentity && webentity.lru_prefixes }
          onSubmit={ (url) => setTabUrl(url, id) }
          prefixSelector={ !!adjusting }
          tlds={ tlds }
          onSelectPrefix={ (url, modified) => setAdjustWebentity(webentity.id, { prefix: modified ? url : null }) } />
      </div>
    )
  }

  renderToolbar () {
    const { disableWebentity, disableNavigation } = this.props

    if (disableNavigation && disableWebentity) {
      return null
    }

    return (
        <div className="browser-tab-toolbar">
          { this.renderWebentityToolbar() }
          { this.renderUrlField() }
          { this.renderNavigationToolbar() }
        </div>
    )
  }

  renderContent () {
    const { id, url, setTabUrl, eventBus, closable } = this.props

    return (url === PAGE_HYPHE_HOME)
      ? <PageHypheHome onSubmit={ (url) => setTabUrl(url, id) } />
      : <WebView id={ id } url={ url } closable={ closable } eventBus={ eventBus } />
  }

  // google form for example
  renderSinglePane () {
    return (
      <div className="browser-tab-content-full">
        { this.renderContent() }
        <HypheFooter status={ this.props.status } />
      </div>
    )
  }

  renderSplitPane () {
    const { webentity, serverUrl, corpusId, adjusting, status, id, url } = this.props

    return (
      <div className="browser-tab-content-cols">
        <SideBar status={ status } webentity={ webentity } tabId={ id } url={ url }
          serverUrl={ serverUrl } corpusId={ corpusId } disabled={ !!adjusting } />
        { this.renderContent() }
      </div>
    )
  }

  render () {
    const { active, id, disableWebentity } = this.props

    return (
      <div key={ id } className="browser-tab-content" style={ active ? {} : { display: 'none' } }>
        { this.renderToolbar() }
        { disableWebentity ? this.renderSinglePane() : this.renderSplitPane() }
      </div>
    )
  }
}

TabContent.contextTypes = {
  intl: intlShape
}

TabContent.propTypes = {
  id: PropTypes.string.isRequired, // Tab's id (≠ webentity.id)
  url: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  locale: PropTypes.string.isRequired,
  closable: PropTypes.bool,
  disableWebentity: PropTypes.bool,
  disableNavigation: PropTypes.bool,
  eventBus: eventBusShape.isRequired,

  active: PropTypes.bool.isRequired,
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object,
  adjusting: PropTypes.object,
  status: PropTypes.object,
  tlds: PropTypes.object,

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

const mapStateToProps = (
  { corpora, intl: { locale }, servers, tabs, webentities }, // store
  { id, url, loading, disableWebentity, disableNavigation, eventBus, webentity } // own props
) => ({
  id,
  url,
  loading,
  locale,
  disableWebentity,
  disableNavigation,
  eventBus,
  active: tabs.activeTab && tabs.activeTab.id === id,
  serverUrl: servers.selected.url,
  corpusId: corpora.selected.corpus_id,
  webentity,
  adjusting: webentity && webentities.adjustments[webentity.id],
  status: corpora.status,
  tlds: webentities.tlds
})

const mapDispatchToProps = {
  showError, hideError,
  setTabUrl, setTabStatus, setTabTitle, setTabIcon, openTab , closeTab,
  declarePage, setTabWebentity, setWebentityHomepage, setWebentityName, createWebentity,
  setAdjustWebentity, showAdjustWebentity, hideAdjustWebentity, saveAdjustedWebentity
}

export default connect(mapStateToProps, mapDispatchToProps)(TabContent)
