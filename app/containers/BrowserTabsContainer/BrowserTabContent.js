import './BrowserTabContent.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom'
import { intlShape } from 'react-intl'

import networkErrors from 'chromium-net-errors'

import { PAGE_HYPHE_HOME } from '../../constants'

import BrowserBar from '../../components/BrowserBar'
import NewTabContent from '../../components/NewTabContent'

import WebView from './WebView'
import { FormattedMessage as T } from 'react-intl'

import { eventBusShape } from '../../types'

import { showError, showNotification, hideError, toggleDoNotShowAgain } from '../../actions/browser'
import { stoppedLoadingWebentity } from '../../actions/stacks'
import {
  setTabUrl, setTabStatus, setTabTitle, setTabIcon,
  openTab, closeTab,
  addNavigationHistory,
} from '../../actions/tabs'
import {
  declarePage, setTabWebentity, setWebentityName, setWebentityHomepage,
  setAdjustWebentity, saveAdjustedWebentity, showAdjustWebentity,
  hideAdjustWebentity, setMergeWebentity, unsetMergeWebentity, mergeWebentities
} from '../../actions/webentities'

import { fetchStackAndSetTab } from '../../actions/stacks'

import { getSearchUrl } from '../../utils/search-web'
import { compareUrls, longestMatching } from '../../utils/lru'

