import React from 'react'

import { connect } from 'react-redux'
import { showError, hideError } from '../actions/browser'
import { fetchCorpusStatus, startCorpus } from '../actions/corpora'

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
    const { fetchCorpusStatus, showError, hideError, startCorpus, serverUrl, corpus, corpusPassword } = this.props

    const repeat = () => {
      this.watchTimeout = setTimeout(() => this.watchStatus(), 5000)
    }

    fetchCorpusStatus(serverUrl, corpus).then(({ payload: { status } }) => {
      if (!status.corpus.ready) {
        const { ram_left, ports_left } = status.hyphe
        const message = status.corpus.message + ((ram_left > 0 && ports_left > 0)
          ? '. Starting corpus now…'
          : '. No resource available to start corpus, please retry later.')
        showError({ message, fatal: true })

        if (ram_left > 0 && ports_left > 0) {
          return startCorpus(serverUrl, corpus, corpusPassword).catch((err) => {
            showError({ message: err.message, fatal: true })
          })
        }
      } else {
        hideError()
      }
    }).then(repeat, repeat) // Whatever happens next, repeat
  }

  render () {
    return <div className={ this.props.className }>{ this.props.children }</div>
  }
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
