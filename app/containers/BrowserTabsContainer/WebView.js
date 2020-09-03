import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { remote, ipcRenderer as ipc, clipboard } from 'electron'

import { eventBusShape } from '../../types'
import { DEBUG_WEBVIEW, WEBVIEW_UA } from '../../constants'

import { compareUrls } from '../../utils/lru'

const { Menu, MenuItem } = remote

/**
 * @see https://github.com/electron/electron/blob/v2.0.18/docs/api/web-contents.md
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

const WebView = ({
  url,
  closable,
  eventBus,
}) => {
  const webviewRef = useRef(null)
  const [ignoreNextAbortedError, setIgnoreNextAbortedError] = useState(false)
  const { formatMessage } = useIntl()
  const translate = (id) => {
    return formatMessage({ id })
  }

  useEffect(() => {
    const webview = webviewRef.current
    // Store handlers for future cleanup
    const reloadHandler = (ignoreCache) => {
      return ignoreCache ? webview.reloadIgnoringCache() : webview.reload()
    }
    const goBackHandler = () => webview.goBack()
    const goForwardHandler = () => webview.goForward()
    const toggleDevToolsHandler = (doOpen) => {
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
      // Note: we use "eventBus" instead of destructued one, in case prop had been modified
      eventBus.emit('status', what, info)

      const newCanGoBack = webview.canGoBack()
      const newCanGoForward = webview.canGoForward()
      if (newCanGoBack !== canGoBack) {
        canGoBack = newCanGoBack
        eventBus.emit('canGoBack', canGoBack)
      }
      if (newCanGoForward !== canGoForward) {
        canGoForward = newCanGoForward
        eventBus.emit('canGoForward', canGoForward)
      }
    }

    // Declare available navigation actions
    eventBus.on('reload', reloadHandler)
    eventBus.on('goBack', goBackHandler)
    eventBus.on('goForward', goForwardHandler)
    eventBus.on('toggleDevTools', toggleDevToolsHandler)

    // Loading status notifications
    webview.addEventListener('did-start-loading', () => {
      update('start', webview.src)
    })

    webview.addEventListener('did-stop-loading', () => {
      update('stop', webview.src)
    })

    // In case of error, notify owner
    webview.addEventListener('did-fail-load', ({ errorCode, errorDescription, validatedURL }) => {
      if (ignoreNextAbortedError && errorCode === -3) {
        setIgnoreNextAbortedError(false)
        return
      }
      update('error', { errorCode, errorDescription, validatedURL, pageURL: webview.getURL() })
    })

    webview.addEventListener('will-navigate', (event) => {
      update('will-navigate', event.url)
    })

    webview.addEventListener('did-navigate', (event) => {
      update('navigate', event.url)
    })

    // Handle redirects - deprecated
    // webview.addEventListener('did-get-redirect-request', ({ oldURL, newURL, isMainFrame }) => {
    //   if (isMainFrame) {
    //     update('redirect', { oldURL, newURL })
    //   }
    // })

    // Handle redirects
    webview.addEventListener('dom-ready', () => {
      const webRequest = remote.webContents.fromId(webview.getWebContentsId()) &&
                        remote.webContents.fromId(webview.getWebContentsId()).session.webRequest
      webRequest.onBeforeRedirect((details) => {
        const { url, redirectURL, resourceType } = details
        if (resourceType === 'mainFrame') {
          update('redirect', { oldURL: url, newURL: redirectURL })
        }
      })
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
        menu.append(new MenuItem({ label: translate('menu.open-in-new-tab'), click: () => eventBus.emit('open', href) }))
        menu.append(new MenuItem({ label: translate('menu.open-in-browser'), click: () => ipc.send('openExternal', href) }))
      }
      if (hasSelection) {
        menu.append(new MenuItem({ label: translate('menu.copy'), click: () => clipboard.writeText(selectionText) }))
      }
      if (closable) {
        menu.append(new MenuItem({ type: 'separator' }))
        menu.append(new MenuItem({ label: translate('menu.close-tab'), click: () => eventBus.emit('close') }))
      }
      if (menu.getItemCount() >= 1) {
        menu.popup(remote.getCurrentWindow())
      }
    })


    return () => {
      eventBus.off('reload', reloadHandler)
      eventBus.off('goBack', goBackHandler)
      eventBus.off('goForward', goForwardHandler)
      eventBus.off('toggleDevTools', toggleDevToolsHandler)
    }
  }, [])

  useEffect(() => {
    if (url !== webviewRef.current.src) {
      webviewRef.current.src = url
    }
  }, [url])

  return (
    <webview
      ref={ webviewRef }
      useragent={ WEBVIEW_UA }
      src={ url }
      preload="./utils/webview-preload-script.js"
    />
  )
}

WebView.propTypes = {
  url: PropTypes.string,
  closable: PropTypes.bool,
  eventBus: eventBusShape.isRequired
}

const areEqual = (prevProps, nextProps) => {
  if (!compareUrls(prevProps.url, nextProps.url)) {
    return false
  }
  return true
}

export default React.memo(WebView, areEqual)