class BrowserTabContent extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      previousUrl: '',
      disableBack: true,
      disableForward: true,
      disableApplyButton: false,
      setDoNotShowAgainAfterSubmit: null
    }
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
    this.navOpenHandler = (url) => openTab(url, id)
    eventBus.on('open', this.navOpenHandler)
  }

  componentWillReceiveProps (props) {
    // Handle the case when user clicked "IN" button and does *not* want to show a popup
    if (props.adjusting && props.adjusting.crawl && props.noCrawlPopup &&
      (!this.props.adjusting || !this.props.adjusting.crawl)) {
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
      showError, showNotification, hideError, declarePage, setTabWebentity,
      eventBus, server, corpusId, disableWebentity, stoppedLoadingWebentity,
      webentity, selectedWebentity, loadingWebentityStack, setMergeWebentity,
      tlds, selectedEngine, addNavigationHistory } = this.props
    // In Hyphe special tab, if target=_blank link points to a Hyphe page, load within special tab
    if (event === 'open' && disableWebentity && this.samePage(info)) {
      event = 'start'
    }
    switch (event) {
    case 'open':
      eventBus.emit('open', info)
      break
    case 'start':
      hideError()
      setTabStatus({ loading: true, url: info }, id)
      if (!disableWebentity &&
        // do not declare pages(show sidebar) when only changing url's anchor
        !this.samePage(info) &&
        // or when probably remaining within the same webentity
        !(webentity && longestMatching(webentity.prefixes, info, tlds))) {
        setTabWebentity(server.url, corpusId, id, null)
        setTabUrl(info, id)
      }
      break
    case 'stop':
      // Redirect Hyphe special tab to network when userclosed or misstarted
      if (disableWebentity && info === server.home + '/#/login') {
        info = server.home + '/#/project/' + corpusId + '/network'
      }
      setTabStatus({ loading: false, url: info }, id)
      addNavigationHistory(info, corpusId)
      stoppedLoadingWebentity()
      this.setState({ previousUrl: info })
      break
    case 'redirect':
      if (loadingWebentityStack && selectedWebentity &&
        !longestMatching(selectedWebentity.prefixes, info.newURL, tlds)) {
        setMergeWebentity(id, selectedWebentity)
      }
      break
    case 'title':
      setTabTitle(info, id)
      break
    case 'favicon':
      setTabIcon(info, id)
      break
    case 'navigate':
      if (!disableWebentity && !this.samePage(info) && !(webentity && longestMatching(webentity.prefixes, info, tlds))) {	
        declarePage(server.url, corpusId, info, id)
        setTabWebentity(server.url, corpusId, id, webentity)
      }
      break
    case 'error': {
      const err = networkErrors.createByCode(info.errorCode)
      
      // In all cases, log to console
      if (process.env.NODE_ENV === 'development') {
        console.debug(info) // eslint-disable-line no-console
        console.error(err) // eslint-disable-line no-console
      }
      setTabStatus({ loading: false, error: info }, id)
      stoppedLoadingWebentity()
      // Main page triggered the error, it's important
      if (info.pageURL === info.validatedURL) {
        // DNS error: let's search instead
        if (err.name === 'NameNotResolvedError') {
          showNotification({ messageId: 'error.dns-error-search', timeout: 3500 })
          const term = info.pageURL.replace(/^.+:\/\/(.+?)\/?$/, '$1')
          setTabUrl(getSearchUrl(selectedEngine, term), id)
        } else {
          showError({ messageId: 'error.network-error', messageValues: { error: err.message } })
          setTabUrl(info.pageURL, id)
        }
      }
      break
    }
    default:
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Unhandled event:', event, info)
      }
      break
    }
  }

  saveAdjustChanges = (props) => {
    const { saveAdjustedWebentity, hideAdjustWebentity, server, corpusId,
      webentity, adjusting, hideError, showError, id, disableWebentity } = props

    // no change by default
    this.setState({ setDoNotShowAgainAfterSubmit: null })

    if (disableWebentity) {
      return
    }

    saveAdjustedWebentity(server.url, corpusId, webentity, adjusting, id)
      .then(() => {
        hideError()
        hideAdjustWebentity(webentity.id)
      })
      .catch((err) => {
        showError( !~err.message.indexOf('is already set to an existing WebEntity')
          ? { messageId: 'error.save-webentity', messageValues: { error: err.message }, fatal: false }
          : { messageId: 'error.existing-prefix', fatal: false }
        )
      })
  }

  updateName = (name) => {
    const { setWebentityName, server, corpusId, webentity } = this.props

    this.setState({ webentityName: name })
    setWebentityName(server.url, corpusId, name, webentity.id)
  }

  renderContent () {
    const { 
      id, url, eventBus, closable, isEmpty, server, corpusId,
      selectedEngine, fetchStackAndSetTab,
      onChangeEngine, setTabUrl } = this.props
    const handleSetTabUrl = (value) => setTabUrl(value, id)
    
    const handleFetchStackAndSetTab = (stack, filter) => {
      fetchStackAndSetTab({
        serverUrl: server.url, 
        corpusId, 
        stack, 
        filter,
        tabId: id
      })
    }
    return (url === PAGE_HYPHE_HOME) ? 
      <NewTabContent 
        isEmpty={ isEmpty }
        selectedEngine = { selectedEngine }
        onSelectStack = { handleFetchStackAndSetTab }
        onChangeEngine = { onChangeEngine }
        onSetTabUrl={ handleSetTabUrl } 
      />:
      <WebView
        id={ id } url={ url } closable={ closable } eventBus={ eventBus }
      />
  }

  renderOverlay () {
    const { id, webentity, hideAdjustWebentity, unsetMergeWebentity, mergeRequired } = this.props
    const handleClick = () => {
      return mergeRequired ? unsetMergeWebentity(id) : hideAdjustWebentity(webentity.id)
    }

    return <div className="global-overlay" onClick={ handleClick } />
  }

  renderMergePopup () {
    const { id, server, corpusId, webentity, mergeRequired, merging,
      unsetMergeWebentity, mergeWebentities } = this.props

    const merge = e => {
      e.preventDefault()
      mergeWebentities(server.url, corpusId, id, mergeRequired.mergeable.id, webentity, mergeRequired.type)
    }

    const cancel = e => {
      e.preventDefault()
      unsetMergeWebentity(id)
    }

    return (
      <div className="we-popup">
        <strong><T id="webentity-merge-popup-title" /></strong>
        {
          mergeRequired.mergeable.type === 'redirect'?
            <p><T id="webentity-merge-popup-message-redirect" values={ { new: webentity.name, old: mergeRequired.mergeable.name } } /></p>
            :
            <p><T id="webentity-merge-popup-message-manual" values={ { new: webentity.name, old: mergeRequired.mergeable.name } } /></p>
        }
        <p><T id="webentity-merge-popup-message-2" /></p>
        <p><T id="webentity-merge-popup-message-3" /></p>
        <div className="we-popup-footer">
          <button disabled={ merging || !webentity } className="apply-we-popup" onClick={ merge }><T id="merge" /></button>
          <button disabled={ merging } className="cancel-we-popup" onClick={ cancel }><T id="ignore" /></button>
        </div>
      </div>
    )
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

    const handleClick = () => findDOMNode(this.inputComponent).click()

    return (
      <div className="we-popup">
        <strong><T id="webentity-crawl-popup-title" /></strong>
        <p><T id="webentity-crawl-popup-message" /></p>
        <p><T id="webentity-crawl-popup-message-2" /></p>
        <p><T id="webentity-crawl-popup-message-3" /></p>
        <div className="we-popup-footer">
          <input ref={ component => this.inputComponent = component } type="checkbox" defaultChecked={ noCrawlPopup } onChange={ markToggleOnSubmit } />
          <label onClick={ handleClick }>
            <T id="do-not-show-again" />
          </label>
          <button disabled={ saving } className="apply-we-popup" onClick={ apply }><T id="launch" /></button>
          <button disabled={ saving } className="cancel-we-popup" onClick={ cancel }><T id="cancel" /></button>
        </div>
      </div>
    )
  }

  handleKeyUp = (e) => {
    const { active, id, webentity, adjusting, mergeRequired, hideAdjustWebentity, unsetMergeWebentity } = this.props
    if (e.keyCode === 27 && active) { // ESCAPE
      e.stopPropagation()
      if (adjusting) {
        hideAdjustWebentity(webentity.id)
      } else if (mergeRequired && webentity) {
        unsetMergeWebentity(id)
      }
    }
  }

  render () {
    const { 
      active, id, url, title, server,corpusId, webentity, tlds, loading, adjusting, disableNavigation,
      noCrawlPopup, mergeRequired, eventBus, setTabUrl, setWebentityHomepage,
      selectedEngine } = this.props
    
    let isHomepage = false
    if (webentity && webentity.homepage) {
      isHomepage = compareUrls(webentity.homepage, url)
    }

    const handleReload = (e) => {
      if (!adjusting) {
        eventBus.emit('reload', e.ctrlKey || e.shiftKey)
      }
    }

    const handleGoBack = () => {
      eventBus.emit('goBack')
    }
    const handleGoForward = () => {
      eventBus.emit('goForward')
    }
    const handleSetTabUrl = (value) => setTabUrl(value, id)
    const handleSetWebentityHomepage = () => setWebentityHomepage(server.url, corpusId, url, webentity.id)

    return (
      <div
        key={ id } tabIndex="1" className="browser-tab-content" 
        style={ active ? {} : { display:'none' } }
        onKeyUp={ this.handleKeyUp }
      > 
        <BrowserBar
          isLanding={ url === PAGE_HYPHE_HOME }
          isHomepage={ isHomepage }
          loading={ loading }
          initialUrl={ url === PAGE_HYPHE_HOME ? '' : url }
          tabTitle= { title }
          selectedEngine = { selectedEngine }
          lruPrefixes={ webentity && webentity.prefixes }
          tlds={ tlds }
          onReload={ handleReload }
          onGoBack={ handleGoBack }
          onGoForward={ handleGoForward }
          onSetTabUrl={ handleSetTabUrl }
          onSetHomepage = { handleSetWebentityHomepage }
          disableReload={ !!adjusting || disableNavigation }
          disableBack={ !!adjusting || this.state.disableBack || disableNavigation }
          disableForward={ !!adjusting || this.state.disableForward || disableNavigation }
          displayAddButton={ webentity && webentity.status === 'IN' }
        />
        {this.renderContent()}
        { !noCrawlPopup && adjusting && adjusting.crawl && this.renderCrawlPopup() }
        { webentity && mergeRequired && mergeRequired.host && this.renderMergePopup() }
        { ((adjusting && (!noCrawlPopup || !adjusting.crawl)) || (webentity && mergeRequired)) && this.renderOverlay() }
      </div>
    )
  }
}

