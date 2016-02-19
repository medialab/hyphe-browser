import React, { PropTypes } from 'react'

import { connect } from 'react-redux'
import { showError, hideError } from '../actions/browser'
import { fetchCorpusStatus, startCorpus } from '../actions/corpora'
import { fetchTagsCategories, fetchTags } from '../actions/tags'
import {
  CORPUS_STATUS_WATCHER_INTERVAL,
  ERROR_CORPUS_NOT_STARTED,
  ERROR_SERVER_NO_RESOURCE
} from '../constants'

class CorpusStatusWatcher extends React.Component {

  constructor (props) {
    super(props)

    this.watchTimeout = null
  }

  componentDidMount () {
    this.watchStatus()
  }

  componentWillUnmount () {
    if (this.watchTimeout) {
      clearTimeout(this.watchTimeout)
      this.watchTimeout = null
    }
  }

  watchStatus () {
    const { fetchCorpusStatus, showError, hideError, startCorpus, serverUrl, corpusId, corpusPassword, fetchTagsCategories } = this.props

    const repeat = (immediate = false) => {
      this.watchTimeout = setTimeout(() => this.watchStatus(), immediate ? 25 : CORPUS_STATUS_WATCHER_INTERVAL)
    }

    // Asynchronously fetch tags categories
    fetchTagsCategories(serverUrl, corpusId)

    fetchCorpusStatus(serverUrl, corpusId).then(({ payload: { status } }) => {
      if (!status.corpus.ready) {
        if (status.hyphe.ram_left > 0 && status.hyphe.ports_left > 0) {
          // Resources available: start corpus
          showError({ id: ERROR_CORPUS_NOT_STARTED, messageId: 'error.corpus-not-started-starting', fatal: true })
          return startCorpus(serverUrl, corpusId, corpusPassword).catch((err) => {
            showError({ messageId: 'error.corpus-failed-starting', messageValues: { error: err.message }, fatal: true })
          }).then(() => {
            hideError()
            // Specific case: we want the next status query to happen ASAP
            return true
          })
        } else {
          // No resource, such a dramatic failure :(
          showError({ id: ERROR_SERVER_NO_RESOURCE, messageId: 'error.corpus-not-started-no-resource', fatal: true })
        }
      }
      // General case: wait before next status query
      return false
    }).then(
      // success: repeat immediately or delayed
      (immediate) => repeat(immediate),
      // error: repeat delayed
      () => repeat(false)
    )
  }

  render () {
    return <div className={ this.props.className }>{ this.props.children }</div>
  }
}

CorpusStatusWatcher.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  corpusId: PropTypes.string.isRequired,
  corpusPassword: PropTypes.string,
  fetchCorpusStatus: PropTypes.func,
  hideError: PropTypes.func,
  serverUrl: PropTypes.string.isRequired,
  showError: PropTypes.func,
  startCorpus: PropTypes.func,
  fetchTagsCategories: PropTypes.func,
  fetchTags: PropTypes.func
}

const mapStateToProps = ({ corpora, servers }) => ({
  corpusId: corpora.getIn(['selected', 'corpus_id']),
  corpusPassword: null, // TODO
  serverUrl: servers.selected.url
})

const mapDispatchToProps = {
  showError,
  hideError,
  fetchCorpusStatus,
  startCorpus,
  fetchTagsCategories,
  fetchTags
}

export default connect(mapStateToProps, mapDispatchToProps)(CorpusStatusWatcher)
