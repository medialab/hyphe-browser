import React from 'react'
import CorpusStatusIndicators from './CorpusStatusIndicators'
import { intlShape } from 'react-intl'

import { connect } from 'react-redux'

class Header extends React.Component {
  render () {
    const { status, corpus } = this.props
    const ready = status && status.corpus && status.corpus.ready

    return (
      <header className="toolbar toolbar-header">
        { ready && <CorpusStatusIndicators counters={ status.corpus.memory_structure.webentities } /> }
        <h1 className="title">{ corpus.name }</h1>
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
