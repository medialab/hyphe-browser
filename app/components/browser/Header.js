import React from 'react'
import CorpusStatusIndicators from './CorpusStatusIndicators'
import CorpusLoadIndicators from './CorpusLoadIndicators'
import { Link } from 'react-router'

import { connect } from 'react-redux'
import { showError, hideError } from '../../actions/browser'
import { fetchCorpusStatus, startCorpus } from '../../actions/corpora'

class Header extends React.Component {

  watchStatus () {
    const { fetchCorpusStatus, showError, serverUrl, corpus } = this.props
    const repeat = () => {
      this.watchTimeout = setTimeout(() => this.watchStatus(), 1000)
    }

    return fetchCorpusStatus(serverUrl, corpus)
      .then((action) => {
        if (!action.payload.corpus.ready) {
          showError({ message: action.payload.corpus.message, fatal: true })
          return this.doStartCorpus()
        }
      })
      // Whatever happens next, repeat
      .then(repeat, repeat)
  }

  doStartCorpus () {
    const { hideError, startCorpus, serverUrl, corpus, corpusPassword } = this.props

    return startCorpus(serverUrl, corpus, corpusPassword)
      .then(() => {
        hideError()
        return this.watchStatus()
      })
      .catch((err) => {
        showError({ message: err.message, fatal: true })
      })
  }

  componentDidMount () {
    this.watchStatus()
  }

  componentWillUnmount () {
    // interrupt timeout
    clearTimeout(this.watchTimeout)
  }

  render () {
    const { status, corpus } = this.props
    const ready = status && status.corpus && status.corpus.ready

    return (
      <header className="toolbar toolbar-header">
        <div className="pull-left">
          <h1 className="title">{ corpus.corpus_id }</h1>
          { status && ready && <CorpusStatusIndicators counters={ status.corpus.memory_structure.webentities } /> }
        </div>
        <div className="pull-right">
          <Link to="login"><span className="pull-right icon-disconnect icon icon-cancel-circled"></span></Link>
          { status && ready && <CorpusLoadIndicators status={ status } /> }
        </div>
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
