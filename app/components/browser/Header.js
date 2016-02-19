import React from 'react'
import { corpusShape, corpusStatusShape } from '../../types'
import CorpusStatusIndicators from './CorpusStatusIndicators'
import CorpusLoadIndicators from './CorpusLoadIndicators'
import { Link } from 'react-router'
import { intlShape } from 'react-intl'

import { connect } from 'react-redux'

class Header extends React.Component {
  render () {
    const { status, corpus } = this.props
    const formatMessage = this.context.intl.formatMessage
    const ready = status && status.getIn(['corpus', 'ready'])

    return (
      <header className="toolbar toolbar-header">
        { ready && <CorpusStatusIndicators counters={ status.getIn(['corpus', 'memory_structure', 'webentities']) } /> }
        <h1 className="title">{ corpus.get('name') }</h1>
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
  corpus: corpusShape,
  status: corpusStatusShape
}

const mapStateToProps = ({ corpora }) => ({
  corpus: corpora.get('selected'),
  status: corpora.get('status')
})

export default connect(mapStateToProps)(Header)
