import React from 'react'
import ErrorMessage from './ErrorMessage'
import Header from './Header'
import BrowserStack from './BrowserStack'
import BrowserTabs from './BrowserTabs'

import { connect } from 'react-redux'


const Browser = ({ error }) => (
  <div className="window">
    <Header />
    <BrowserStack />
    <BrowserTabs />
    <ErrorMessage { ...error } />
  </div>
)

const mapStateToProps = ({ ui }) => ({
  error: ui.error
})

export default connect(mapStateToProps)(Browser)
