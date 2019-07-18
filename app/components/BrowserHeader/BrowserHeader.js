import './BrowserHeader.styl'

import React from 'react'
import { Link } from 'react-router-dom'
import { intlShape } from 'react-intl'
import cx from 'classnames'

import HeaderMetrics from './HeaderMetrics'

const BrowserHeader = ({
  corpus,
  status,
  browserMode,
  onSelectStack,
  onSetBrowserMode
}, { intl }) => {
  const { formatMessage } = intl
  const { ready_prev, ready } = status && status.corpus
  return (
    <div className="browser-header">
      <div className="header-group header-group-main">
        <h1>{ corpus.name }
          {ready && <i aria-label="server ok" className="server-status is-ready hint--right" />}
          {!ready && ready_prev && <i aria-label="server pending" className="server-status is-pending hint--right" />}
          {!ready && !ready_prev && <i aria-label="server error" className="server-status is-error hint--right" />} 
        </h1>
        <HeaderMetrics status={ status } onSelectStack={ onSelectStack } />
      </div>
      <div className="header-group header-group-aside">
        <ul className="header-buttons">
          <li onClick={ () => onSetBrowserMode('browse')}>
            <button className={ cx('btn', { 'is-active': browserMode === 'browse' }) }>
              {formatMessage({ id: 'corpus-header.browse-tab' })}
            </button>
          </li>
          <li onClick={ () => onSetBrowserMode('hyphe') }>
            <button className={ cx('btn', { 'is-active': browserMode === 'hyphe' }) }>
              {formatMessage({ id: 'corpus-header.hyphe-tab' })}
            </button>
          </li>
          <li>
            <Link 
              to="/login"
              aria-label={ formatMessage({ id: 'tooltip.corpus-close' }) }
              className="btn hint--bottom"
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
