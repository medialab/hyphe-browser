import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

import remote from 'remote';

const Menu = remote.require('menu');
const MenuItem = remote.require('menu-item');


/**
 * @see https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md
 */
class WebView extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    ua: PropTypes.string,
    onStatusUpdate: PropTypes.func.isRequired
  };

  constructor(props) {
    super({
      ua: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
      ...props
    });
  }

  componentDidMount() {
    const webview = findDOMNode(this);
    const update = this.props.onStatusUpdate;

    // TODO methods: goBack, goForward, stop, reload…


    webview.addEventListener('did-start-loading', () => {
      update('start', webview.getURL());
    });
    webview.addEventListener('did-stop-loading', () => {
      update('stop', webview.getURL());
      webview.openDevTools();
    });

    webview.addEventListener('did-fail-load', ({ errorCode, errorDescription, validatedURL }) => {
      console.error('did-fail-load', validatedURL, webview.getURL());
      update('error', { errorCode, errorDescription, validatedURL, pageURL: webview.getURL() });
    });
    webview.addEventListener('page-title-set', ({ title, explicitSet }) => {
      update('title', title);
    });
    webview.addEventListener('page-favicon-updated', ({ favicons }) => {
      update('favicon', favicons[0]);
    });

    webview.addEventListener('new-window', ({ url, frameName }) => {
      console.log('new window', url, frameName);
    });

    webview.addEventListener('ipc-message', ({ channel, args, }) => {
      if (channel === 'foo') {
        const [ n ] = args;
        alert('executed foo(' + n + ')');
      } else if (channel === 'show-contextmenu') {
        const [ { x, y, hasSelection, href, img, video } ] = args;
        const menu = new Menu();
        if (href) {
          menu.append(new MenuItem({ label: 'Open in new Tab', click: () => alert('openTab ' + href) }));
        }
        if (hasSelection) {
          menu.append(new MenuItem({ label: 'Copy', click: () => alert('Copy') }));
        }
        menu.append(new MenuItem({ type: 'separator' }));
        menu.append(new MenuItem({ label: 'Close Tab', click: () => alert('closeTab') }));
        menu.popup(remote.getCurrentWindow())
      }
    });

    webview.addEventListener('contextmenu', ({ offsetX, offsetY }) => {
      webview.send('request-contextmenu-info', { x: offsetX, y: offsetY });
    });
  }

  render() {
    const { url, ua } = this.props;

    console.log('RENDER', url);

    return (
      <webview
        src={ url }
        useragent={ ua }
        autosize="on"
        preload="./preload-script.js" />
    );
  }
}

export default WebView;
