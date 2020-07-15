import './BrowserTabContent.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

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
  declarePage, setTabWebentity, setWebentityHomepage,
  setWebentityStatus, setAdjustWebentity, saveAdjustedWebentity, showAdjustWebentity,
  hideAdjustWebentity, setMergeUrl, setMergeWebentity, unsetMergeWebentity, mergeWebentities
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
    const { id,  mergeRequired, setTabStatus, setTabTitle, setTabUrl, setTabIcon,
      showError, showNotification, hideError, declarePage, setTabWebentity,
      eventBus, server, corpusId, disableWebentity, stoppedLoadingWebentity,
      webentity, loadingWebentityStack, setMergeUrl,
      tlds, selectedEngine, addNavigationHistory } = this.props

    switch (event) {
    case 'open':
      eventBus.emit('open', info)
      break
    case 'start':
      hideError()
      // will-navigate not triggered do not set tab url if redirected
      if (!mergeRequired) setTabStatus({ loading: true, url: info }, id)
      if (!disableWebentity &&
        // do not declare pages(show sidebar) when only changing url's anchor
        !this.samePage(info) &&
        // do not unset tab webentity if there is a redirect
        !mergeRequired &&
        // or when probably remaining within the same webentity
        !(webentity && longestMatching(webentity.prefixes, info, tlds))) {
        setTabWebentity(id, null)
      }
      break
    case 'stop':
      // will-navigate not triggered do not set tab url if redirected
      if (!mergeRequired) setTabStatus({ loading: false, url: info }, id)
      if (mergeRequired ||
          (!disableWebentity &&
          !this.samePage(info) &&
          !(webentity &&
            // if webentity is loaded from memory the longestMatching used to
            // avoid too much declaration will prevent all declaration. So we
            // need to allow declaration at least from homepage because it's
            // the first page visited when clicking in the sidebar.
            !compareUrls(webentity.homepage, info) &&
            longestMatching(webentity.prefixes, info, tlds))
          )
      ) {
        declarePage(server.url, corpusId, info, id)
      }
      this.setState({ previousUrl: info })
      addNavigationHistory(info, corpusId)
      stoppedLoadingWebentity()
      break
    case 'redirect':
      if (loadingWebentityStack && webentity &&
        !longestMatching(webentity.prefixes, info.newURL, tlds)) {
        setMergeUrl({
          tabId: id,
          originalUrl: info.oldURL,
          redirectUrl: info.newURL,
          originalWebentity: webentity
        })
      }
      break
    case 'title':
      setTabTitle(info, id)
      break
    case 'favicon':
      setTabIcon(info, id)
      break
    case 'navigate':
      // will-navigate not triggered do not set tab url if redirected
      if (!mergeRequired) setTabUrl(info, id)
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
          if (info.errorCode !== -3) {
            // https://github.com/medialab/hyphe-browser/issues/130
            // Any redirection, even 30x throw a -3 error.
            showError({ messageId: 'error.network-error', messageValues: { error: err.message } })
          }
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

    saveAdjustedWebentity(server.url, corpusId, webentity, localAdjust, id)
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
        declarePage(server.url, corpusId, url, id)
      })
  }

  render () {
    const {
      active, id, url, title, server,corpusId, webentity, tlds, loading, adjusting, disableNavigation,
      noCrawlPopup, mergeRequired, eventBus, setTabUrl, setTabWebentity, setWebentityHomepage, setWebentityStatus,
      selectedEngine, showAdjustWebentity, closable, isEmpty, fetchStackAndSetTab, onChangeEngine,
      hideAdjustWebentity, toggleDoNotShowAgain, mergeWebentities, unsetMergeWebentity
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
    const handleSetTabUrl = (value) => setTabUrl(value, id)
    const handleSetWebentityHomepage = () => setWebentityHomepage(server.url, corpusId, url, webentity.id)
    const onAddClick = () => {
      showAdjustWebentity(webentity.id, true, true)
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
      setAdjustWebentity(webentity.id, info)
      this.saveAdjustChanges(this.props, info)
    }

    const handleCloseInModal = () => {
      hideAdjustWebentity(webentity.id)
    }

    const handleCloseRedirectModal = () => unsetMergeWebentity({ tabId: id })

    const handleValidateDecision = ({ redirectionDecision, mergeDecision }) => {
      if (redirectionDecision) {
        if(mergeDecision === 'OUT') {
          setWebentityStatus({
            serverUrl: server.url,
            corpusId,
            status: 'OUT',
            webentityId: mergeRequired.originalWebentity.id,
          })
        } else {
          mergeWebentities({
            serverUrl: server.url,
            corpusId,
            originalWebentityId: mergeRequired.originalWebentity.id,
            redirectWebentity: mergeRequired.redirectWebentity,
            type: mergeRequired.type
          })
        }
        // set current webentity to redirected one
        setTabUrl(mergeRequired.redirectUrl, id)
        setTabWebentity(id, mergeRequired.redirectWebentity)
      }
      handleCloseRedirectModal()
    }

    const handleKeyUp = (e) => {
      if (e.keyCode === 27 && active) { // ESCAPE
        e.stopPropagation()
        if (adjusting) {
          handleCloseInModal()
        } else if (mergeRequired && webentity) {
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
        {url === PAGE_HYPHE_HOME ?
          <NewTabContent
            isEmpty={ isEmpty }
            selectedEngine = { selectedEngine }
            onSelectStack = { handleFetchStackAndSetTab }
            onChangeEngine = { onChangeEngine }
            onSetTabUrl={ handleSetTabUrl }
          /> :
          <WebView
            id={ id } url={ url } closable={ closable } eventBus={ eventBus }
          />
        }
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
          webentity && mergeRequired && mergeRequired.redirectWebentity &&
          <RedirectionModal
            isOpen
            // onClose={ handleCloseRedirectModal }
            mergeRequired = { mergeRequired }
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
  setWebentityHomepage: PropTypes.func.isRequired,
  stoppedLoadingWebentity: PropTypes.func.isRequired,
  saveAdjustedWebentity: PropTypes.func.isRequired,
  setWebentityStatus: PropTypes.func.isRequired,
  setAdjustWebentity: PropTypes.func.isRequired,
  showAdjustWebentity: PropTypes.func.isRequired,
  hideAdjustWebentity: PropTypes.func.isRequired,
  toggleDoNotShowAgain: PropTypes.func.isRequired,
  setMergeUrl: PropTypes.func.isRequired,
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
  declarePage, setTabWebentity, setWebentityHomepage, fetchStackAndSetTab,
  stoppedLoadingWebentity, setWebentityStatus, setAdjustWebentity, showAdjustWebentity, hideAdjustWebentity,
  saveAdjustedWebentity, setMergeUrl, setMergeWebentity, unsetMergeWebentity, mergeWebentities
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserTabContent)
