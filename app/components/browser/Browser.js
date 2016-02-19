import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import ErrorMessage from './ErrorMessage'
import Header from './Header'
import BrowserStack from './BrowserStack'
import BrowserTabs from './BrowserTabs'
import CorpusStatusWatcher from '../CorpusStatusWatcher'
import Spinner from '../Spinner'

class Browser extends React.Component {
  render () {
    if (!this.props.ready) {
      // Corpus not yet selected
      return <Spinner />
    }

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

Browser.propTypes = {
  ready: PropTypes.bool.isRequired
}

const mapStateToProps = ({ corpora }) => ({
  ready: !!corpora.get('selected')
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Browser)
