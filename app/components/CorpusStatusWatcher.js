import React from 'react'

import { connect } from 'react-redux'
import { showError, hideError } from '../actions/browser'
import { fetchCorpusStatus, startCorpus } from '../actions/corpora'
import { intlShape } from 'react-intl'
import { CORPUS_STATUS_WATCHER_INTERVAL } from '../constants'

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
    const { intl: { formatMessage } } = this.context
    const { fetchCorpusStatus, showError, hideError, startCorpus, serverUrl, corpus, corpusPassword } = this.props

    const repeat = () => {
      this.watchTimeout = setTimeout(() => this.watchStatus(), CORPUS_STATUS_WATCHER_INTERVAL)
    }

    fetchCorpusStatus(serverUrl, corpus).then(({ payload: { status } }) => {
      if (!status.corpus.ready) {
        if (status.hyphe.ram_left > 0 && status.hyphe.ports_left > 0) {
          // Resources available: start corpus
          showError({ message: formatMessage({ id: 'corpus-not-started-starting' }), fatal: true })
          return startCorpus(serverUrl, corpus, corpusPassword).catch((err) => {
            showError({ message: err.message, fatal: true })
          })
        } else {
          // No resource, such a dramatic failure :(
          showError({ message: formatMessage({ id: 'corpus-not-started-no-resource' }), fatal: true })
        }
      } else {
        // Everything is awesome
        hideError()
      }
    }).then(repeat, repeat) // Whatever happens next, repeat
  }

  render () {
    return <div className={ this.props.className }>{ this.props.children }</div>
  }
}

CorpusStatusWatcher.contextTypes = {
  intl: intlShape
}

CorpusStatusWatcher.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.string,
  corpus: React.PropTypes.object.isRequired,
  corpusPassword: React.PropTypes.string,
  fetchCorpusStatus: React.PropTypes.func,
  hideError: React.PropTypes.func,
  serverUrl: React.PropTypes.string.isRequired,
  showError: React.PropTypes.func,
  startCorpus: React.PropTypes.func
}

const mapStateToProps = ({ corpora, servers }) => ({
  corpus: corpora.selected,
  corpusPassword: null, // TODO
  serverUrl: servers.selected.url
})

const mapDispatchToProps = {
  showError,
  hideError,
  fetchCorpusStatus,
  startCorpus
}

export default connect(mapStateToProps, mapDispatchToProps)(CorpusStatusWatcher)
