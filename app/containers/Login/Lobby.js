// this is the wainting page while the corpus is starting
// then it auto redirects to the browser

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'

import {
  ERROR_CORPUS_NOT_STARTED,
  ERROR_SERVER_NO_RESOURCE
} from '../../constants'
import CorpusStatusWatcher from '../CorpusStatusWatcher'
import Spinner from '../../components/Spinner'

class Lobby extends React.Component {
  render () {
    const { corpus, error } = this.props

    return (
      <CorpusStatusWatcher className="lobby">
        <h2 className="pane-centered-title">
          { corpus.name }
        </h2>
        <div><T id="webentities" values={ { count: corpus.webentities_in } } /></div>
        { error && error.message === ERROR_CORPUS_NOT_STARTED
          ? <Spinner textId="starting-corpus" />
          : null
        }
        { error && error.message === ERROR_SERVER_NO_RESOURCE
          ? <Spinner textId="waiting-resources" />
          : null
        }
      </CorpusStatusWatcher>
    )
  }
}

Lobby.propTypes = {
  corpus: PropTypes.object,
  locale: PropTypes.string.isRequired,
  error: PropTypes.any,
}

const mapStateToProps = ({ corpora, intl: { locale }, ui }) => ({
  corpus: corpora.selected,
  locale,
  error: ui.error
})

export default connect(mapStateToProps)(Lobby)
