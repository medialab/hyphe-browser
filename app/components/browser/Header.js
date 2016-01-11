import React from 'react'
import CorpusStatusIndicators from './CorpusStatusIndicators'
import CorpusLoadIndicators from './CorpusLoadIndicators'
import jsonrpc from '../../utils/jsonrpc'

export default class CorpusHeader extends React.Component {

  constructor (props) {
    super(props)

    this.client = jsonrpc(props.uri)

    this.state = {
      loading: true,
      status: null
    }
  }

  componentDidMount () {
    this.refreshStatus()
  }

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

  render () {
    return (
      <header className="toolbar toolbar-header">
        <div className="pull-left">
          <h1 className="title">{ this.state.loading ? '...' : this.state.status.corpus.corpus_id }</h1>
          { this.state.loading ? null : <CorpusStatusIndicators counters={ this.state.status.corpus.memory_structure.webentities } /> }
        </div>
        <div className="pull-right">
          { this.state.loading ? null : <CorpusLoadIndicators status={ this.state.status } /> }
        </div>
      </header>
    )
  }
}

CorpusHeader.propTypes = {
  corpus: React.PropTypes.string.isRequired,
  password: React.PropTypes.string,
  uri: React.PropTypes.string.isRequired
}
