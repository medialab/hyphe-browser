import React from 'react'
import ErrorMessage from './ErrorMessage'
import Header from './Header'
import BrowserStack from './BrowserStack'
import BrowserTabs from './BrowserTabs'
import CorpusStatusWatcher from '../CorpusStatusWatcher'

import { connect } from 'react-redux'


const Browser = ({ error }) => (
  <CorpusStatusWatcher className="window">
    <Header />
    <BrowserStack />
    <BrowserTabs />
    <ErrorMessage { ...error } />
  </CorpusStatusWatcher>
)

const mapStateToProps = ({ ui }) => ({
  error: ui.error
})

export default connect(mapStateToProps)(Browser)
