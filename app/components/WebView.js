import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';


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
    });
    webview.addEventListener('did-fail-load', ({ errorCode, errorDescription, validatedUrl }) => {
      update('error', { errorCode, errorDescription, validatedUrl, url: webview.getURL() });
    });
    webview.addEventListener('page-title-set', ({ title, explicitSet }) => {
      update('title', title);
    });
    webview.addEventListener('page-favicon-updated', ({ favicons }) => {
      update('favicon', favicons[0]);
    });
  }

  render() {
    const { url, ua } = this.props;

    console.log('RENDER', url);

    return (
      <webview
        src={ url }
        useragent={ ua }
        autosize="on" />
    );
  }
}

export default WebView;
