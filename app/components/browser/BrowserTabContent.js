import '../../css/browser/browser-tab-content'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom'
import { intlShape } from 'react-intl'
import cx from 'classnames'
import networkErrors from 'chromium-net-errors'

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

import { showError, showNotification, hideError, toggleDoNotShowAgain } from '../../actions/browser'
import { stoppedLoadingWebentity } from '../../actions/stacks'
import {
  setTabUrl, setTabStatus, setTabTitle, setTabIcon,
  openTab, closeTab,
  setSearchEngine
} from '../../actions/tabs'
import {
  declarePage, setTabWebentity, setWebentityName,
  setAdjustWebentity, saveAdjustedWebentity, showAdjustWebentity,
  hideAdjustWebentity, setMergeWebentity, unsetMergeWebentity, mergeWebentities
} from '../../actions/webentities'

import { getSearchUrl } from '../../utils/search-web'
import { urlToName, hasExactMatching, compareUrls, longestMatching } from '../../utils/lru'

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

    this.doNotDeclarePageOnStop = false

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

  componentDidUpdate (prevProps) {
    if (this.props.active &&
      (prevProps.active !== this.props.active ||
       prevProps.webentity !== this.props.webentity)) {
      findDOMNode(this.webviewComponent).focus()
    }
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
      tlds, searchEngine } = this.props

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
        // avoid emptying sidebar when only changing url's anchor
        !this.samePage(info) &&
        // or when probably remaining within the same webentity
        !(webentity && longestMatching(webentity.prefixes, info, tlds))) {
        setTabWebentity(server.url, corpusId, id, null)
      }
      break
    case 'stop':
      // Redirect Hyphe special tab to network when userclosed or misstarted
      if (disableWebentity && info === server.home + '/#/login') {
        info = server.home + '/#/project/' + corpusId + '/network'
      }
      setTabStatus({ loading: false, url: info }, id)
      if (!disableWebentity) {
        if (!this.doNotDeclarePageOnStop) {
          setTabUrl(info, id)
          // do not declare pages with only change in anchor
          if (!this.samePage(info) || loadingWebentityStack) {
            this.setState({ webentityName: null })
            declarePage(server.url, corpusId, info, id)
          }
        } else {
          this.doNotDeclarePageOnStop = false
        }
      }
      stoppedLoadingWebentity()
      this.setState({ previousUrl: info })
      break
    case 'redirect':
      if (loadingWebentityStack && selectedWebentity &&
        !longestMatching(selectedWebentity.prefixes, info.newURL, tlds)) {
        setMergeWebentity(id, selectedWebentity, webentity)
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
      // In all cases, log to console
      if (process.env.NODE_ENV === 'development') {
        console.debug(info) // eslint-disable-line no-console
        console.error(err) // eslint-disable-line no-console
      }
      setTabStatus({ loading: false, error: info }, id)
      // Main page triggered the error, it's important
      if (info.pageURL === info.validatedURL) {
        // DNS error: let's search instead
        if (err.name === 'NameNotResolvedError') {
          this.doNotDeclarePageOnStop = true
          showNotification({ messageId: 'error.dns-error-search', timeout: 3500 })
          const term = info.pageURL.replace(/^.+:\/\/(.+?)\/?$/, '$1')
          setTabUrl(getSearchUrl(searchEngine, term), id)
        } else {
          showError({ messageId: 'error.network-error', messageValues: { error: err.message } })
          setTabUrl(info.pageURL, id)
        }
      }
      break
    }
    default:
      if (process.env.NODE_ENV === 'development') {
        console.log("Unhandled event:", event, info)
      }
      break
    }
  }

  saveAdjustChanges (props) {
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
        showError( !~err.message.indexOf("is already set to an existing WebEntity")
          ? { messageId: 'error.save-webentity', messageValues: { error: err.message }, fatal: false }
          : { messageId: 'error.existing-prefix', fatal: false}
        )
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
    const { setWebentityName, corpusId, url, webentity, adjusting, disableWebentity } = this.props

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
    const { setWebentityName, server, corpusId, webentity } = this.props

    this.setState({ webentityName: name })
    setWebentityName(server.url, corpusId, name, webentity.id)
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
    const { id, url, loading, webentity, setTabUrl, adjusting, disableWebentity, disableNavigation, tlds, searchEngine} = this.props
    const ready = (url === PAGE_HYPHE_HOME) || !loading

    if (disableNavigation) {
      return null
    }

    return (
      <div className="browser-tab-toolbar-url">
        <BrowserTabUrlField
          loading={ !ready }
          initialUrl={ url === PAGE_HYPHE_HOME ? '' : url }
          lruPrefixes={ webentity && webentity.prefixes }
          selectedEngine = { searchEngine }
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
    const { webentity, setAdjustWebentity, adjusting, tlds } = this.props

    this.setState({
      disableApplyButton: !adjusting.crawl && hasExactMatching(webentity.prefixes, url, tlds),
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
    const { id, url, setTabUrl, eventBus, closable, searchEngine, setSearchEngine } = this.props
    
    return (url === PAGE_HYPHE_HOME)
      ? <PageHypheHome 
        selectedEngine = { searchEngine }
        updateSearchEngine = { setSearchEngine }
        onSubmit={ (url) => setTabUrl(url, id) } ref={ component => this.webviewComponent = component } />
      : <WebView id={ id } url={ url } closable={ closable } eventBus={ eventBus } ref={ component => this.webviewComponent = component } />
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
    const { webentity, server, corpusId, adjusting, noCrawlPopup, status, id, url } = this.props

    return (
      <div className="browser-tab-content-cols">
        <SideBar status={ status } webentity={ webentity } tabId={ id } url={ url }
          serverUrl={ server.url } corpusId={ corpusId } disabled={ !!adjusting && !noCrawlPopup } />
        { this.renderContent() }
      </div>
    )
  }

  renderOverlay () {
    const { id, webentity, hideAdjustWebentity, unsetMergeWebentity, mergeRequired } = this.props

    return <div className="global-overlay" onClick={ () => mergeRequired ? unsetMergeWebentity(id) : hideAdjustWebentity(webentity.id) } />
  }

  renderMergePopup () {
    const { id, server, corpusId, webentity, mergeRequired, merging,
     unsetMergeWebentity, mergeWebentities } = this.props

    const merge = e => {
      e.preventDefault()
      mergeWebentities(server.url, corpusId, id, mergeRequired.mergeable.id, webentity.id)
    }

    const cancel = e => {
      e.preventDefault()
      unsetMergeWebentity(id)
    }

    return (
      <div className="we-popup">
        <strong><T id="webentity-merge-popup-title" /></strong>
        <p><T id="webentity-merge-popup-message" values={ {new: webentity.name, old: mergeRequired.mergeable.name} }/></p>
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

    return (
      <div className="we-popup">
        <strong><T id="webentity-crawl-popup-title" /></strong>
        <p><T id="webentity-crawl-popup-message" /></p>
        <p><T id="webentity-crawl-popup-message-2" /></p>
        <p><T id="webentity-crawl-popup-message-3" /></p>
        <div className="we-popup-footer">
          <input ref={component => this.inputComponent = component } type="checkbox" defaultChecked={ noCrawlPopup } onChange={ markToggleOnSubmit } />
          <label onClick={ () => findDOMNode(this.inputComponent).click() }>
            <T id="do-not-show-again" />
          </label>
          <button disabled={ saving } className="apply-we-popup" onClick={ apply }><T id="launch" /></button>
          <button disabled={ saving } className="cancel-we-popup" onClick={ cancel }><T id="cancel" /></button>
        </div>
      </div>
    )
  }

  onKeyUp (e) {
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
    const { active, id, webentity, disableWebentity, adjusting, noCrawlPopup, mergeRequired } = this.props

    return (
      <div key={ id } tabIndex="1" className="browser-tab-content" style={ active ? {} : { position: 'absolute', left: '-10000px' } } onKeyUp={ this._onKeyUp } >
        { this.renderToolbar() }
        { disableWebentity ? this.renderSinglePane() : this.renderSplitPane() }
        { !noCrawlPopup && adjusting && adjusting.crawl && this.renderCrawlPopup() }
        { webentity && mergeRequired && this.renderMergePopup() }
        { ((adjusting && (!noCrawlPopup || !adjusting.crawl)) || (webentity && mergeRequired)) && this.renderOverlay() }
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
  searchEngine: PropTypes.string.isRequired,

  showError: PropTypes.func.isRequired,
  showNotification: PropTypes.func.isRequired,
  hideError: PropTypes.func.isRequired,

  setTabUrl: PropTypes.func.isRequired,
  setTabStatus: PropTypes.func.isRequired,
  setTabTitle: PropTypes.func.isRequired,
  setTabIcon: PropTypes.func.isRequired,
  openTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  setSearchEngine: PropTypes.func.isRequired,

  declarePage: PropTypes.func.isRequired,
  setTabWebentity: PropTypes.func.isRequired,
  setWebentityName: PropTypes.func.isRequired,
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
  searchEngine: tabs.searchEngine,
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
  setTabUrl, setTabStatus, setTabTitle, setTabIcon, openTab, closeTab,
  setSearchEngine, declarePage, setTabWebentity, setWebentityName, stoppedLoadingWebentity,
  setAdjustWebentity, showAdjustWebentity, hideAdjustWebentity,
  saveAdjustedWebentity, setMergeWebentity, unsetMergeWebentity, mergeWebentities
}

export default connect(mapStateToProps, mapDispatchToProps)(TabContent)
