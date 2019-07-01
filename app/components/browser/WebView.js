import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom'
import { DEBUG_WEBVIEW, WEBVIEW_UA } from '../../constants'
import { intlShape } from 'react-intl'
import { eventBusShape } from '../../types'
import { HYPHE_TAB_ID } from '../../constants'

import { remote, ipcRenderer as ipc, clipboard } from 'electron'

const { Menu, MenuItem } = remote

/**
 * @see https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md
 *
 * eventBus emits navigation events:
 * - status(what: string, info: any)
 *   maps to <webview> events:
 *   - 'did-start-loading' => 'start' + url
 *   - 'did-stop-loading' => 'stop' + url
 *   - 'did-fail-load' => 'error' + { errorCode, errorDescription, validatedURL, pageURL }
 *   - 'did-get-redirect-request' => 'redirect' + { oldURL, newURL }
 *   - 'page-title-updated' => 'title' + title
 *   - 'page-favicon-updated' => 'favicon' + faviconUrl
 *   - 'new-window' (ctrl+click & co) => 'open' + url
 * - canGoBack(boolean)
 * - canGoForward(boolean)
 * - close() when closing tab is requested
 * - open(url) when opening a new url is requested
 *
 * It also listens to events so you can trigger navigation events:
 * - reload(ignoreCache: bool)
 * - goBack()
 * - goForward()
 * - toggleDevTools(forceOpen: bool)
 */
class WebView extends React.Component {

  constructor (props) {
    super(props)

    // Note those are attributes, not state properties, this is on purpose as any way we disabled re-rendering completely
    this.isLoading = false
    this.ignoreNextAbortedError = false
  }

  shouldComponentUpdate () {
    // Should never re-render, only use methods of webview tag
    return false
  }

  componentWillReceiveProps ({ url, ua }) {
    let refresh = false // Use this flag in case 'url' AND 'ua' are modified

    if (ua && ua !== this.props.ua) {
      this.node.setUserAgent(ua)
      refresh = true
    }

    if (url !== this.props.url && url !== this.node.src) {
      if (this.isLoading) {
        // Ignore the next "Error -3 Aborted" if current page is still loading
        this.ignoreNextAbortedError = true
        setTimeout(() => this.ignoreNextAbortedError = false, 50)
      }
      // Set webview's URL
      this.isLoading = true
      this.props.eventBus.emit('status', 'start', url)
      this.node.src = url // This triggers refresh
      refresh = false // So we don't have to trigger it ourselves
    }

    if (refresh) {
      this.node.reload()
    }
  }

  translate (id) {
    return this.context.intl.formatMessage({ id })
  }

  componentWillUnmount () {
    const { eventBus } = this.props

    eventBus.off('reload', this.reloadHandler)
    eventBus.off('goBack', this.goBackHandler)
    eventBus.off('goForward', this.goForwardHandler)
    eventBus.off('toggleDevTools', this.toggleDevToolsHandler)
  }

