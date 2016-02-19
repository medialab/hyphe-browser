// this is the wainting page while the corpus is starting
// then it auto redirects to the browser

import React, { PropTypes } from 'react'
import { corpusShape } from '../../types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'

import actions from '../../actions'
import {
  ERROR_CORPUS_NOT_STARTED,
  ERROR_SERVER_NO_RESOURCE
} from '../../constants'
import Spinner from '../Spinner'
import CorpusStatusWatcher from '../CorpusStatusWatcher'

class Lobby extends React.Component {
  render () {

    const { corpus, error } = this.props

    return (
      <CorpusStatusWatcher className="lobby">
        <h2 className="pane-centered-title">
          { corpus.get('name') }
        </h2>
        <div><T id="webentities" values={ { count: corpus.get('webentities_in') } } /></div>
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
  actions: PropTypes.object,
  dispatch: PropTypes.func,
  corpus: corpusShape,
  error: PropTypes.any
}

const mapStateToProps = (state) => ({
  corpus: state.corpora.get('selected'),
  error: state.ui.error
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch),
  dispatch
})

const connectedLobby = connect(mapStateToProps, mapDispatchToProps)(Lobby)

export default connectedLobby
