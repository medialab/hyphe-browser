// black stripe at the top of the app
import '../css/hyphe-header'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { intlShape } from 'react-intl'

class Header extends React.Component {
  render () {
    const { formatMessage } = this.context.intl
    const { corpus } = this.props

    if (!corpus) return null

    return (
      <header className="hyphe-header">
        <Link className="disconnection hint--bottom-left" to="login" aria-label={ formatMessage({ id: 'tooltip.corpus-close' }) }>
          <span className="ti-close"></span>
        </Link>
        { corpus.name }
      </header>
    )
  }
}

Header.contextTypes = {
  intl: intlShape
}

Header.propTypes = {
  corpus: PropTypes.object,
}

export default Header
