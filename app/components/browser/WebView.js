import React from 'react'
import { findDOMNode } from 'react-dom'
import { WEBVIEW_UA } from '../../constants'

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
      ...props
    })
  }

  shouldComponentUpdate ({ ua, url }) {
    // Should re-render only if user-agent or frame URL has changed
    // If "onStatusUpdate" is modified (because owner is re-rendered for example) we don't want to
    // refresh the webview, but (**)
    return this.props.ua !== ua && this.props.url !== url
  }

  componentDidMount () {
    const webview = findDOMNode(this)

    // (**) beware always calling directly "this.props.onStatusUpdate" reference so that
    // when props are updated, the proper callback is correctly called
    const update = (what, info) => this.props.onStatusUpdate(what, info)

    // TODO handle navigation methods: goBack, goForward, stop, reload…
    // TODO add shortcut to webview.openDevTools()

    webview.addEventListener('did-start-loading', () => {
      update('start', webview.getURL())
    })

    webview.addEventListener('did-stop-loading', () => {
      update('stop', webview.getURL())
    })

    webview.addEventListener('did-fail-load', ({ errorCode, errorDescription, validatedURL }) => {
      update('error', { errorCode, errorDescription, validatedURL, pageURL: webview.getURL() })
    })

    webview.addEventListener('page-title-set', ({ title, explicitSet }) => { // eslint-disable-line no-unused-vars
      update('title', title)
    })

    webview.addEventListener('page-favicon-updated', ({ favicons }) => {
      update('favicon', favicons[0])
    })

    webview.addEventListener('new-window', ({ url, frameName }) => {
      // TODO handle new window creation
      console.log('TODO new window', url, frameName)
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

      const [ { x, y, hasSelection, href, img, video } ] = args
      const menu = new Menu()
      if (href) {
        menu.append(new MenuItem({ label: 'Open in new Tab', click: () => alert('openTab ' + href) }))
      }
      if (hasSelection) {
        menu.append(new MenuItem({ label: 'Copy', click: () => alert('Copy') }))
      }
      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(new MenuItem({ label: 'Close Tab', click: () => alert('closeTab') }))
      menu.popup(remote.getCurrentWindow())
    })
  }

  render () {
    const { url, ua, visible } = this.props

    return (
      <webview
        src={ url }
        useragent={ ua }
        autosize="on"
        preload="./utils/webview-preload-script.js"
        style={ { display: visible ? 'block' : 'none' } } />
    )
  }
}

WebView.propTypes = {
  onStatusUpdate: React.PropTypes.func.isRequired,
  ua: React.PropTypes.string,
  url: React.PropTypes.string.isRequired,
  visible: React.PropTypes.bool
}

export default WebView
