import './BrowserLayout.styl'

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { FormattedMessage as T } from 'react-intl'

import StackListContainer from '../StackListContainer'
import WebentityBrowseContainer from '../WebentityBrowseContainer'
import HelpPin from '../../components/HelpPin'

import BrowserHeader from '../../components/BrowserHeader'
import BrowserTabsContainer from '../BrowserTabsContainer'
import HypheView from './HypheView'
import Spinner from '../../components/Spinner'

const BrowserLayout = ({
  webentity,
  corpus,
  status,
  instanceUrl,
  isLanding,
  // actions
  openTab,

  selectedStack,
}, { intl: { formatMessage } }) => {

  /**
   * lists management
   */
  const [asideMode, setAsideMode] = useState(isLanding ? 'stackList' : 'webeneityBrowse')
  const [browserMode, setBrowserMode] = useState('browse')

  const onSetAsideMode = mode => setAsideMode(mode)

  const handleOpenTabFromHyphe = (url) => {
    setBrowserMode('browse')
    openTab(url)
  }
  const hypheUrl = instanceUrl + '/#/project/' + corpus.corpus_id + '/network'

  const { ready } = status && status.corpus

  const formatStackName = stackName => {
    if (stackName === 'DISCOVERED') {
      return 'PROSPECTION'
    }
    return stackName
  }

  return (
    <div className="browser-layout">
      <BrowserHeader
        corpus={corpus}
        status={status}
        browserMode={browserMode}
        onSetBrowserMode={setBrowserMode} />
      {ready ?
        <div
          className="browser-main-container"
          style={browserMode === 'browse' ? {} : { display: 'none' }}>
          <aside className="browser-column browser-aside-column">
            <ul className="aside-header switch-mode-container">
              <li><button onClick={() => onSetAsideMode('stackList')} className={cx('mode-btn', { 'is-active': (asideMode === 'stackList' || isLanding) })}>
                <span className="switch-mode-title">
                  <span
                    className={cx('current-stack-indicator hint--right', selectedStack)}
                    aria-label={formatMessage({ id: 'overview-location' }, { status: formatStackName(selectedStack) })}
                  >
                      <i className="ti-menu" />
                  </span>
                  <T id="sidebar.inquiry-overview" />

                  <HelpPin>{formatMessage({ id: "sidebar.inquiry-overview-help" })}</HelpPin></span></button>
              </li>
              <li>
                <button disabled={isLanding} onClick={() => onSetAsideMode('webentityBrowse')} className={cx('mode-btn', { 'is-active': (asideMode === 'webentityBrowse' && !isLanding) })}>
                  <span className="switch-mode-title">
                    <span
                      className={cx('current-stack-indicator hint--bottom', webentity && webentity.status)}
                      aria-label={formatMessage({ id: 'currently-browsed-webentity-location' }, { status: formatStackName(webentity && webentity.status) })}
                    >
                      <i className="ti-desktop" />
                    </span>
                    <T id="sidebar.browsed-webentity" />

                    <HelpPin>{formatMessage({ id: "sidebar.browsed-webentity-help" })}</HelpPin>
                  </span>
                </button>
              </li>
            </ul>
            {asideMode === 'webentityBrowse' && <div className="aside-content" style={(asideMode === 'webentityBrowse' && !isLanding) ? {} : { display: 'none' }}>
              <WebentityBrowseContainer />
            </div>}
            <div className="aside-content" style={(asideMode === 'stackList' || isLanding) ? {} : { display: 'none' }}>
              <StackListContainer
                setAsideMode={onSetAsideMode}
              />
            </div>
          </aside>
          <section className="browser-column browser-main-column">
            <BrowserTabsContainer />
          </section>
        </div> :
        <div className="spinner-container">
          <Spinner />
        </div>
      }

      <HypheView
        style={browserMode === 'hyphe' ? {} : { display: 'none' }}
        isHypheView={browserMode === 'hyphe'}
        url={hypheUrl} onOpenTabFromHyphe={handleOpenTabFromHyphe} />
    </div>
  )
}

BrowserLayout.contextTypes = {
  intl: PropTypes.object
}

export default BrowserLayout