import React, { Component, PropTypes as T } from 'react';
import styles from './Counter.module.css';

class BrowserFrame extends Component {
  static propTypes = {
    url: T.string.isRequired
  };

  render() {
    return <webview
      src={ this.props.url }
      plugins
      disablewebsecurity
      allowpopups
      useragent="Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko" />;
  }
}

export default BrowserFrame;
