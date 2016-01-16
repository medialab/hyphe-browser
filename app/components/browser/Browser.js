import React, { PropTypes } from 'react'
import ErrorMessage from './ErrorMessage'
import Header from './Header'
import BrowserStack from './BrowserStack'
import BrowserTabs from './BrowserTabs'
import CorpusStatusWatcher from '../CorpusStatusWatcher'

import { connect } from 'react-redux'

class Browser extends React.Component {
  render () {
    return (
      <CorpusStatusWatcher className="window browser-window">
        <Header />
        <BrowserStack />
        <BrowserTabs />
        <ErrorMessage { ...this.props.error } />
      </CorpusStatusWatcher>
    )
  }
}

Browser.propTypes = {
  error: PropTypes.shape(ErrorMessage.propTypes)
}

const mapStateToProps = ({ ui }) => ({
  error: ui.error
})

export default connect(mapStateToProps)(Browser)
