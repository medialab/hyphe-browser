import React from 'react'
import { connect } from 'react-redux'

import HypheHeader from '../HypheHeader'
import ErrorMessage from './ErrorMessage'
import BrowserStack from './BrowserStack'
import BrowserTabs from './BrowserTabs'
import CorpusStatusWatcher from '../CorpusStatusWatcher'
import Spinner from '../Spinner'

class Browser extends React.Component {
  render () {
    if (!this.props.corpus) {
      // Corpus not yet selected
      return <Spinner />
    }

    return (
      <CorpusStatusWatcher className="window browser-window">
        <HypheHeader />
        <BrowserStack />
        <BrowserTabs />
        <ErrorMessage />
      </CorpusStatusWatcher>
    )
  }
}

Browser.propTypes = {
  corpus: React.PropTypes.object
}

const mapStateToProps = ({ corpora }) => ({
  corpus: corpora.selected
})

export default connect(mapStateToProps)(Browser)
