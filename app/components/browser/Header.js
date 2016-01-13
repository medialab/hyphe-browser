import React from 'react'
import CorpusStatusIndicators from './CorpusStatusIndicators'
import CorpusLoadIndicators from './CorpusLoadIndicators'
import { Link } from 'react-router'
import { intlShape } from 'react-intl'

import { connect } from 'react-redux'

class Header extends React.Component {
  render () {
    const { status, corpus } = this.props
    const formatMessage = this.context.intl.formatMessage
    const ready = status && status.corpus && status.corpus.ready

    return (
      <header className="toolbar toolbar-header">
        { ready && <CorpusStatusIndicators counters={ status.corpus.memory_structure.webentities } /> }
        <h1 className="title">{ corpus.corpus_id }</h1>
        { ready && <CorpusLoadIndicators status={ status } /> }
        <Link className="disconnect-link" to="login" title={ formatMessage({ id: 'disconnect' }) }>
          <span className="pull-right icon-disconnect icon icon-cancel-circled" />
        </Link>
      </header>
    )
  }
}

Header.contextTypes = {
  intl: intlShape
}

Header.propTypes = {
  corpus: React.PropTypes.object.isRequired,
  status: React.PropTypes.object
}

const mapStateToProps = ({ corpora }) => ({
  corpus: corpora.selected,
  status: corpora.status
})

export default connect(mapStateToProps)(Header)
