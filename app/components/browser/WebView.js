import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { DEBUG_WEBVIEW, WEBVIEW_UA } from '../../constants'
import { intlShape } from 'react-intl'

import { ipcRenderer as ipc, clipboard } from 'electron'
import remote from 'remote'

const Menu = remote.require('menu')
const MenuItem = remote.require('menu-item')

/**
 * @see https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md
 */
class WebView extends React.Component {

  constructor (props) {
    super({
      ua: WEBVIEW_UA,
      visible: true,
      navigationActions: {},
      ...props
    })

    // Note those are attributes, not state properties, this is on purpose as any way we disabled re-rendering completely
    this.isLoading = false
    this.ignoreNextAbortedError = false
  }

  shouldComponentUpdate () {
    // Should never re-render, only use methods of webview tag
    return false
  }

  componentWillReceiveProps ({ url, ua }) {
    var refresh = false // Use this flag in case 'url' AND 'ua' are modified

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
      this.props.onStatusUpdate('start', url)
      this.node.src = url // This triggers navigation
      refresh = false // So we don't want to call 'reload()'
    }

    if (refresh) {
      this.node.reload()
    }
  }

  translate (id) {
    return this.context.intl.formatMessage({ id })
  }

  componentDidMount () {
    const webview = findDOMNode(this)
    this.node = webview

    // (**) beware always calling directly "this.props.onStatusUpdate" reference so that
    // when props are updated, the proper callback is correctly called
    const update = (what, info) => this.props.onStatusUpdate(what, info)

    // TODO add shortcut to webview.openDevTools()

    // Declare available navigation actions
    this.props.onNavigationActionsReady({
      reload () { webview.reload() },
      back () { webview.goBack() },
      forward () { webview.goForward() },
      canGoBack () { return webview.canGoBack() },
      canGoForward () { return webview.canGoForward() }
    })

    if (DEBUG_WEBVIEW) {
      webview.addEventListener('did-start-loading', (e) => console.debug('did-start-loading', this.node.src, e)) // eslint-disable-line no-console
      webview.addEventListener('did-stop-loading', (e) => console.debug('did-stop-loading', this.node.src, e)) // eslint-disable-line no-console
      webview.addEventListener('load-commit', (e) => console.debug('load-commit', this.node.src)) // eslint-disable-line no-console,no-unused-vars
      webview.addEventListener('did-finish-load', (e) => console.debug('did-finish-load', this.node.src)) // eslint-disable-line no-console,no-unused-vars
      webview.addEventListener('did-frame-finish-load', (e) => console.debug('did-frame-finish-load', this.node.src, e.isMainFrame)) // eslint-disable-line no-console
      webview.addEventListener('will-navigate', (e) => console.debug('will-navigate', this.node.src, e.url)) // eslint-disable-line no-console
      webview.addEventListener('did-navigate', (e) => console.debug('did-navigate', this.node.src, e.url)) // eslint-disable-line no-console
    }

    // Loading status notifications
    webview.addEventListener('did-start-loading', () => {
      this.isLoading = true
      update('start', webview.src)
    })
    webview.addEventListener('did-stop-loading', () => {
      this.isLoading = false
      update('stop', webview.src)
    })

    // In case of error, notify owner
    webview.addEventListener('did-fail-load', ({ errorCode, errorDescription, validatedURL }) => {
      if (this.ignoreNextAbortedError && errorCode === -3) {
        this.ignoreNextAbortedError = false
        return
      }
      update('error', { errorCode, errorDescription, validatedURL, pageURL: webview.getURL() })
    })

    // Guest page metadata: title, favicon
    webview.addEventListener('page-title-updated', ({ title, explicitSet }) => { // eslint-disable-line no-unused-vars
      update('title', title)
      // TODO reset favicon on navigate
    })
    webview.addEventListener('page-favicon-updated', ({ favicons }) => {
      update('favicon', favicons[0])
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
        menu.append(new MenuItem({ label: this.translate('menu.open-in-new-tab'), click: () => this.props.openTab(href) }))
        menu.append(new MenuItem({ label: this.translate('menu.open-in-browser'), click: () => ipc.send('openExternal', href) }))
      }
      if (hasSelection) {
        menu.append(new MenuItem({ label: this.translate('menu.copy'), click: () => clipboard.writeText(selectionText) }))
      }
      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(new MenuItem({ label: this.translate('menu.close-tab'), click: () => update('close') }))
      menu.popup(remote.getCurrentWindow())
    })
  }

  render () {
    const { url, ua } = this.props

    // the preload script below is used to handle right click context menu
    return (
      <webview
        src={ url }
        useragent={ ua }
        autosize="on"
        preload="./utils/webview-preload-script.js"
      />
    )
  }
}

WebView.contextTypes = {
  intl: intlShape
}

WebView.propTypes = {
  onStatusUpdate: PropTypes.func.isRequired,
  ua: PropTypes.string,
  url: PropTypes.string.isRequired,
  onNavigationActionsReady: PropTypes.func,
  openTab: PropTypes.func
}

export default WebView
