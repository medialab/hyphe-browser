import React from 'react'

import { connect } from 'react-redux'
import { showError, hideError } from '../actions/browser'
import { fetchCorpusStatus, startCorpus } from '../actions/corpora'
import { fetchTagsCategories } from '../actions/tags'
import { fetchTLDs } from '../actions/webentities'
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
    this.shouldInitializedCorpusData = true
    this.watchStatus()
  }

  componentWillUnmount () {
    if (this.watchTimeout) {
      clearTimeout(this.watchTimeout)
      this.watchTimeout = null
    }
  }

  // Data that should be fetched frequently to keep an eye on their evolution (status)
  watchStatus () {
    const { fetchCorpusStatus, showError, hideError, startCorpus, serverUrl, corpus, corpusPassword, fetchTagsCategories } = this.props

    const repeat = (immediate = false) => {
      this.watchTimeout = setTimeout(() => this.watchStatus(), immediate ? 0 : CORPUS_STATUS_WATCHER_INTERVAL)
    }

    // Asynchronously fetch tags categories
    fetchTagsCategories(serverUrl, corpus.corpus_id)

    fetchCorpusStatus(serverUrl, corpus).then(({ payload: { status } }) => {
      if (!status.corpus.ready) {
        if (status.hyphe.ram_left > 0 && status.hyphe.ports_left > 0) {
          // Resources available: start corpus
          showError({ id: ERROR_CORPUS_NOT_STARTED, messageId: 'error.corpus-not-started-starting', fatal: true })
          return startCorpus(serverUrl, corpus, corpusPassword).catch((err) => {
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
      } else {
        // Corpus is ready: initialize data
        if (this.shouldInitializedCorpusData) {
          this.shouldInitializedCorpusData = false
          this.initDataOnceStarted()
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

  // Data that must be initialized only once
  initDataOnceStarted () {
    const { fetchTLDs, showError, serverUrl, corpus } = this.props
    fetchTLDs(serverUrl, corpus.corpus_id)
    .catch(err => showError({ messageId: 'error.corpus-failed-fetching-tlds', messageValues: { error: err.message }, fatal: true }))
  }

  render () {
    return <div className={ this.props.className }>{ this.props.children }</div>
  }
}

CorpusStatusWatcher.propTypes = {
  corpus: React.PropTypes.object.isRequired,
  corpusPassword: React.PropTypes.string,
  serverUrl: React.PropTypes.string.isRequired,
  children: React.PropTypes.node,
  className: React.PropTypes.string,

  // actions
  fetchCorpusStatus: React.PropTypes.func,
  hideError: React.PropTypes.func,
  showError: React.PropTypes.func,
  startCorpus: React.PropTypes.func,
  fetchTagsCategories: React.PropTypes.func,
  fetchTLDs: React.PropTypes.func
}

const mapStateToProps = ({ corpora, servers }) => ({
  corpus: corpora.selected,
  corpusPassword: null, // TODO
  serverUrl: servers.selected.url
})

export default connect(mapStateToProps, {
  showError,
  hideError,
  fetchCorpusStatus,
  startCorpus,
  fetchTagsCategories,
  fetchTLDs
})(CorpusStatusWatcher)