  componentDidMount () {
    const { eventBus, ua } = this.props

    const webview = findDOMNode(this)
    this.node = webview

    // Set attributes that React does not recognize itself
    webview.setAttribute('useragent', ua)
    webview.setAttribute('autosize', 'on')

    // Store handlers for future cleanup
    this.reloadHandler = (ignoreCache) => ignoreCache ? webview.reloadIgnoringCache() : webview.reload()
    this.goBackHandler = () => webview.goBack()
    this.goForwardHandler = () => webview.goForward()
    this.toggleDevToolsHandler = (doOpen) => {
      if (doOpen === true || !webview.isDevToolsOpened()) {
        webview.openDevTools()
      } else if (doOpen === false || webview.isDevToolsOpened()) {
        webview.closeDevTools()
      }
    }

    // Notify changing (cached to avoid duplicate emits) status of navigability
    let canGoBack = null
    let canGoForward = null
    const update = (what, info) => {
      // Note: we use "this.props.eventBus" instead of destructued one, in case prop had been modified
      this.props.eventBus.emit('status', what, info)

      const newCanGoBack = webview.canGoBack()
      const newCanGoForward = webview.canGoForward()
      if (newCanGoBack !== canGoBack) {
        canGoBack = newCanGoBack
        this.props.eventBus.emit('canGoBack', canGoBack)
      }
      if (newCanGoForward !== canGoForward) {
        canGoForward = newCanGoForward
        this.props.eventBus.emit('canGoForward', canGoForward)
      }
    }

    // Declare available navigation actions
    eventBus.on('reload', this.reloadHandler)
    eventBus.on('goBack', this.goBackHandler)
    eventBus.on('goForward', this.goForwardHandler)
    eventBus.on('toggleDevTools', this.toggleDevToolsHandler)

    // If debug: log status changes
    if (DEBUG_WEBVIEW) {
      webview.addEventListener('did-start-loading', (e) => console.debug('did-start-loading', this.node.src, e)) // eslint-disable-line no-console
      webview.addEventListener('did-stop-loading', (e) => console.debug('did-stop-loading', this.node.src, e)) // eslint-disable-line no-console
      webview.addEventListener('load-commit', (e) => console.debug('load-commit', this.node.src)) // eslint-disable-line no-console,no-unused-vars
      webview.addEventListener('did-finish-load', (e) => console.debug('did-finish-load', this.node.src)) // eslint-disable-line no-console,no-unused-vars
      webview.addEventListener('did-frame-finish-load', (e) => console.debug('did-frame-finish-load', this.node.src, e.isMainFrame)) // eslint-disable-line no-console
      webview.addEventListener('will-navigate', (e) => console.debug('will-navigate', this.node.src, e.url)) // eslint-disable-line no-console
      webview.addEventListener('did-navigate', (e) => console.debug('did-navigate', this.node.src, e.url)) // eslint-disable-line no-console
      webview.addEventListener('did-get-redirect-request', (e) => console.debug('did-get-redirect-request', e)) // eslint-disable-line no-console
    }

    // Loading status notifications
    webview.addEventListener('did-start-loading', () => {
      this.isLoading = true
      update('start', webview.src)
    })
    webview.addEventListener('did-stop-loading', () => {
      this.isLoading = false
      update('stop', webview.src)
      // Stop Sigma's ForceAtlas2 in Hyphe tab when changing tab to avoid cpu overhaul
      if (this.props.tabId === HYPHE_TAB_ID) {
        webview.executeJavaScript("window.onblur = function() { if ($('#stopFA2 span.glyphicon-pause:visible').length) $('#stopFA2').click() }")
      }
    })

    // In case of error, notify owner
    webview.addEventListener('did-fail-load', ({ errorCode, errorDescription, validatedURL }) => {
      if (this.ignoreNextAbortedError && errorCode === -3) {
        this.ignoreNextAbortedError = false
        return
      }
      update('error', { errorCode, errorDescription, validatedURL, pageURL: webview.getURL() })
    })

    // Handle redirects
    webview.addEventListener('did-get-redirect-request', ({ oldURL, newURL, isMainFrame }) => {
      if (isMainFrame) {
        update('redirect', { oldURL, newURL })
      }
    })

    // Guest page metadata: title, favicon
    webview.addEventListener('page-title-updated', ({ title, explicitSet }) => { // eslint-disable-line no-unused-vars
      update('title', title)
      // TODO reset favicon on navigate
    })
    webview.addEventListener('page-favicon-updated', ({ favicons }) => {
      // don't display 404 icons
      fetch(favicons[0]).then((res) => {
        const favicon = (res.status === 200)
          ? favicons[0]
          // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
          : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
        update('favicon', favicon)
      })
    })

    // When receiving the order of opening a new window
    // This can com from "window.open()", "target=frameName", etc…
    webview.addEventListener('new-window', ({ url, frameName }) => {
      update('open', url, frameName)
    })

    // Handle right-click context menu
    // On right-click: tell guest page where the click occurred
    // Given this information, the guest page will gather information…
    webview.addEventListener('contextmenu', ({ offsetX, offsetY }) => {
      webview.send('request-contextmenu-info', { x: offsetX, y: offsetY })
    })
    // … and pass it back to us to generate the corresponding menu
    webview.addEventListener('ipc-message', ({ channel, args }) => {
      if (channel !== 'show-contextmenu') return

      const [ { x, y, hasSelection, selectionText, href, img, video } ] = args // eslint-disable-line
      const menu = new Menu()
      if (href) {
        menu.append(new MenuItem({ label: this.translate('menu.open-in-new-tab'), click: () => eventBus.emit('open', href) }))
        menu.append(new MenuItem({ label: this.translate('menu.open-in-browser'), click: () => ipc.send('openExternal', href) }))
      }
      if (hasSelection) {
        menu.append(new MenuItem({ label: this.translate('menu.copy'), click: () => clipboard.writeText(selectionText) }))
      }
      if (this.props.closable) {
        menu.append(new MenuItem({ type: 'separator' }))
        menu.append(new MenuItem({ label: this.translate('menu.close-tab'), click: () => eventBus.emit('close') }))
      }
      if (menu.getItemCount() >= 1) {
        menu.popup(remote.getCurrentWindow())
      }
    })
  }

  render () {
    // the preload script below is used to handle right click context menu
    return (
      <webview
        tabIndex="0"
        src={ this.props.url }
        preload="./utils/webview-preload-script.js"
      />
    )
  }
}

WebView.contextTypes = {
  intl: intlShape
}

WebView.propTypes = {
  ua: PropTypes.string,
  visible: PropTypes.bool,
  closable: PropTypes.bool,
  url: PropTypes.string.isRequired,
  tabId: PropTypes.string,
  eventBus: eventBusShape.isRequired
}

WebView.defaultProps = {
  ua: WEBVIEW_UA,
  visible: true
}

const mapStateToProps = ({ tabs }) => ({
  tabId: tabs.activeTab && tabs.activeTab.id
})

export default connect(mapStateToProps)(WebView)
