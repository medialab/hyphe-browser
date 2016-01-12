import React from 'react'
import CorpusStatusIndicators from './CorpusStatusIndicators'
import CorpusLoadIndicators from './CorpusLoadIndicators'
import { Link } from 'react-router'

import { connect } from 'react-redux'
import { showError, hideError } from '../../actions/browser'
import { fetchCorpusStatus, startCorpus } from '../../actions/corpora'

class Header extends React.Component {

  watchStatus () {
    const { fetchCorpusStatus, showError, hideError, startCorpus, serverUrl, corpus, corpusPassword } = this.props
    const repeat = () => {
      this.watchTimeout = setTimeout(() => this.watchStatus(), 5000)
    }

    return fetchCorpusStatus(serverUrl, corpus)
      .then(({ payload: { status } }) => {
        if (!status.corpus.ready) {
          const { ram_left, ports_left } = status.hyphe
          const message = status.corpus.message + ((ram_left > 0 && ports_left > 0)
            ? '. Starting corpus now…'
            : '. No resource available to start corpus, please retry later.')
          showError({ message, fatal: true })

          if (ram_left > 0 && ports_left > 0) {
            return startCorpus(serverUrl, corpus, corpusPassword)
              .catch((err) => {
                showError({ message: err.message, fatal: true })
              })
          }
        } else {
          hideError()
        }
      })
      // Whatever happens next, repeat
      .then(repeat, repeat)
  }

  componentDidMount () {
    this.watchStatus()
  }

  componentWillUnmount () {
    clearTimeout(this.watchTimeout)
  }

  render () {
    const { status, corpus } = this.props
    const ready = status && status.corpus && status.corpus.ready

    return (
      <header className="toolbar toolbar-header">
        { status && ready && <CorpusStatusIndicators counters={ status.corpus.memory_structure.webentities } /> }
        <h1 className="title">{ corpus.corpus_id }</h1>
        { status && ready && <CorpusLoadIndicators status={ status } /> }
        <Link className="disconnect-link" to="login" title="Disconnect"><span className="pull-right icon-disconnect icon icon-cancel-circled" /></Link>
      </header>
    )
  }
}

Header.propTypes = {
  corpus: React.PropTypes.object.isRequired,
  corpusPassword: React.PropTypes.string,
  fetchCorpusStatus: React.PropTypes.func,
  hideError: React.PropTypes.func,
  serverUrl: React.PropTypes.string.isRequired,
  showError: React.PropTypes.func,
  startCorpus: React.PropTypes.func,
  status: React.PropTypes.object
}

const mapStateToProps = ({ corpora, servers }) => ({
  corpus: corpora.selected,
  corpusPassword: null, // TODO
  serverUrl: servers.selected.url,
  status: corpora.status
})

const mapDispatchToProps = {
  showError,
  hideError,
  fetchCorpusStatus,
  startCorpus
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
