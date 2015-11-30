import React from 'react';
import WebView from './WebView';
import styles from './Browser.module.css';

export default ({ visible, url, onStatusUpdate }) => (console.log('RENDER WEBVIEW PANE', url),
  <div className={ 'pane ' + styles.paneWebView } style={ visible ? {} : {display:'none'} }>
    <WebView url={ url } onStatusUpdate={ onStatusUpdate } />
  </div>
);
