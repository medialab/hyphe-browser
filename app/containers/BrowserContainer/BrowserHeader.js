import React from 'react'
import { Link } from 'react-router-dom'
import { intlShape } from 'react-intl'

import HeaderMetrics from './HeaderMetrics'
const BrowserHeader = ({
  corpus,
  status
}, { intl }) => {
  const { formatMessage } = intl

  return (
    <div className="browser-header">
      <div className="header-group header-group-main">
        <h1>{ corpus.name } <i aria-label="server is ok" className="server-status hint--right" /></h1>
        <HeaderMetrics status={ status } />
      </div>
      <div className="header-group header-group-aside">
        <ul className="header-buttons">
          <li><button className="btn is-active">{formatMessage({ id: 'corpus-header.browse-tab' })}</button></li>
          <li><button className="btn">{formatMessage({ id: 'corpus-header.hyphe-tab' })}</button></li>
          <li>
            <Link 
              to="/login"
              aria-label={ formatMessage({ id: 'tooltip.corpus-close' }) }
              className="btn hint--left"
            >
              <i className="ti-close" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

BrowserHeader.contextTypes = {
  intl: intlShape
}

export default BrowserHeader
