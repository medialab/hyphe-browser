import React from 'react'
import CorpusStatusIndicators from './CorpusStatusIndicators'
import CorpusLoadIndicators from './CorpusLoadIndicators'
import { Link } from 'react-router'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { showError, hideError } from './../../actions/browser'

  /*
  refreshStatus () {
    console.log('Get corpus status...')
    this.client('get_status', [this.props.corpus]).then((status) => {
      console.log('Got corpus status', status)
      if (!status.corpus.ready) {
        // TODO handle that globally
        console.error('Corpus not ready, starting...')
        this.client('start_corpus', [this.props.corpus, this.props.password || '']).then(() => {
          this.refreshStatus()
        })
      } else {
        this.setState({
          loading: false,
          status
        })
        setTimeout(() => this.refreshStatus(), 1000)
      }
    }).catch((err) => console.error(err)) // TODO emit error action
  }
  */

const Header = ({ loading, status, actions }) => {
  if (!status.ready) {
    actions.showError({ message: 'fake error', fatal: true })
    setTimeout(() => {
      actions.hideError()
    }, 2000)
  }

  return (
    <header className="toolbar toolbar-header">
      <div className="pull-left">
        <h1 className="title">{ loading ? '...' : status.corpus.corpus_id }</h1>
        { loading ? null : <CorpusStatusIndicators counters={ status.corpus.memory_structure.webentities } /> }
      </div>
      <div className="pull-right">
        <Link to="login"><span className="pull-right icon-disconnect icon icon-cancel-circled"></span></Link>
        { loading ? null : <CorpusLoadIndicators status={ status } /> }
      </div>
    </header>
  )
}

Header.propTypes = {
  actions: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
  loading: React.PropTypes.bool.isRequired,
  status: React.PropTypes.object
}

const mapStateToProps = ({ ui, corpora }) => ({
  loading: ui.loaders.corpus_status,
  status: corpora.selected.status
})

const mapDispatchToProps = {
  showError,
  hideError
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