BrowserTabContent.contextTypes = {
  intl: intlShape
}

BrowserTabContent.propTypes = {
  id: PropTypes.string.isRequired, // Tab's id (≠ webentity.id)
  url: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  locale: PropTypes.string.isRequired,
  closable: PropTypes.bool,
  isEmpty: PropTypes.bool,
  disableWebentity: PropTypes.bool,
  disableNavigation: PropTypes.bool,
  eventBus: eventBusShape.isRequired,

  active: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  merging: PropTypes.bool.isRequired,
  noCrawlPopup: PropTypes.bool.isRequired,
  server: PropTypes.object.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object,
  selectedWebentity: PropTypes.object,
  loadingWebentityStack: PropTypes.bool,
  mergeRequired: PropTypes.object,
  adjusting: PropTypes.object,
  status: PropTypes.object,
  tlds: PropTypes.object,
  selectedEngine: PropTypes.string,

  showError: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
  hideError: PropTypes.func.isRequired,

  setTabUrl: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  addNavigationHistory: PropTypes.func.isRequired,
  fetchStack: PropTypes.func,

  onChangeEngine: PropTypes.func,

  declarePage: PropTypes.func.isRequired,
  setTabWebentity: PropTypes.func.isRequired,
  setWebentityName: PropTypes.func.isRequired,
  setWebentityHomepage: PropTypes.func.isRequired,
  stoppedLoadingWebentity: PropTypes.func.isRequired,
  saveAdjustedWebentity: PropTypes.func.isRequired,
  setAdjustWebentity: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired,
  hideAdjustWebentity: PropTypes.func.isRequired,
  toggleDoNotShowAgain: PropTypes.func.isRequired,
  setMergeWebentity: PropTypes.func.isRequired,
  unsetMergeWebentity: PropTypes.func.isRequired,
  mergeWebentities: PropTypes.func.isRequired,
}

const mapStateToProps = (
  { corpora, intl: { locale }, servers, stacks, tabs, webentities, ui: { loaders, doNotShow } }, // store
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
  searchEngines: corpora.searchEngines,
  server: servers.selected,
  corpusId: corpora.selected.corpus_id,
  webentity,
  selectedWebentity: webentities.selected,
  loadingWebentityStack: stacks.loadingWebentity,
  mergeRequired: webentities.merges[id],
  adjusting: webentity && webentities.adjustments[webentity.id],
  status: corpora.status,
  tlds: webentities.tlds,
  saving: loaders.webentity_adjust,
  merging: loaders.webentity_merge,
  noCrawlPopup: doNotShow.crawlPopup
})

const mapDispatchToProps = {
  showError, showNotification, hideError, toggleDoNotShowAgain,
  setTabUrl, setTabStatus, setTabTitle, setTabIcon, openTab, closeTab, addNavigationHistory,
  declarePage, setTabWebentity, setWebentityName, setWebentityHomepage, fetchStackAndSetTab,
  stoppedLoadingWebentity, setAdjustWebentity, showAdjustWebentity, hideAdjustWebentity,
  saveAdjustedWebentity, setMergeWebentity, unsetMergeWebentity, mergeWebentities
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserTabContent)
