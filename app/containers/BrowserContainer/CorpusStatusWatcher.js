import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'react-redux'

import { showError, hideError } from '../../actions/browser'
import { fetchCorpusStatus, startCorpus } from '../../actions/corpora'
import { fetchTagsCategories, fetchTags } from '../../actions/tags'
import { fetchTLDs } from '../../actions/webentities'
import { fetchStack } from '../../actions/stacks'
import { push } from 'connected-react-router'

import {
  CORPUS_STATUS_WATCHER_INTERVAL,
  ERROR_CORPUS_NOT_STARTED
} from '../../constants'

class CorpusStatusWatcher extends React.Component {

  constructor (props) {
    super(props)

    this.watchTimeout = null
    this.unmounted = false
  }

  componentDidMount () {
    this.shouldInitializedCorpusData = true
    this.watchStatus()
  }

  componentWillUnmount () {
    this.unmounted = true
    if (this.watchTimeout) {
      clearTimeout(this.watchTimeout)
      this.watchTimeout = null
    }
  }

  // Data that should be fetched frequently to keep an eye on their evolution (status)
  watchStatus () {
    const { push, fetchCorpusStatus, showError, hideError, startCorpus, serverUrl, corpus, corpusPassword, fetchTagsCategories, fetchTags } = this.props

    const repeat = (immediate = false) => {
      if (this.unmounted) {
        return
      }
      this.watchTimeout = setTimeout(() => this.watchStatus(), immediate ? 1000 : CORPUS_STATUS_WATCHER_INTERVAL)
    }

    // Asynchronously fetch tags categories
    fetchTagsCategories(serverUrl, corpus.corpus_id)

    fetchTags(serverUrl, corpus.corpus_id)

    fetchCorpusStatus(serverUrl, corpus).then(({ payload: { status } }) => {
      if (status.corpus.status === 'missing') {
        return push('/login')
      }
      if (!status.corpus.ready) {
        // TODO: test number of corpus started ?
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
    const { fetchTLDs, fetchStack, showError, serverUrl, corpus } = this.props
    fetchStack({ serverUrl, corpusId: corpus.corpus_id, stack: 'DISCOVERED' })

    fetchTLDs({ serverUrl, corpusId: corpus.corpus_id })
      .catch(err => showError({ messageId: 'error.corpus-failed-fetching-tlds', messageValues: { error: err.message }, fatal: true }))
  }

  render () {
    return this.props.children
  }
}

CorpusStatusWatcher.propTypes = {
  corpus: PropTypes.object.isRequired,
  corpusPassword: PropTypes.string,
  status: PropTypes.object.isRequired,
  serverUrl: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,

  // actions
  fetchCorpusStatus: PropTypes.func,
  hideError: PropTypes.func,
  showError: PropTypes.func,
  startCorpus: PropTypes.func,
  fetchTagsCategories: PropTypes.func,
  fetchTags: PropTypes.func,
  fetchStack: PropTypes.func,
  fetchTLDs: PropTypes.func
}

const mapStateToProps = ({ corpora, servers }) => ({
  corpus: corpora.selected,
  status: corpora.status,
  corpusPassword: null, // TODO
  serverUrl: servers.selected.url
})

export default connect(mapStateToProps, {
  showError,
  hideError,
  fetchCorpusStatus,
  startCorpus,
  fetchTagsCategories,
  fetchTags,
  fetchStack,
  fetchTLDs,
  push
})(CorpusStatusWatcher)
