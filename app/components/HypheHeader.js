// black stripe at the top of the app
import './../css/hyphe-header'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { intlShape } from 'react-intl'

class HypheHeader extends React.Component {
  render () {
    const { formatMessage } = this.context.intl
    const { corpus } = this.props

    if (!corpus) return null

    return (
      <header className="hyphe-header">
        <Link className="disconnection hint--left" to="login" aria-label={ formatMessage({ id: 'tooltip.corpus-close' }) }>
          <span className="ti-close"></span>
        </Link>
        { corpus.name }
      </header>
    )
  }
}

HypheHeader.contextTypes = {
  intl: intlShape
}

HypheHeader.propTypes = {
  corpus: PropTypes.object,
}

const mapStateToProps = ({ corpora }) => ({
  corpus: corpora.selected
})

export default connect(mapStateToProps)(HypheHeader)

