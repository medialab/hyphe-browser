import React, { Component } from 'react';
import DevTools from './DevTools';
import BrowserPage from './BrowserPage';


export default class App extends Component {
  render() {
    return (
      <div>
        <BrowserPage />
        <DevTools />
      </div>
    );
  }
}

