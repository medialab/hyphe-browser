import React from 'react'
import { connect } from 'react-redux'

import '../../css/browser/browser'

import HypheHeader from '../HypheHeader'
import Notification from './Notification'
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

    const showOverlay = this.props.isAdjusting

    return (
      <CorpusStatusWatcher className="window browser-window">
        <HypheHeader />
        <BrowserStack />
        <BrowserTabs />
        <Notification />
        { showOverlay && <div className="global-overlay" /> }
      </CorpusStatusWatcher>
    )
  }
}

Browser.propTypes = {
  corpus: React.PropTypes.object,
  isAdjusting: React.PropTypes.bool.isRequired
}

const mapStateToProps = ({ corpora, webentities }) => ({
  corpus: corpora.selected,
  isAdjusting: Object.keys(webentities.adjustments).some(webentityId => webentities.adjustments[webentityId] !== null)
})

export default connect(mapStateToProps)(Browser)
