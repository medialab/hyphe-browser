import './BrowserHeader.styl'

import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import { useIntl } from 'react-intl'

import { ellipseStr } from '../../utils/misc'

import HeaderMetrics from './HeaderMetrics'

const BrowserHeader = ({
  corpus,
  status,
  browserMode,
  onSetBrowserMode
}) => {
  const { formatMessage } = useIntl()
  const { ready_prev, ready } = status && status.corpus
  return (
    <div className="browser-header">
      <div className="header-group header-group-main">
        <h1 aria-label={ corpus.name }>{ ellipseStr(corpus.name, 42) }
          {ready && <i aria-label={ formatMessage({ id: 'server-ok' }) } className="server-status is-ready hint--bottom-right" />}
          {!ready && ready_prev && <i aria-label={ formatMessage({ id: 'server-pending' }) } className="server-status is-pending hint--bottom-right" />}
          {!ready && !ready_prev && <i aria-label={ formatMessage({ id: 'server-error' }) } className="server-status is-error hint--bottom-right" />} 
        </h1>
        {status && status.corpus && status.corpus.ready && <HeaderMetrics status={ status } />}
      </div>
      
      <div className="header-group header-group-aside">
        <ul className="header-buttons">
          <li onClick={ () => onSetBrowserMode('browse') }>
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
              className="btn hint--bottom-left"
            >
              <i className="ti-close" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default BrowserHeader
