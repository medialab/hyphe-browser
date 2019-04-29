import './browser'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import Header from '../../components/Header'
import Spinner from '../../components/Spinner'
import Notification from '../../components/Notification'
import BrowserStack from '../BrowserStack'
import BrowserTabs from '../BrowserTabs'
import CorpusStatusWatcher from './CorpusStatusWatcher'

const Browser = ({ corpus, status }) => {
  if (!corpus) {
    // Corpus not yet selected
    return <Spinner />
  }

  return (
    <CorpusStatusWatcher className="window browser-window">
      <Header corpus={ corpus } status={ status } />
      <BrowserStack />
      <BrowserTabs />
      <Notification />
    </CorpusStatusWatcher>
  )
}

Browser.propTypes = {
  corpus: PropTypes.object,
  status: PropTypes.object,
  locale: PropTypes.string.isRequired,
}

const mapStateToProps = ({ corpora, intl: { locale } }) => ({
  corpus: corpora.selected,
  status: corpora.status,
  // hack needed to propagate locale change
  locale
})

export default connect(mapStateToProps)(Browser)
