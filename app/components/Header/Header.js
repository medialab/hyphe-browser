// black stripe at the top of the app
import './header.styl'

import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { intlShape } from 'react-intl'
import CorpusLoadIndicators from '../CorpusLoadIndicators'

const Header = ({ corpus, status }, { intl })  => {
  if (!corpus) return null
  const { formatMessage } = intl
  const ready = status && status.corpus && status.corpus.ready
  return (
    <header className="hyphe-header">
      <span className="header-left">
        { ready && <CorpusLoadIndicators status={ status } /> }
      </span>
      <span className="header-center">{ corpus.name }</span>
      <span className="header-right">
        <Link className="disconnection hint--bottom-left" to="login" aria-label={ formatMessage({ id: 'tooltip.corpus-close' }) }>
          <span className="ti-close" />
        </Link>
      </span>
    </header>
  )
}

Header.contextTypes = {
  intl: intlShape
}

Header.propTypes = {
  corpus: PropTypes.object,
  status: PropTypes.object
}

export default Header
