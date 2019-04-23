// this is the wainting page while the corpus is starting
// then it auto redirects to the browser

import React, { PropTypes } from 'react'
import { FormattedMessage as T } from 'react-intl'

import {
  ERROR_CORPUS_NOT_STARTED,
  ERROR_SERVER_NO_RESOURCE
} from '../../constants'
import Spinner from '../Spinner'

const Lobby = ( { corpus, error } ) => {
  return (
    <div>
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
    </div>
  )
}
Lobby.propTypes = {
  corpus: PropTypes.object,
  error: PropTypes.any,
}

export default Lobby
