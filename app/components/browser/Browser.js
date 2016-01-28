import React from 'react'
import ErrorMessage from './ErrorMessage'
import Header from './Header'
import BrowserStack from './BrowserStack'
import BrowserTabs from './BrowserTabs'
import CorpusStatusWatcher from '../CorpusStatusWatcher'

class Browser extends React.Component {
  render () {
    return (
      <CorpusStatusWatcher className="window browser-window">
        <Header />
        <BrowserStack />
        <BrowserTabs />
        <ErrorMessage />
      </CorpusStatusWatcher>
    )
  }
}

export default Browser
