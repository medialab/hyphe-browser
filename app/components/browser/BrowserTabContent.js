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
import { FormattedMessage as T } from 'react-intl'

import { eventBusShape } from '../../types'
import { PAGE_HYPHE_HOME } from '../../constants'

import { showError, hideError, toggleDoNotShowAgain } from '../../actions/browser'
import {
  setTabUrl, setTabStatus, setTabTitle, setTabIcon,
  openTab, closeTab
} from '../../actions/tabs'
import {
  declarePage, setTabWebentity, setWebentityName, createWebentity,
  setAdjustWebentity, saveAdjustedWebentity, showAdjustWebentity, hideAdjustWebentity
} from '../../actions/webentities'

import { getSearchUrl } from '../../utils/search-web'
import { urlToName, hasExactMatching, compareUrls } from '../../utils/lru'

class TabContent extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      previousUrl: '',
      disableBack: true,
      disableForward: true,
      disableApplyButton: false,
      setDoNotShowAgainAfterSubmit: null
    }

    this.doNotRedirectToSearchOnNextDNSError = false // internal property, should never trigger update
    this.doNotDeclarePageOnStop = false // idem

    this._onKeyUp = this.onKeyUp.bind(this)
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

  componentWillReceiveProps (props) {
    // Handle the case when user clicked "IN" button and does *not* want to show a popup
    if (props.adjusting && props.adjusting.crawl && props.noCrawlPopup && (!this.props.adjusting || !this.props.adjusting.crawl)) {
      this.saveAdjustChanges(props)
    }
  }

  componentWillUnmount () {
    const { eventBus } = this.props
    eventBus.off('canGoBack', this.navCanGoBackHandler)
    eventBus.off('canGoForward', this.navCanGoForwardHandler)
    eventBus.off('status', this.navStatusHandler)
  }

  samePage (info) {
    return compareUrls(this.state.previousUrl, info)
  }

  updateTabStatus (event, info) {
    const { id, setTabStatus, setTabTitle, setTabUrl, setTabIcon,
      showError, hideError, declarePage, setTabWebentity, serverUrl,
      corpusId, disableWebentity } = this.props

    // In Hyphe special tab, when link with target=_blank
    if (event === 'open' && disableWebentity) {
      // if link points to a Hyphe page, load within special tab
      if (this.samePage(info)) {
        event = 'start'
      }
      // otherwise open new tab
      else {
        this.props.eventBus.emit('open', info)
      }
    }

    switch (event) {
    case 'start':
      hideError()
      setTabStatus({ loading: true, url: info }, id)
      // avoid refreshing webentity when only changing url's anchor
      if (!this.samePage(info) && !disableWebentity) {
        setTabWebentity(id, null)
      }
      break
    case 'stop':
      setTabStatus({ loading: false, url: info }, id)
      this.doNotRedirectToSearchOnNextDNSError = false
      if (!disableWebentity) {
        if (!this.doNotDeclarePageOnStop) {
          setTabUrl(info, id)
          // do not declare pages with only change in anchor
          if (!this.samePage(info)) {
            declarePage(serverUrl, corpusId, info, id)
          }
        } else {
          this.doNotDeclarePageOnStop = false
        }
      }
      this.state.previousUrl = info
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

  saveAdjustChanges (props) {
    const { saveAdjustedWebentity, hideAdjustWebentity, serverUrl, corpusId,
      webentity, adjusting, hideError, showError, id, disableWebentity } = props

    // no change by default
    this.setState({ setDoNotShowAgainAfterSubmit: null })

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
    const { adjusting, showAdjustWebentity, hideAdjustWebentity, webentity, saving } = this.props
    const { formatMessage } = this.context.intl

    if (adjusting && !adjusting.crawl) {
      return [
        // Note this button is hidden and replaced with a click on overlay
        // we keep it for back compat with nth-child rules and simplier rollback
        <Button key="cancel-adjust" icon="close"
          disabled={ saving }
          title={ formatMessage({ id: 'cancel' }) }
          onClick={ () => hideAdjustWebentity(webentity.id) } />,
        <Button key="apply-adjust" icon="check"
          disabled={ saving || this.state.disableApplyButton }
          title={ formatMessage({ id: adjusting.crawl ? 'save-and-crawl' : 'save' }) }
          onClick={ () => { this.saveAdjustChanges(this.props) } } />
      ]
    } else {
      return <Button
        disabled={ saving }
        className='btn-adjust'
        icon="plus" title={ formatMessage({ id: 'adjust' }) } disabled={ !this.props.webentity }
        onClick={ () => showAdjustWebentity(webentity.id) } />
    }
  }

  renderWebentityToolbar () {
    const { setWebentityName, serverUrl, corpusId, url, webentity, adjusting, disableWebentity } = this.props

    if (disableWebentity) {
      return null
    }

    // Note: webentity name field is disabled while adjusting, and enabled while NOT adjusting
    // which means we won't use 'setAdjustWebentity' to keep track of name change, but instead
    // directly update name on user's validation
    return (
      <div className={ cx('browser-tab-toolbar-webentity', { 'over-overlay': adjusting && !adjusting.crawl, adjusting }) }>
        <BrowserTabWebentityNameField
          initialValue={ this.state.webentityName || webentity && webentity.name }
          disabled={ url === PAGE_HYPHE_HOME }
          editable={ !adjusting }
          onChange={ name => this.updateName(name) } />
        { this.renderAdjustButton() }
      </div>
    )
  }

  updateName (name) {
    const { setWebentityName, serverUrl, corpusId, webentity } = this.props

    this.setState({ webentityName: name })
    setWebentityName(serverUrl, corpusId, name, webentity.id)
  }

  renderNavigationToolbar () {
    const { formatMessage } = this.context.intl
    const { adjusting, disableNavigation, eventBus } = this.props

    if (disableNavigation) {
      return null
    }

    return (
      <div className="browser-tab-toolbar-navigation">
        <Button title={ formatMessage({ id: 'browse-reload' }) } icon="reload" disabled={ !!adjusting }
          onClick={ (e) => eventBus.emit('reload', e.ctrlKey || e.shiftKey) } />
        <Button title={ formatMessage({ id: 'browse-back' }) } icon="angle-left" disabled={ !!adjusting || this.state.disableBack }
          onClick={ () => eventBus.emit('goBack') } />
        <Button title={ formatMessage({ id: 'browse-forward' }) } icon="angle-right" disabled={ !!adjusting || this.state.disableForward }
          onClick={ () => eventBus.emit('goForward') } />
      </div>
    )
  }

  renderUrlField () {
    const { id, url, loading, webentity, setTabUrl, adjusting, disableWebentity, disableNavigation, tlds } = this.props
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
          crawlquery={ !!adjusting && !!adjusting.crawl }
          prefixSelector={ !!adjusting && !adjusting.crawl }
          className={ cx({ 'over-overlay': adjusting, adjusting}) }
          tlds={ tlds }
          onSelectPrefix={ (url, modified) => this.onSelectPrefix(url, modified) } />
      </div>
    )
  }

  onSelectPrefix (url, modified) {
    const { webentity, setAdjustWebentity, adjusting } = this.props

    this.setState({
      disableApplyButton: !adjusting.crawl && hasExactMatching(webentity.lru_prefixes, url, this.props.tlds),
      webentityName: urlToName(url)
    })

    setAdjustWebentity(webentity.id, { prefix: modified ? url : null })
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

  renderOverlay () {
    const { webentity, hideAdjustWebentity } = this.props

    return <div className="global-overlay" onClick={ () => hideAdjustWebentity(webentity.id) } />
  }

  renderCrawlPopup () {
    const { webentity, hideAdjustWebentity, saving, noCrawlPopup, toggleDoNotShowAgain } = this.props

    const markToggleOnSubmit = e => {
      this.setState({ setDoNotShowAgainAfterSubmit: e.target.checked })
    }

    const doToggle = () => {
      if (this.state.setDoNotShowAgainAfterSubmit !== null) {
        toggleDoNotShowAgain('crawlPopup', this.state.setDoNotShowAgainAfterSubmit)
      }
    }

    const apply = e => {
      e.preventDefault()
      doToggle()
      this.saveAdjustChanges(this.props)
    }

    const cancel = e => {
      e.preventDefault()
      hideAdjustWebentity(webentity.id)
    }

    return (
      <div className="crawl-popup">
        <strong><T id="webentity-crawl-popup-title" /></strong>
        <p><T id="webentity-crawl-popup-message" /></p>
        <p><T id="webentity-crawl-popup-message-2" /></p>
        <p><T id="webentity-crawl-popup-message-3" /></p>
        <div className="crawl-popup-footer">
          <input type="checkbox" defaultChecked={ noCrawlPopup } onChange={ markToggleOnSubmit } />
          <label>
            <T id="do-not-show-again" />
          </label>
          <button disabled={ saving } className="apply-crawl" onClick={ apply }><T id="launch" /></button>
          <button disabled={ saving } className="cancel-crawl" onClick={ cancel }><T id="cancel" /></button>
        </div>
      </div>
    )
  }

  onKeyUp (e) {
    const { webentity, adjusting, hideAdjustWebentity } = this.props
    if (adjusting && e.keyCode === 27) { // ESCAPE
      e.stopPropagation()
      hideAdjustWebentity(webentity.id)
    }
  }

  render () {
    const { active, id, disableWebentity, adjusting, noCrawlPopup } = this.props

    return (
      <div key={ id } className="browser-tab-content" style={ active ? {} : { position: 'absolute', left: '-10000px' } } onKeyUp={ this._onKeyUp } >
        { this.renderToolbar() }
        { disableWebentity ? this.renderSinglePane() : this.renderSplitPane() }
        { !noCrawlPopup && adjusting && adjusting.crawl && this.renderCrawlPopup() }
        { adjusting && (!noCrawlPopup || !adjusting.crawl) && this.renderOverlay() }
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
  saving: PropTypes.bool.isRequired,
  noCrawlPopup: PropTypes.bool.isRequired,
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
  setWebentityName: PropTypes.func.isRequired,
  createWebentity: PropTypes.func.isRequired,
  saveAdjustedWebentity: PropTypes.func.isRequired,
  setAdjustWebentity: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired,
  hideAdjustWebentity: PropTypes.func.isRequired,
  toggleDoNotShowAgain: PropTypes.func.isRequired,
}

const mapStateToProps = (
  { corpora, intl: { locale }, servers, tabs, webentities, ui: { loaders, doNotShow } }, // store
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
  tlds: webentities.tlds,
  saving: loaders.webentity_adjust,
  noCrawlPopup: doNotShow.crawlPopup
})

const mapDispatchToProps = {
  showError, hideError, toggleDoNotShowAgain,
  setTabUrl, setTabStatus, setTabTitle, setTabIcon, openTab , closeTab,
  declarePage, setTabWebentity, setWebentityName, createWebentity,
  setAdjustWebentity, showAdjustWebentity, hideAdjustWebentity, saveAdjustedWebentity,
}

export default connect(mapStateToProps, mapDispatchToProps)(TabContent)
