import './BrowserHeader.styl'

import React from 'react'
import { Link } from 'react-router-dom'
import { intlShape } from 'react-intl'
import cx from 'classnames'

import {ellipseStr} from '../../utils/misc'

import HeaderMetrics from './HeaderMetrics'

const BrowserHeader = ({
  corpus,
  status,
  browserMode,
  onSetBrowserMode
}, { intl }) => {
  const { formatMessage } = intl
  const { ready_prev, ready } = status && status.corpus
  return (
    <div className="browser-header">
      <div className="header-group header-group-main">
        <h1 title={corpus.name}>{ ellipseStr(corpus.name, 42) }
          {ready && <i aria-label={formatMessage({id: 'server-ok'})} className="server-status is-ready hint--right" />}
          {!ready && ready_prev && <i aria-label={formatMessage({id: 'server-pending'})} className="server-status is-pending hint--right" />}
          {!ready && !ready_prev && <i aria-label={formatMessage({id: 'server-error'})} className="server-status is-error hint--right" />} 
        </h1>
        <HeaderMetrics status={ status } />
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
          <li className="close-corpus">
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
