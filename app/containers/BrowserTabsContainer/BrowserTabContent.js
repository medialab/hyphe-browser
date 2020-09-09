/* eslint-disable react/no-did-update-set-state */
import './BrowserTabContent.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import networkErrors from 'chromium-net-errors'

import { PAGE_HYPHE_HOME, SHORTCUT_FIND_IN_PAGE } from '../../constants'

import BrowserBar from '../../components/BrowserBar'
import NewTabContent from '../../components/NewTabContent'

import WebView from './WebView'
import SearchBar from './SearchBar'
import { FormattedMessage } from 'react-intl'

import { ipcRenderer as ipc } from 'electron'

import { eventBusShape } from '../../types'

import { showError, showNotification, hideError, toggleDoNotShowAgain } from '../../actions/browser'
import { stoppedLoadingWebentity } from '../../actions/stacks'
import {
  setTabUrl, setTabStatus, setTabTitle, setTabIcon,
  openTab, closeTab,
  addNavigationHistory,
} from '../../actions/tabs'
import {
  declarePage, setTabWebentity, setWebentityHomepage,
  setWebentityStatus, setAdjustWebentity, saveAdjustedWebentity, showAdjustWebentity, addWebentityPrefixes,
  hideAdjustWebentity, mergeWebentities
} from '../../actions/webentities'

import { fetchStackAndSetTab } from '../../actions/stacks'

import { getSearchUrl } from '../../utils/search-web'
import { compareUrls, longestMatching, urlToLru, lruObjectToString } from '../../utils/lru'
import InModal from './InModal'
import RedirectionModal from './RedirectionModal'

class BrowserTabContent extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      previousUrl: '',
      disableBack: true,
      disableForward: true,
      disableApplyButton: false,
      showSearchBar: false,
      disableRedirect: false,
      originalWebentity: null,
      dnsError: false,
      mergeRequired: null,
      showRedirectionModal: false,
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
    this.navOpenHandler = (url) => openTab({ url, activeTabId: id })
    eventBus.on('open', this.navOpenHandler)

    this.handleShowSearchBar = () => { if(this.props.active) this.setState({ showSearchBar: true }) }
    ipc.on(`shortcut-${SHORTCUT_FIND_IN_PAGE}`, this.handleShowSearchBar)
    ipc.send('registerShortcut', SHORTCUT_FIND_IN_PAGE)
    eventBus.on('showSearchBar', this.handleShowSearchBar)
  }

  componentDidUpdate (prevProps) {
    if (this.props.adjusting && this.props.adjusting.crawl && this.props.noCrawlPopup &&
      (!prevProps.adjusting || !prevProps.adjusting.crawl)) {
      this.saveAdjustChanges(this.props)
    }
    if (this.props.webentity && prevProps.webentity && this.props.webentity.id !== prevProps.webentity.id) {
      this.setState({ originalWebentity: null, dnsError: false,  mergeRequired: null, disableRedirect: false })
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

  updateTabStatus = (event, info)  => {
    const { id, setTabStatus, setTabTitle, setTabUrl, setTabIcon,
      showError, showNotification, hideError, declarePage, setTabWebentity,
      eventBus, server, corpusId, disableWebentity, stoppedLoadingWebentity,
      webentity, tlds, selectedEngine, addNavigationHistory } = this.props
    switch (event) {
    case 'open':
      eventBus.emit('open', info)
      break
    case 'start':
      hideError()
      // will-navigate not triggered do not set tab url if redirected
      if (!this.state.mergeRequired) setTabStatus({ loading: true, url: info }, id)
      if (!disableWebentity &&
        // do not declare pages(show sidebar) when only changing url's anchor
        !this.samePage(info) &&
        // do not unset tab webentity if there is a redirect
        !this.state.mergeRequired &&
        // or when probably remaining within the same webentity
        !(webentity && longestMatching(webentity.prefixes, info, tlds))) {
        setTabWebentity({ tabId: id, webentity: null })
      }
      break
    case 'stop':
      // will-navigate not triggered do not set tab url if redirected
      if (!this.state.mergeRequired) setTabUrl({ url: info, id })
      if (this.state.mergeRequired ||
          (!disableWebentity &&
          !this.samePage(info))
      ) {
        declarePage({
          serverUrl: server.url,
          corpusId,
          url: info
        }).then((webentity) => {
          if (id) {
            if (this.state.mergeRequired) {
              this.setState({
                mergeRequired: {
                  ...this.state.mergeRequired,
                  redirectWebentity: webentity
                },
                showRedirectionModal: true
              })
            } else {
              // TODO: this is not right webentity for Linkedin internal redirect cases
              if (!this.state.dnsError && this.state.originalWebentity && !longestMatching(this.state.originalWebentity.prefixes, info, tlds)) {
                this.setState({
                  mergeRequired: {
                    redirectUrl: info,
                    originalWebentity: this.state.originalWebentity,
                    redirectWebentity: webentity
                  },
                  showRedirectionModal: true
                })
                setTabUrl({ url: this.state.originalWebentity.tabUrl, id })
                setTabWebentity({ tabId: id, webentity: this.state.originalWebentity })
              } else {
                setTabWebentity({ tabId: id, webentity })
              }
            }
          }
        })
      }
      this.setState({ previousUrl: info, disableRedirect: false  })
      setTabStatus({ loading: false }, id)
      addNavigationHistory({ url: info, corpusId })
      stoppedLoadingWebentity()
      break
    case 'redirect':
      if (webentity &&
        !this.state.dnsError &&
        !compareUrls(info.oldURL, info.newURL) &&
        !longestMatching(webentity.prefixes, info.newURL, tlds)) {
        // initialize mergeRequired
        this.setState({
          mergeRequired: {
            redirectUrl: info.newURL,
            originalWebentity: webentity
          }
        })
      } else if (this.state.mergeRequired) {
        this.setState({
          mergeRequired: {
            ...this.state.mergeRequired,
            redirectUrl: info.newURL,
          }
        })
      }

      if (this.state.mergeRequired && longestMatching(webentity.prefixes, info.newURL, tlds)) {
        // handle redirect multiple times and longestMatching passes at final url
        this.setState({
          mergeRequired: null,
          showRedirectionModal: false
        })
      }
      break
    case 'title':
      setTabTitle({ title: info, id })
      break
    case 'favicon':
      setTabIcon({ icon: info, id })
      break
    case 'navigate':
      // will-navigate not triggered do not set tab url if redirected
      if (!this.state.mergeRequired) setTabUrl({ url: info, id })
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
          setTabUrl({ url: getSearchUrl(selectedEngine, term), id })
          this.setState({
            originalWebentity: null,
            dnsError: true
          })
        } else {
          if (info.errorCode !== -3) {
            // https://github.com/medialab/hyphe-browser/issues/130
            // Any redirection, even 30x throw a -3 error.
            showError({ messageId: 'error.network-error', messageValues: { error: err.message } })
          }
          if (!this.state.mergeRequired) {
            setTabUrl({ url: info.pageURL, id })
          }
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

  saveAdjustChanges = (props, adjust) => {
    const { saveAdjustedWebentity, hideAdjustWebentity, server, corpusId,
      webentity, adjusting, hideError, showError, id, disableWebentity,
      declarePage, url } = props
    const localAdjust = adjust ? adjust : adjusting

    // no change by default
    this.setState({ setDoNotShowAgainAfterSubmit: null })

    if (disableWebentity) {
      return
    }

    saveAdjustedWebentity({ serverUrl: server.url, corpusId, webentity, adjust: localAdjust, tabId: id })
      .then(() => {
        hideError()
        hideAdjustWebentity(webentity.id)
      })
      .catch((err) => {
        showError( !~err.message.indexOf('is already set to an existing WebEntity')
          ? { messageId: 'error.save-webentity', messageValues: { error: `${err.message}` }, fatal: false }
          : { messageId: 'error.existing-prefix', fatal: false }
        )
        hideAdjustWebentity(webentity.id)
        declarePage({
          serverUrl: server.url,
          corpusId,
          url
        }).then((webentity) => setTabWebentity({ tabId: id, webentity }))
      })
  }


  handleHideSearchBar = () => {
    if(this.props.active) this.setState({ showSearchBar: false })
  }

  render () {
    const {
      active, id, url, title, server,corpusId, webentity, tlds, loading, adjusting, disableNavigation,
      noCrawlPopup, eventBus, setTabUrl, setTabWebentity, setWebentityHomepage, setWebentityStatus,
      selectedEngine, showAdjustWebentity, closable, isEmpty, fetchStackAndSetTab, onChangeEngine, declarePage,
      hideAdjustWebentity, toggleDoNotShowAgain, mergeWebentities, addWebentityPrefixes, setAsideMode
    } = this.props

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

    const handleUpdateSearch = (value) => eventBus.emit('findInPage', value, false)
    const handleFindNext = (value) => eventBus.emit('findInPage', value, true)
    const handleClearSearch = () => eventBus.emit('stopFindInPage')

    const handleSetTabUrl = (value) => {
      setTabUrl({ url: value, id })
      setAsideMode('webentityBrowse')
      declarePage({
        serverUrl: server.url,
        corpusId,
        url: value
      }).then((webentity) => {
        this.setState({
          mergeRequired: null,
          originalWebentity: {
            ...webentity,
            tabUrl: value
          }
        })
      })
    }
    const handleSetWebentityHomepage = () => setWebentityHomepage({ serverUrl: server.url, corpusId, homepage: url, webentityId: webentity.id })
    const onAddClick = () => {
      showAdjustWebentity({ webentityId: webentity.id, crawl: true, createNewEntity: true })
    }

    const handleFetchStackAndSetTab = (stack, filter) => {
      fetchStackAndSetTab({
        serverUrl: server.url,
        corpusId,
        stack,
        filter,
        tabId: id
      })
    }

    const doToggle = () => {
      if (this.state.setDoNotShowAgainAfterSubmit !== null) {
        toggleDoNotShowAgain('crawlPopup', this.state.setDoNotShowAgainAfterSubmit)
      }
    }

    const handleSaveAdjust = (webentity, info) => {
      doToggle()
      setAdjustWebentity({ webentityId: webentity.id, info })
      this.saveAdjustChanges(this.props, info)
    }

    const handleCloseInModal = () => {
      hideAdjustWebentity(webentity.id)
    }

    const handleCloseRedirectModal = () => this.setState({ showRedirectionModal: false })
    const handleShowRedirectModal = () => this.setState({ showRedirectionModal: true })

    const handleValidateDecision = ({ redirectionDecision, mergeDecision, prefixes }) => {
      if (!redirectionDecision) {
        // previousUrl is redirectedUrl here, need to set it back to originalUrl
        this.setState({
          previousUrl: this.state.mergeRequired.originalWebentity.tabUrl,
          disableRedirect: true,
          originalWebentity: null,
          dnsError: false
        })
      } else {
        if(mergeDecision === 'OUT') {
          setWebentityStatus({
            serverUrl: server.url,
            corpusId,
            status: 'OUT',
            webentityId: this.state.mergeRequired.originalWebentity.id,
          })
          // set current webentity to redirected one
          setTabUrl({ url: this.state.mergeRequired.redirectUrl, id })
          setTabWebentity({
            tabId: id,
            webentity: this.state.mergeRequired.redirectWebentity
          })
        } else if (mergeDecision === 'MERGE') {
          mergeWebentities({
            serverUrl: server.url,
            corpusId,
            webentityId: this.state.mergeRequired.originalWebentity.id,
            redirectWebentity: this.state.mergeRequired.redirectWebentity,
            type: this.state.mergeRequired.type
          })
          // set current webentity to redirected one
          setTabUrl({ url: this.state.mergeRequired.redirectUrl, id })
          setTabWebentity({
            tabId: id,
            webentity: this.state.mergeRequired.redirectWebentity
          })
        } else if (mergeDecision === 'MERGE-REVERSE') {
          addWebentityPrefixes({
            serverUrl: server.url,
            corpusId,
            webentityId: this.state.mergeRequired.originalWebentity.id,
            prefixes,
            tabId: id
          }).then(() => {
            declarePage({
              serverUrl: server.url,
              corpusId,
              url
            }).then((webentity) => setTabWebentity({ tabId: id, webentity }))
            setTabUrl({ url: this.state.mergeRequired.redirectUrl, id })
          })
        }
        this.setState({ originalWebentity: null, dnsError: false, mergeRequired: null, disableRedirect: false })
      }
      handleCloseRedirectModal()
    }

    const handleKeyUp = (e) => {
      if (e.keyCode === 27 && active) { // ESCAPE
        e.stopPropagation()
        if (adjusting) {
          handleCloseInModal()
        } else if (this.state.mergeRequired && webentity) {
          handleCloseRedirectModal()
        }
      }
    }

    return (
      <div
        key={ id } tabIndex="1" className="browser-tab-content"
        style={ active ? {} : { display:'none' } }
        onKeyUp={ handleKeyUp }
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
          displayAddButton={ webentity && webentity.status !== 'DISCOVERED' && !webentity.prefixes.includes(lruObjectToString(urlToLru(url))) }
          onAddClick={ onAddClick }
        />
        {url === PAGE_HYPHE_HOME &&
          <NewTabContent
            isEmpty={ isEmpty }
            selectedEngine = { selectedEngine }
            onSelectStack = { handleFetchStackAndSetTab }
            onChangeEngine = { onChangeEngine }
            onSetTabUrl={ handleSetTabUrl }
          />
        }
        <div className="webview-container" style={{ display: url === PAGE_HYPHE_HOME ? 'none' : 'block' }} >
          <WebView
            id={ id } url={ url } closable={ closable } eventBus={ eventBus }
          />
          {this.state.showSearchBar &&
            <SearchBar
              id={ id }
              onUpdateSearch={ handleUpdateSearch }
              onFindNext={ handleFindNext }
              onClearSearch={ handleClearSearch }
              onHideSearchBar={ this.handleHideSearchBar }
            />}
          {
            this.state.disableRedirect &&
            <div className="denied-redirection-container">
              <div className="notification">
                <FormattedMessage id="browser-tab-content.disable-redirect-message" />
              </div>
              <div>
                <button
                  className="btn btn-success"
                  onClick={ handleShowRedirectModal }
                >
                  <FormattedMessage id="browser-tab-content.show-redirection-again" />
                </button>
              </div>
            </div>
          }
        </div>
        { !noCrawlPopup && active && adjusting && adjusting.crawl &&
          <InModal
            isOpen
            onRequestClose={ handleCloseInModal }
            onSuccess={ handleSaveAdjust }
            url={ this.props.server.url }
            corpusId={ this.props.corpusId }
            tabUrl={ this.props.url }
            tlds={ this.props.tlds }
            webentity={ webentity }
            createNewEntity={ this.props.adjusting && this.props.adjusting.createNewEntity }
          />
        }
        {
          webentity &&
          this.state.mergeRequired && this.state.mergeRequired.redirectWebentity &&
          this.state.showRedirectionModal &&
          <RedirectionModal
            isOpen
            // onClose={ handleCloseRedirectModal }
            mergeRequired = { this.state.mergeRequired }
            tlds={ this.props.tlds }
            onValidateDecision={ handleValidateDecision }
          />
        }
      </div>
    )
  }
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
  setWebentityHomepage: PropTypes.func.isRequired,
  addWebentityPrefixes: PropTypes.func.isRequired,
  stoppedLoadingWebentity: PropTypes.func.isRequired,
  saveAdjustedWebentity: PropTypes.func.isRequired,
  setWebentityStatus: PropTypes.func.isRequired,
  setAdjustWebentity: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired,
  hideAdjustWebentity: PropTypes.func.isRequired,
  toggleDoNotShowAgain: PropTypes.func.isRequired,
  mergeWebentities: PropTypes.func.isRequired,
  setAsideMode: PropTypes.func.isRequired
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
  searchEngines: corpora.searchEngines,
  server: servers.selected,
  corpusId: corpora.selected.corpus_id,
  webentity,
  selectedWebentity: webentities.selected,
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
  declarePage, setTabWebentity, setWebentityHomepage, fetchStackAndSetTab, addWebentityPrefixes,
  stoppedLoadingWebentity, setWebentityStatus, setAdjustWebentity, showAdjustWebentity, hideAdjustWebentity,
  saveAdjustedWebentity, mergeWebentities
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserTabContent)
